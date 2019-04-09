import { fabric } from 'fabric';
import { IVideoOptions } from '../';

class VideoClassPrototype extends fabric.Object { }

Object.getOwnPropertyNames(fabric.Image.prototype).forEach(prop => {
    (<any>VideoClassPrototype).prototype[prop] = (<any>fabric.Image).prototype[prop];
});

Object.assign(VideoClassPrototype.prototype, { type: 'video' });

export default class Video extends (VideoClassPrototype as { new(videoElement: HTMLVideoElement, options: IVideoOptions): fabric.Object }) {
    src: string;
    _elementClone: HTMLVideoElement;

    static fromObject(object: any, callback: (video: Video | null, error: boolean) => void) {
        Video.fromPreview(object.previewUrl, (video: Video, error: boolean) => {
            if (error) {
                callback(null, true);
                return;
            }

            video.setOptions(object);
            callback(video, false);
        });
    }

    static videoFromObject(object: any, callback: (video: Video | null, error: boolean) => void, options?: IVideoOptions) {
        Video.fromVideo(object.src, (video: Video, error: boolean) => {
            if (error) {
                callback(null, true);
                return;
            }

            video.setOptions(object);

            // @ts-ignore
            const { videoWidth, videoHeight } = video.getElement();

            const previewWidth = object.width * object.scaleX;
            const previewHeight = object.height * object.scaleY;
            const newScaleX = previewWidth / videoWidth;
            const newScaleY = previewHeight / videoHeight;

            video.setOptions({
                width: videoWidth,
                height: videoHeight,
                scaleX: newScaleX,
                scaleY: newScaleY,
            });

            callback(video, false);
        });
    }

    static fromPreview(url: string, callback: (video: Video | null, error: boolean) => void): void {
        fabric.util.loadImage(url, (img: HTMLElement) => {
            // @ts-ignore
            callback(new this(img));
        }, null, 'anonymous');
    }

    static fromVideo(url: string, callback: (video: Video | null, error: boolean) => void): void {
        const createVideoPromise = fabric.util.isSafari()
            ? fabric.util.createVideoPromise(url).then(video => [video, video])
            : Promise.all([fabric.util.createVideoPromise(url), fabric.util.createVideoPromise(url)]);

        createVideoPromise
            .then((videos: [HTMLVideoElement, HTMLVideoElement]) => {
                const video = videos[0];
                const videoClone = videos[1];

                const object = new this(video, { src: url });

                // @ts-ignore
                object._elementClone = videoClone;
                callback(object, false);
            })
            .catch(() => {
                callback(null, true);
            });
    }

    play(): Promise<void> {
        const video = (<any>this).getElement();
        if (!video) { return; }

        // We need this hack to prevent video on canvas from blinking on loop
        video.onended = () => {
            // @ts-ignore
            this._element = this._elementClone;
            // @ts-inogre
            this._elementClone = video;
            video.currentTime = 0;

            this.play();
        };

        return video.play();
    }

    stop(): void {
        const video = (<any>this).getElement();
        if (video) {
            video.onended = null;
            video.pause();
            video.currentTime = 0;
        }
    }

    toObject(propertiesToInclude: string[] = []) {
        const object = super.toObject(propertiesToInclude.concat([
            'src',
        ]));

        return Object.assign({}, object, { src: this.src });
    }
}
