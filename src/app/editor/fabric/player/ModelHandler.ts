import fabric from '@app/editor/fabric';
import { PlayerOptions } from '@app/editor/fabric/player';
import { AnyObject, CanvasTrack, ImageTrack, PdfTrack, VideoTrack, YoutubeTrack, WebTrack } from '@app/editor/fabric/player/types';

import { environment } from '@env/environment';
// const environment = { cdnUrl: 'https://images.wallpaperscraft.ru/image/' }; // @TODO: for test purpouses

export default class ModelHandler {
    static handleCanvas(model: AnyObject, originalCanvasElement: HTMLCanvasElement, options: PlayerOptions): Promise<CanvasTrack> {
        if ('properties' in model) {
            const transition = model.transition;
            const duration = model.duration;

            if (typeof model.properties.content === 'string') {
                model = JSON.parse(model.properties.content);
            } else {
                model = model.properties.content;
            }

            model.transition = transition;
            model.general.duration = duration;
        }

        if (model.general.version && model.general.version > fabric.settings.version) {
            return Promise.reject({ outdatedVersion: true });
        }

        const canvasElement: HTMLCanvasElement = originalCanvasElement.cloneNode() as HTMLCanvasElement;
        const subtype = model.general.subtype.toLowerCase();
        const canvas = new fabric.Canvas(canvasElement, { interactive: false });
        canvas.stopRenderLoop();
        fabric.util.setStyle(canvas.upperCanvasEl, { pointerEvents: 'none' });

        let mouseMoveEvent: any;

        canvasElement.addEventListener('mousemove', (e) => { mouseMoveEvent = e; });

        canvasElement.addEventListener('click', (e) => {
            const target = canvas.findTarget(e, true);

            if (!target || !target.url || !options.interactive) { return; }

            window.location.href = target.url;
        });

        canvas.on('after:render', () => {
            if (!mouseMoveEvent) { return; }
            const target = canvas.findTarget(mouseMoveEvent, true);

            if (!target || !target.url) {
                canvas.getElement().style.cursor = 'auto';
                return;
            }

            canvas.getElement().style.cursor = 'pointer';
        });

        if (['hotspot', 'survey'].includes(subtype)) {
            canvas
                .setWidth(fabric.settings.resolutions.portait.width)
                .setHeight(fabric.settings.resolutions.portait.height);
        } else {
            canvas
                .setWidth(fabric.settings.resolutions.landscape.width)
                .setHeight(fabric.settings.resolutions.landscape.height);
        }

        model.objects = model.objects.filter(object => !['#_grid', '#_template'].includes(object.id));

        const track = Object.assign(new CanvasTrack(), {
            model,
            canvas,
            durationMs: model.general.duration,
            backgroundColor: model.backgroundColor,
        });

        return new Promise((resolve, reject) => {
            canvas.loadPlayerFromJSON(
                model,
                () => {
                    track.objectsInitialProperties = canvas.getObjects().map(object => object.toObject());
                    track.containerElement = canvas.getElement().parentElement;

                    if (!options.interactive) {
                        [].forEach.call(track.containerElement.querySelectorAll('form, button'), (element) => {
                            element.setAttribute('onsubmit', 'return false;');
                        });
                    } else {
                        [].forEach.call(track.containerElement.querySelectorAll('button'), (element) => {
                            if (element.dataset.formSubmit && options.formAction) {
                                element.setAttribute('formaction', options.formAction);
                            }

                            if (element.dataset.socialName && options[`${element.dataset.socialName}Action`]) {
                                element.setAttribute('formaction', options[`${element.dataset.socialName}Action`]);
                            }
                        });
                    }

                    resolve(track);
                },
                (objectRaw, object, error) => {
                    if (error) { reject(`Error loading canvas object`); }
                },
            );
        });
    }

    static handleImage(model: AnyObject, options: PlayerOptions): Promise<ImageTrack> {
        const fileId = model.fileId || model.properties.fileId;
        const backgroundColor = model.color || model.properties.color;
        const src = model.preview;
        const img = fabric.util.createImage();
        const div = document.createElement('div');
        div.classList.add('player-image');

        fabric.util.setStyle(div, {
            width: '100%',
            height: '100%',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('${src}')`,
        });

        fabric.util.setStyle(img, { width: '100%', height: 'auto' });

        const track = Object.assign(new ImageTrack(), {
            model,
            containerElement: div,
            durationMs: model.duration,
            backgroundColor,
        });

        return new Promise((resolve, reject) => {
            img.onload = () => { img.onload = img.onerror = undefined; resolve(track); };
            img.onerror = () => reject(`Error loading image ${src}`);
            img.src = src;

            setTimeout(() => reject(`Error loading image ${src}`), options.resoureceLoadTimeoutSec * 1000);
        });
    }

    static handleAudio(model: AnyObject, options: PlayerOptions): Promise<ImageTrack> {
        const src = model.properties.preview;
        const img = fabric.util.createImage();
        fabric.util.setStyle(img, { width: '100%', height: 'auto' });

        const track = new ImageTrack({ model, containerElement: img, durationMs: model.duration });

        return new Promise((resolve, reject) => {
            img.onload = () => { img.onload = img.onerror = undefined; resolve(track); };
            img.onerror = () => reject(`Error loading image ${src}`);
            img.src = src;

            setTimeout(() => reject(`Error loading image ${src}`), options.resoureceLoadTimeoutSec * 1000);
        });
    }

    static handlePdf(model: AnyObject, optins: PlayerOptions): Promise<PdfTrack> {
        const compat = model.compat || model.properties.compat;
        const backgroundColor = model.color || model.properties.color;
        const resourcesIds = compat.compatIds;
        const container = fabric.util.makeElement('div');
        const track = Object.assign(new PdfTrack(), {
            model,
            containerElement: container,
            durationMs: model.duration,
            images: [],
            backgroundColor,
        });

        fabric.util.setStyle(container, { width: '100%', height: '100%' });

        return new Promise((resolve, reject) => {
            let loadImagesChain: Promise<any> = Promise.resolve();
            let loadedImages: HTMLImageElement[] = [];
            const resourcesIdsToLoad = resourcesIds.slice();

            while (resourcesIdsToLoad.length) {
                const batchResourcesIdsToLoad = resourcesIdsToLoad.splice(0, 5);

                loadImagesChain = loadImagesChain.then(() => {
                    return Promise
                        .all<HTMLImageElement>(batchResourcesIdsToLoad.map(resourceId =>
                            fabric.util.loadImagePromise(model.preview + resourceId)
                        ))
                        .then(images => { loadedImages = loadedImages.concat(images); });
                });
            }

            loadImagesChain
                .then(() => {
                    track.images = loadedImages.map(image => {
                        const div = document.createElement('div');
                        div.classList.add('player-image');
                        fabric.util.setStyle(div, {
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundImage: `url('${image.src}')`,
                        });

                        return div;
                    });
                    resolve(track);
                })
                .catch(error => reject(error));
        });
    }

    static handleVideo(model: AnyObject, options: PlayerOptions): Promise<VideoTrack> {
        const fileId = model.fileId || model.properties.fileId;
        const backgroundColor = model.color || model.properties.color;
        const src = model.preview;
        // @TODO: for testing purpose
        // const src = 'https://www.w3schools.com/html/mov_bbb.mp4';
        const video = fabric.util.createVideo();
        fabric.util.setStyle(video, { width: '100%', height: 'auto' });

        const track = Object.assign(new VideoTrack(), {
            model,
            containerElement: video,
            durationMs: model.duration,
            backgroundColor,
        });

        return new Promise((resolve, reject) => {
            const iOSEventTimeout = 10;
            const hackTimeoutId = setTimeout(loadHandler, iOSEventTimeout * 1000);
            function loadHandler() {
                clearTimeout(hackTimeoutId);
                video.oncanplaythrough = video.onerror = undefined;
                resolve(track);
            }
            video.oncanplaythrough = loadHandler;
            video.onerror = (e) => {
                const { code, message } = <any>video.error;
                reject(`Error loading video: ${message}`);
            };
            video.src = src;
            // If the video is in the cache of the browser,
            // the 'canplaythrough' event might have been triggered
            // before we registered the event handler.
            if (video.readyState > 3) {
                loadHandler();
            }
            setTimeout(() => reject(`Error loading video ${src}`), options.resoureceLoadTimeoutSec * 1000);
        });
    }

    static handleYoutube(model: AnyObject, options: PlayerOptions): Promise<YoutubeTrack> {
        let url = '';
        if (model.content) {
            url = model.content.url;
        } else if (model.properties && model.properties.content) {
            url = model.properties.content.url;
        }

        const videoId = fabric.util.parseYoutubeId(url);
        const videoUrl = `${url}?controls=0&iv_load_policy=3&fs=0&disablekb=1&loop=1&autoplay=0&rel=0` +
            `&playsinline=1&showinfo=0&modestbranding=1&mute=1&enablejsapi=1&playlist=${videoId}`;

        const previewSrc = `https://img.youtube.com/vi/${videoId}/0.jpg`;

        const container = document.createElement('div');
        const img = fabric.util.createImage();
        const iframe = fabric.util.makeElement('iframe', { src: videoUrl, allow: 'autoplay' });

        container.appendChild(img);
        container.appendChild(iframe);

        fabric.util.setStyle(container, { backgroundColor: 'transparent', width: '100%', height: '100%' });
        fabric.util.setStyle(img, { width: '100%', height: 'auto' });
        fabric.util.setStyle(iframe, { width: '100%', height: '100%', border: 'none', pointerEvents: 'none' });

        const track = new YoutubeTrack({
            model,
            containerElement: iframe,
            imageElement: img,
            iframeElement: iframe,
            durationMs: model.duration,
        });

        return Promise.resolve(track);
    }

    static handleWeb(model: AnyObject, options: PlayerOptions): Promise<WebTrack> {
        let url = '';
        if (model.content) {
            url = model.content.url;
        } else if (model.properties && model.properties.content) {
            url = model.properties.content.url;
        }

        const iframe = fabric.util.makeElement('iframe', { src: url });

        fabric.util.setStyle(iframe, { width: '100%', height: '100%', border: 'none' });

        const track = new WebTrack({ model, containerElement: iframe, durationMs: model.duration });

        return Promise.resolve(track);
    }
}
