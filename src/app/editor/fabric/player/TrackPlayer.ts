import fabric from '../';
import { AudioTrack, CanvasTrack, ImageTrack, PdfTrack, VideoTrack, YoutubeTrack, AsyncOperationToken, WebTrack } from './types';
import { Animation } from '../animations';
import { PlayerOptions } from '../player';

export default class TrackPlayer {
    static setupFirstFrameOnCanvasTrack(track: CanvasTrack, options: PlayerOptions): Promise<void> {
        const canvas = track.canvas;

        canvas.getObjects().forEach((object, i) => object.setOptions(track.objectsInitialProperties[i]));

        if (options.skipAnimations) { return Promise.resolve(); }

        this.proceedCanvasAnimations(canvas);
        return this.stopCanvas(canvas);
    }

    static setupFirstFrameOnPdfTrack(track: PdfTrack): Promise<void> {
        [].forEach.call(track.containerElement.children, (image, i) => { image.hidden = i > 0; });

        return Promise.resolve();
    }

    static proceedResourceAnimation(element: HTMLElement, animationType: string): AsyncOperationToken {
        const animations = {
            animation: 'animationend',
            OAnimation: 'oAnimationEnd',
            MozAnimation: 'mozAnimationEnd',
            WebkitAnimation: 'webkitAnimationEnd',
        };

        const animationKey = Object.keys(animations).find(key => element.style[key] !== undefined);
        const animationEvent = animations[animationKey];

        let promise: Promise<void>;
        let rejection: Function;

        promise = new Promise((resolve, reject) => {
            element.addEventListener(animationEvent, function animationEndHandler() {
                element.removeEventListener(animationEvent, animationEndHandler);
                element.classList.remove('animated', animationType);
                resolve();
            });

            element.classList.add('animated', animationType);

            rejection = reject;
        });

        return new AsyncOperationToken({ promise, reject: rejection });
    }

    static playCanvas(track: CanvasTrack, options: PlayerOptions): AsyncOperationToken {
        const slideSettings = track.model.general;

        track.canvas.getObjects().forEach((object, i) => {
            object.setOptions(track.objectsInitialProperties[i]);
            object.set('isAnimationAborted', false);
        });

        if (!options.skipAnimations) {
            this.proceedCanvasAnimations(track.canvas);
        }
        this.startCanvas(track.canvas);

        const duration = track.durationMs;
        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(
                () => this.stopCanvas(track.canvas).then(() => resolve()),
                duration
            );
            if (!duration) { clearTimeout(timeoutId); }


            token.reject = (error?: any) => { clearTimeout(timeoutId); reject(error); };
        });

        return token;
    }

    static playImage(track: ImageTrack): AsyncOperationToken {
        const duration = track.durationMs;
        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, duration);
            if (!duration) { clearTimeout(timeoutId); }
            token.reject = (error?: any) => { clearTimeout(timeoutId); reject(error); };
        });

        return token;
    }

    // @TODO: simplified work with audio for phase 1
    static playAudio(track: AudioTrack): AsyncOperationToken {
        const duration = track.durationMs;
        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, duration);
            if (!duration) { clearTimeout(timeoutId); }
            token.reject = (error?: any) => { clearTimeout(timeoutId); reject(error); };
        });

        return token;
    }

    static playPdf(track: PdfTrack): AsyncOperationToken {
        const duration = track.durationMs;
        const container = track.containerElement;

        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            let turnPageTimeoutId;
            const onePageDuration = duration / track.images.length;
            let currentImageIndex = 0;

            function pagesTurning() {
                const currentImage = track.images[currentImageIndex];
                if (!currentImage) {
                    resolve();
                    return;
                }

                if (container.firstElementChild) {
                    container.removeChild(container.firstElementChild);
                }

                container.appendChild(currentImage);
                currentImageIndex++;

                turnPageTimeoutId = setTimeout(() => pagesTurning(), onePageDuration);
            }

            pagesTurning();

            token.reject = (error?: any) => {
                clearTimeout(turnPageTimeoutId);
                reject(error);
            };
        });

        return token;
    }

    static playVideo(track: VideoTrack): AsyncOperationToken {
        track.containerElement.play();

        const duration = track.durationMs;
        const token = new AsyncOperationToken();

        token.promise = new Promise<void>((resolve, reject) => {
            track.containerElement.onerror = () => {
                const { code, message } = <any>track.containerElement.error;
                reject(`Error playing video: ${message}`);
            };

            const timeoutId = setTimeout(
                () => {
                    track.containerElement.pause();
                    track.containerElement.currentTime = 0;
                    resolve();
                },
                duration
            );

            if (!duration) { clearTimeout(timeoutId); }

            token.reject = (error?: any) => { clearTimeout(timeoutId); reject(error); };
        });

        return token;
    }

    static playYoutube(track: YoutubeTrack): AsyncOperationToken {
        const duration = track.durationMs;
        const { containerElement, iframeElement, imageElement, player } = track;

        player.seekTo(0);
        player.playVideo();

        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(
                () => {
                    player.pauseVideo();
                    player.seekTo(0);
                    resolve();
                },
                duration
            );

            if (!duration) { clearTimeout(timeoutId); }

            token.reject = (error?: any) => { clearTimeout(timeoutId); reject(error); };
        });

        return token;
    }

    static playWeb(track: WebTrack): AsyncOperationToken {
        const duration = track.durationMs;
        const { containerElement } = track;
        const token = new AsyncOperationToken();

        token.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => { resolve(); }, duration);

            if (!duration) { clearTimeout(timeoutId); }

            token.reject = (error?: any) => { reject(error); };
        });

        return token;

    }

    static startCanvas(canvas: fabric.Canvas): void {
        canvas.startRenderLoop();

        canvas.getObjects().forEach((object) => {
            // @ts-ignore
            object.play && object.play();
            object.set('isAnimationAborted', false);
        });
    }

    static stopCanvas(canvas: fabric.Canvas): Promise<void> {
        canvas.stopRenderLoop();

        canvas.getObjects().forEach(object => object.set('isAnimationAborted', true));

        return new Promise(resolve => fabric.util.requestAnimFrame(resolve))
            .then(() => {
                canvas.renderAll();
                // @ts-ignore
                canvas.getObjects().forEach(object => object.stop && object.stop());
            });
    }

    static proceedCanvasAnimations(canvas: fabric.Canvas) {
        canvas.getObjects().forEach((object: fabric.Object) => {
            const animationStart = object.animations.start ? { ...object.animations.start } : null;
            const animationEnd = object.animations.end ? { ...object.animations.end } : null;
            const animationsToPlay = this.filterCanvasAnimationsToPlay([animationStart, animationEnd]);

            this.canvasAnimationLoop(object, animationsToPlay);
        });
    }

    static filterCanvasAnimationsToPlay(animations: Animation[]) {
        return animations.filter(animation => animation && (animation.repetition === null || animation.repetition > 0));
    }

    static canvasAnimationLoop(object: fabric.Object, animationsToPlay: Animation[]) {
        if (!animationsToPlay.length) { return; }
        // console.debug(`Start new animation queue: ${Math.round(performance.now() / 100) / 10}`);

        const objectInitial = { ...object };
        let animationQueue;

        animationsToPlay.forEach((animation) => {
            animation.repetition !== null && animation.repetition--;

            animationQueue = animationQueue
                ? animationQueue.then(() => fabric.animations.play(object, animation))
                : fabric.animations.play(object, animation);

            animationQueue = animationQueue.then(() => fabric.animations.delay(object, animation.startTime));
        });

        const nextAnimationsToPlay = this.filterCanvasAnimationsToPlay(animationsToPlay);

        animationQueue
            .then(() => {
                nextAnimationsToPlay.length && object.setOptions(objectInitial);
                this.canvasAnimationLoop(object, nextAnimationsToPlay);
            })
            .catch(() => { });
        // .catch(message => console.debug(`${message}: ${Math.round(performance.now() / 100) / 10}`));
    }
}
