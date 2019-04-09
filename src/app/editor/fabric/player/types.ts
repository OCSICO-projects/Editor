import { BaseModel } from '@app/shared/models/base.model';
// import { BaseModel } from '../../shared/base.model'; // @TODO: for test purpouses

export interface AnyObject { [k: string]: any; }

export abstract class AbstractTrack extends BaseModel {
    model: AnyObject;
    containerElement: HTMLElement;
    durationMs: number;
    backgroundColor: string;
}

export class CanvasTrack extends AbstractTrack {
    canvas: fabric.Canvas;
    objectsInitialProperties: any[];
}

export class ImageTrack extends AbstractTrack {
    containerElement: HTMLImageElement;
}

// @TODO: simplified work with audio for phase 1
export class AudioTrack extends AbstractTrack {
    containerElement: HTMLImageElement;
}

export class PdfTrack extends AbstractTrack {
    containerElement: HTMLDivElement;
    images: HTMLDivElement[];
}

export class VideoTrack extends AbstractTrack {
    containerElement: HTMLVideoElement;
}

export class YoutubeTrack extends AbstractTrack {
    containerElement: HTMLDivElement;
    imageElement: HTMLImageElement;
    iframeElement: HTMLIFrameElement;
    player: AnyObject;
}

export class WebTrack extends AbstractTrack {
    containerElement: HTMLIFrameElement;
}

export class AsyncOperationToken {
    promise: Promise<void>;
    reject: Function;

    constructor(props: AnyObject = {}) {
        this.promise = props.promise || Promise.resolve();
        this.reject = props.reject || function() { return Promise.reject('Default reject'); };
    }
}
