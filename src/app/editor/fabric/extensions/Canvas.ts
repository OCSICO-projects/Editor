import { fabric } from 'fabric';
import { ICanvasOptions } from 'fabric/fabric-impl';
import extendCanvas from './extendCanvas';

export default class extends extendCanvas(fabric.Canvas) {
    initialize(element: HTMLCanvasElement | string, options?: ICanvasOptions) {
        super.initialize(element, options);

        this._initFormElementsContainer(this.lowerCanvasEl);
        this.startRenderLoop();
    }

    getFormElementOrder(object: fabric.FormElement) {
        const element = object.getHostElement();
        const container = this.formElementsContainerEl;
        const elementIndex = Array.prototype.indexOf.call(container.children, element);
        const elementOrder = container.children.length - elementIndex - 1;

        return elementOrder;
    }

    drawControls(ctx: CanvasRenderingContext2D) {
        // @ts-ignore
        this.clearContext(this.contextTop);
        // @ts-ignore
        super.drawControls(this.contextTop);
    }

    protected _checkTarget(pointer: any, obj: fabric.Object) {
        if (obj.isNotVisible()) { return false; }

        // @ts-ignore
        return super._checkTarget(pointer, obj);
    }
}
