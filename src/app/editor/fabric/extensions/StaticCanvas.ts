import { fabric } from 'fabric';
import { ICanvasOptions } from 'fabric/fabric-impl';
import extendCanvas from './extendCanvas';

export default class extends extendCanvas(fabric.StaticCanvas) {
    initialize(element: HTMLCanvasElement | string, options?: ICanvasOptions) {
        super.initialize(element, options);

        this._initWrapperElement();
        this._initFormElementsContainer(this.lowerCanvasEl);
        this.startRenderLoop();
    }
}
