import { fabric } from 'fabric';
import { IObjectOptions } from 'fabric/fabric-impl';

export default class FormGroup extends fabric.Group {
    static fromObject(object: any, callback: (formGroup: FormGroup) => any): void {
        // @ts-ignore
        fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
            // @ts-ignore
            const options = fabric.util.object.clone(object, true);
            delete options.objects;
            // @ts-ignore
            if (callback) { callback(new fabric.FormGroup(enlivenedObjects, options, true)); }
        });
    }

    initialize(items?: any[], options?: IObjectOptions, isAlreadyGrouped?: boolean) {
        // @ts-ignore
        this.subTargetCheck = true;
        this.selectable = false;
        this.hoverCursor = 'default';

        // @ts-ignore
        super.initialize(items, options, isAlreadyGrouped);
        this.type = 'formGroup';
    }

    addWithUpdate(object: fabric.Object): this {
        super.addWithUpdate(object);
        this.setCoords();
        // @ts-ignore
        if (this.canvas) { this.canvas.appendFormElements([object]); }

        return this;
    }

    removeWithUpdate(object: fabric.Object): this {
        super.removeWithUpdate(object);

        if (object.dispose) { object.dispose(); }

        return this;
    }

    attach(object: fabric.FormElement, index: number): void {
        // @ts-ignore
        this._restoreObjectsState();
        // @ts-ignore
        fabric.util.resetObjectTransform(this);
        if (object) {
            this.getObjects().splice(index, 0, object);
            // @ts-ignore
            object.group = this;
            object.formGroup = null;
            // @ts-ignore
            object._set('canvas', this.canvas);
        }
        // @ts-ignore
        this._calcBounds();
        // @ts-ignore
        this._updateObjectsCoords();
        this.setCoords();
        // @ts-ignore
        this.dirty = true;
    }

    detatch(object: fabric.FormElement): number {
        // @ts-ignore
        this._restoreObjectsState();
        // @ts-ignore
        fabric.util.resetObjectTransform(this);

        const detatchIndex = this.getObjects().findIndex((o: any) => o === object);
        this.getObjects().splice(detatchIndex, 1);
        object.formGroup = this;
        // @ts-ignore
        this._calcBounds();
        // @ts-ignore
        this._updateObjectsCoords();
        this.setCoords();
        // @ts-ignore
        this.dirty = true;

        return detatchIndex;
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.getObjects().forEach(object => object.render(ctx));
    }

    dispose() {
        this.getObjects().forEach(object => object.dispose && object.dispose());
    }
}
