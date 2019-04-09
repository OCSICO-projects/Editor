import { fabric } from 'fabric';
import { IVideoOptions } from 'fabric/fabric-impl';
import HtmlElement from './HtmlElement';

// @ts-ignore
export default class Youtube extends HtmlElement {
    youtubeId: string;
    protected player: any;
    protected fromPreviewUrl: string;

    static fromObject(object: any, callback: (youtube: fabric.Youtube, error: boolean) => any): void {
        Youtube.fromPreview(object.youtubeId, (youtube: Youtube, error: boolean) => {
            if (error) {
                callback(null, true);
                return;
            }

            youtube.setOptions(object);
            callback(youtube, false);
        });
    }

    static videoFromObject(object: any, callback: (youtube: fabric.Youtube, error: boolean) => any): void {
        Youtube.fromVideo(object.youtubeId, (youtube: Youtube, error: boolean) => {
            if (error) {
                callback(null, true);
                return;
            }

            youtube.setOptions(object);
            callback(youtube, false);
        });
    }

    static fromPreview(id: string, callback: (youtube: Youtube | null, error: boolean) => void) {
        const previewSrc = `https://img.youtube.com/vi/${id}/0.jpg`;
        fabric.util.loadImagePromise(previewSrc)
            .then(() => {
                // @ts-ignore
                const object = new this(id, {}, previewSrc);
                callback(object, false);
            })
            .catch(error => {
                callback(null, true);
            });
    }

    static fromVideo(id: string, callback: (youtube: Youtube | null, error: boolean) => void) {
        fabric.util.loadYoutubeApi()
            .then(() => {
                // @ts-ignore
                const object = new this(id);
                callback(object, false);
            })
            .catch(error => {
                callback(null, true);
            });
    }

    // @ts-ignore
    initialize(youtubeId: string, options?: IVideoOptions, fromPreviewUrl?: string) {
        this.fromPreviewUrl = fromPreviewUrl;

        this.width = 160;
        this.height = 90;

        this.youtubeId = youtubeId;
        // @ts-ignore
        super.initialize(options);
        this.type = 'youtube';
        this.fill = 'black';

        if (fromPreviewUrl) {
            this.trigger('youtube:ready');
        } else {
            this.initPlayer();
        }
    }

    protected initPlayer(): void {
        this.player = new window.YT.Player(this._hostElement, {
            events: {
                'onReady': () => { this.trigger('youtube:ready'); },
                'onStateChange': (e) => { this.trigger('youtube:stateChange', { state: e.data }); },
                'onError': () => { this.trigger('youtube:error'); },
            }
        });
    }

    play() {
        if (this.player) { this.player.playVideo(); }
    }

    stop() {
        if (this.player) {
            this.player.pauseVideo();
            this.player.seekTo(0);
        }
    }

    getPlayer() {
        return this.player;
    }

    protected initHostElement() {
        if (this.fromPreviewUrl) {
            this._hostElement = <HTMLImageElement>fabric.util.makeElement('img', { src: this.fromPreviewUrl });
        } else {
            this._hostElement = <HTMLIFrameElement>fabric.util.makeElement('iframe', {
                allow: 'autoplay',
                src: `https://www.youtube.com/embed/${this.youtubeId}?controls=0&iv_load_policy=3&fs=0&disablekb=1&rel=0` +
                `&loop=1&autoplay=1&playsinline=1&showinfo=0&modestbranding=1&mute=1&enablejsapi=1&playlist=${this.youtubeId}`,
            });
        }
    }

    protected updateInnerDOM() {
        super.updateInnerDOM();

        fabric.util.setStyle(this._hostElement, {
            pointerEvents: 'none',
        });
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'youtubeId',
        ]));
    }
}
