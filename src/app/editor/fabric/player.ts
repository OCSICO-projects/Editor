// tslint:disable
import fabric from './';
import { AnimationsMap } from './animations';

import AnimationStyles from './assets/animation-styles';
import SkipButton from './assets/skip-button';
import ErrorBox from './assets/error-box';

import ModelHandler from './player/ModelHandler';
import TrackPreset from './player/TrackPreset';
import TrackPlayer from './player/TrackPlayer';
import { AnyObject, AbstractTrack, CanvasTrack, ImageTrack, PdfTrack, VideoTrack, YoutubeTrack, WebTrack, AsyncOperationToken } from './player/types';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export interface PlayerOptions {
    redirectUrl?: string | null;
    formAction?: string | null;
    facebookAction?: string | null;
    twitterAction?: string | null;
    linkedInAction?: string | null;
    skipOption?: number | null;
    loop?: boolean;
    interactive?: boolean;
    skipAnimations?: boolean;
    resoureceLoadTimeoutSec?: number;
}

export default class Player {
    resolveStartPlay = () => { };
    rejectStartPlay = () => { };

    startPlay = new Promise((resolve, reject) => {
        this.resolveStartPlay = resolve;
        this.rejectStartPlay = reject;
    });

    protected options: PlayerOptions = {
        redirectUrl: null,
        formAction: null,
        facebookAction: null,
        twitterAction: null,
        linkedInAction: null,
        skipOption: null,
        loop: false,
        interactive: true,
        skipAnimations: false,
        resoureceLoadTimeoutSec: 9000000,
    };
    protected playerContainer: HTMLDivElement;
    protected errorBox: HTMLDivElement;
    protected skipButton: HTMLDivElement;
    protected stylesContainer: HTMLStyleElement;
    protected originalCanvasElement: HTMLCanvasElement;
    protected tracks: AbstractTrack[] = [];
    protected renderLoopId: any;
    protected playingItem: AsyncOperationToken = new AsyncOperationToken();

    constructor(canvasElement: HTMLCanvasElement, options?: PlayerOptions) {
        Object.assign(this.options, options);

        this.originalCanvasElement = canvasElement;
        this.initContainer(canvasElement);
        this.initAnimationStyles();
        canvasElement.parentElement.removeChild(canvasElement);
    }

    protected initContainer(canvasElement: HTMLCanvasElement) {
        this.playerContainer = fabric.util.wrapElement(canvasElement, 'div') as HTMLDivElement;
        this.playerContainer.classList.add('player-main-container');
        fabric.util.setStyle(this.playerContainer, {
            display: 'flex',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
        });

        const errorBox = fabric.util.makeElement('div') as HTMLDivElement;
        errorBox.innerHTML = ErrorBox;
        this.errorBox = errorBox.firstElementChild as HTMLDivElement;

        const skipButton = fabric.util.makeElement('div') as HTMLDivElement;
        skipButton.innerHTML = SkipButton;
        this.skipButton = skipButton.firstElementChild as HTMLDivElement;
        this.skipButton.onclick = () => window.location.href = this.options.redirectUrl;

        this.playerContainer.insertBefore(this.errorBox, canvasElement);
        this.playerContainer.insertBefore(this.skipButton, canvasElement);
    }

    protected initAnimationStyles() {
        this.stylesContainer = <HTMLStyleElement>fabric.util.makeElement('style');
        this.stylesContainer.innerHTML = AnimationStyles;

        document.querySelector('head').appendChild(this.stylesContainer);
    };

    load(modelsJson: string[]): Promise<void> {
        const originalCanvasElement: HTMLCanvasElement = this.originalCanvasElement;

        let needsYoutubeApi = false;

        const models = modelsJson.map(json => {
            const model = JSON.parse(json);
            if (this.isYoutubeModel(model)) { needsYoutubeApi = true; }
            return model;
        });

        this.runSpinner();

        const loadYoutubeApiPromise = needsYoutubeApi ? fabric.util.loadYoutubeApi() : Promise.resolve();

        return loadYoutubeApiPromise
            .then(() => {
                const tracksPromises = <Promise<AbstractTrack>[]>models.map(model => this.handleModel(model));
                return Promise.all(tracksPromises);
            })
            .then(tracks => {
                tracks.forEach(track => {
                    fabric.util.hideElement(track.containerElement);
                    this.playerContainer.appendChild(track.containerElement);
                });
                this.tracks = tracks;

                return Promise.all(tracks.map(track => this.presetTrack(track)));
            })
            .then(() => { })
            .catch(error => {
                if (error && typeof error === 'object' && error.outdatedVersion) {
                    this.showErrorMessage(`Current player's version is outdated, please update`);
                    return;
                }

                this.showErrorMessage();
                throw error;
            });
    }

    //@TODO Disabled by request from customer. US-954 Player: Disable preloader when Slides data are loaded
    protected runSpinner() { /*this.playerContainer.classList.add('player-spinner');*/ }

    protected stopSpinner() { /*this.playerContainer.classList.remove('player-spinner');*/ }

    protected handleModel(model: object): Promise<AbstractTrack> {
        if (this.isCanvasModel(model)) { return ModelHandler.handleCanvas(model, this.originalCanvasElement, this.options); }
        if (this.isImageModel(model)) { return ModelHandler.handleImage(model, this.options); }
        if (this.isAudioModel(model)) { return ModelHandler.handleAudio(model, this.options); }
        if (this.isPdfModel(model)) { return ModelHandler.handlePdf(model, this.options); }
        if (this.isVideoModel(model)) { return ModelHandler.handleVideo(model, this.options); }
        if (this.isYoutubeModel(model)) { return ModelHandler.handleYoutube(model, this.options); }
        if (this.isWebModel(model)) { return ModelHandler.handleWeb(model, this.options); }

        throw new Error('No appropriate model handler found for resource');
    }

    protected isCanvasModel(model: AnyObject): boolean {
        return (
            'general' in model && 'objects' in model ||
            (typeof model.type === 'string' && model.type === 'compose')
        )
    }

    protected isImageModel(model: AnyObject): boolean { return 'subtype' in model && model.subtype === 'image'; }

    protected isAudioModel(model: AnyObject): boolean { return 'subtype' in model && model.subtype === 'audio'; }

    protected isPdfModel(model: AnyObject): boolean { return 'subtype' in model && model.subtype === 'pdf'; }

    protected isVideoModel(model: AnyObject): boolean { return 'subtype' in model && model.subtype === 'video'; }

    protected isYoutubeModel(model: AnyObject): boolean { return 'type' in model && model.type === 'youtube'; }

    protected isWebModel(model: AnyObject): boolean { return 'type' in model && model.type === 'web'; }

    protected presetTrack(track: AbstractTrack): Promise<void> {
        if (this.isCanvasModel(track.model)) { return TrackPreset.presetCanvas(<CanvasTrack>track); }
        if (this.isYoutubeModel(track.model)) { return TrackPreset.presetYoutube(<YoutubeTrack>track); }
        return Promise.resolve();
    }

    showErrorMessage(message?: string) {
        this.stopSpinner();
        this.rejectStartPlay();

        if (message) { (<HTMLElement>this.errorBox.querySelector('.player-error-text')).innerText = message; }
        this.errorBox.style.display = '';
    }

    play(): void {
        if (!this.tracks.length) { this.rejectStartPlay(); return; }

        if (this.options.skipOption !== null) {
            setTimeout(() => { this.skipButton.hidden = false; }, this.options.skipOption * 1000);
        }

        this.tracksLoop().catch(error => {
            this.showErrorMessage();
            throw error;
        });

        this.stopSpinner();
        this.renderLoop();
    }

    protected renderLoop() {
        this.renderLoopId = requestAnimationFrame(() => {
            const playerWidth = parseFloat(window.getComputedStyle(this.playerContainer).width);
            const playerHeight = this.playerContainer.scrollHeight;

            if (playerHeight > playerWidth) {
                this.skipButton.classList.remove('player-skip-button-landscape');
                this.skipButton.classList.add('player-skip-button-portait');
            } else {
                this.skipButton.classList.remove('player-skip-button-portait');
                this.skipButton.classList.add('player-skip-button-landscape');
            }

            this.skipButton.style.top = playerHeight * 0.75 + 'px';

            this.renderLoop();
        });
    }

    protected tracksLoop(trackIndex = 0): Promise<void> {
        if (trackIndex === this.tracks.length) {
            if (this.options.loop) {
                trackIndex = 0;
            } else {
                if (this.options.redirectUrl) {
                    window.location.href = this.options.redirectUrl;
                } else {
                    this.dispose();
                }

                return;
            }
        }

        const track = this.tracks[trackIndex];
        const animationType = track.model.transition;

        fabric.util.setStyle(this.playerContainer, { backgroundColor: track.backgroundColor || 'transparent' });

        return this.setupFirstFrameOnTrack(track)
            .then(() => {
                fabric.util.showElement(track.containerElement);

                this.resolveStartPlay();

                const animationStart: AsyncOperationToken = animationType && !this.options.skipAnimations
                    ? TrackPlayer.proceedResourceAnimation(track.containerElement, AnimationsMap[animationType][0])
                    : new AsyncOperationToken();
                this.playingItem = animationStart;

                animationStart.promise
                    .then(() => {
                        console.debug(`Playing track #${trackIndex + 1} for ${track.durationMs / 1000} sec`);
                        this.playingItem = this.playTrack(track);
                        return this.playingItem.promise;
                    })
                    .then(() => {
                        this.playingItem = animationType && !this.options.skipAnimations
                            ? TrackPlayer.proceedResourceAnimation(track.containerElement, AnimationsMap[animationType][1])
                            : new AsyncOperationToken();

                        return this.playingItem.promise;
                    })
                    .then(() => {
                        fabric.util.hideElement(track.containerElement);
                        return this.tracksLoop(trackIndex + 1);
                    })
                    .catch((error) => {
                        if (error && typeof error === 'object' && error.isCanceled) { console.debug('Player stopped'); return; }
                        this.showErrorMessage();
                        throw error;
                    });
            });
    }

    protected setupFirstFrameOnTrack(track: AbstractTrack): Promise<void> {
        if (this.isCanvasModel(track.model)) {
            return TrackPlayer.setupFirstFrameOnCanvasTrack(<CanvasTrack>track, this.options);
        }

        if (this.isPdfModel(track.model)) {
            return TrackPlayer.setupFirstFrameOnPdfTrack(<PdfTrack>track);
        }

        return Promise.resolve();
    }

    protected playTrack(track: AbstractTrack): AsyncOperationToken {
        if (track instanceof CanvasTrack) { return TrackPlayer.playCanvas(track, this.options); }
        if (track instanceof ImageTrack) { return TrackPlayer.playImage(track); }
        if (track instanceof PdfTrack) { return TrackPlayer.playPdf(track); }
        if (track instanceof VideoTrack) { return TrackPlayer.playVideo(track); }
        if (track instanceof YoutubeTrack) { return TrackPlayer.playYoutube(track); }
        if (track instanceof WebTrack) { return TrackPlayer.playWeb(track); }

        throw new Error('No appropriate player found for track');
    }

    protected disposeTrack(track: AbstractTrack): Promise<any> {
        if (this.isCanvasModel(track.model)) {
            return TrackPlayer.stopCanvas((<CanvasTrack>track).canvas)
                .then(() => (<CanvasTrack>track).canvas.dispose());
        }

        if (this.isImageModel(track.model) || this.isVideoModel(track.model)) {
            track.containerElement.remove();
        }

        return Promise.resolve();
    }

    dispose() {
        cancelAnimationFrame(this.renderLoopId);
        this.playingItem.reject({ isCanceled: true });

        Promise.all(this.tracks.map(track => this.disposeTrack(track)))
            .then(() => {
                this.stylesContainer.remove();
                this.playerContainer.remove();

                this.tracks = [];
            });
    }
}
