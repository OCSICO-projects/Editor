import fabric from '../';
import { AnyObject, AbstractTrack, CanvasTrack, ImageTrack, VideoTrack, YoutubeTrack, AsyncOperationToken } from './types';

export default class TrackPreset {
    static presetCanvas(track: CanvasTrack): Promise<void> {
        const youtubeVideos = track.canvas.getObjects().filter(object => object instanceof fabric.Youtube);
        const youtubePromises = youtubeVideos.map(youtubeObject => new Promise((resolve, reject) => {
            const object = <fabric.Youtube>youtubeObject;

            function removeHandlers() {
                object.off('youtube:ready', readyHandler);
                object.off('youtube:stateChange', stateChangeHandler);
                object.off('youtube:error', errorHandler);
            }

            function readyHandler() { object.play(); }

            function stateChangeHandler(e: any) {
                const state = e.state;
                if (state !== window.YT.PlayerState.PLAYING) { return; }

                object.stop();
                removeHandlers();
                resolve();
            }

            function errorHandler() {
                removeHandlers();
                reject(`Error loading Youtube video on canvas`);
            }

            object.on('youtube:ready', readyHandler);
            object.on('youtube:stateChange', stateChangeHandler);
            object.on('youtube:error', errorHandler);

            const hostElement = object.getHostElement();
            hostElement.parentElement.replaceChild(hostElement, hostElement);
        }));

        return Promise.all(youtubePromises).then(() => { });
    }

    static presetYoutube(track: YoutubeTrack): Promise<void> {
        return new Promise((resolve, reject) => {
            let preloaded = false;

            const stateChangeHandler = (e) => {
                if (preloaded || e.data !== window.YT.PlayerState.PLAYING) { return; }

                player.pauseVideo();
                player.seekTo(0);
                preloaded = true;
                resolve();
            };

            const player = new window.YT.Player(track.containerElement, {
                events: {
                    'onReady': () => { player.playVideo(); },
                    'onStateChange': stateChangeHandler,
                    'onError': () => { reject(`Error playind Youtube video`); }
                }
            });

            track.player = player;
        });
    }

}
