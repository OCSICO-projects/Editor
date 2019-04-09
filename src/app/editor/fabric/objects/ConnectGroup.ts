import { fabric } from 'fabric';
import { IObjectOptions } from 'fabric/fabric-impl';

import FormGroup from './FormGroup';

export type ConnectionProperty = 'simple' | 'phone' | 'email';

export default class ConnectGroup extends FormGroup {
    _connectionProperty: 'simple' | 'phone' | 'email' = 'simple';

    static fromObject(object: any, callback: (connectGroup: ConnectGroup) => any): void {
        // @ts-ignore
        fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
            // @ts-ignore
            const options = fabric.util.object.clone(object, true);
            delete options.objects;
            // @ts-ignore
            if (callback) { callback(new fabric.ConnectGroup(enlivenedObjects, options, true)); }
        });
    }

    set connectionProperty(connectionProperty: ConnectionProperty) {
        if (this._connectionProperty === connectionProperty) { return; }

        this._connectionProperty = connectionProperty;
        let lastActiveObject;

        // @ts-ignore
        const canvas = this.canvas;
        if (canvas) {
            lastActiveObject = canvas.getActiveObject();
            canvas.discardActiveObject();
        }

        const inputElement = this.getObjects().find(object => object instanceof fabric.Input);

        if (inputElement) {
            this.removeWithUpdate(inputElement);
        }

        if (connectionProperty === 'simple') {
            if (canvas && lastActiveObject && lastActiveObject !== inputElement && !(lastActiveObject instanceof fabric.FormElement)) {
                canvas.setActiveObject(lastActiveObject);
            }

            return;
        }

        const button = this.getObjects().find(object => object instanceof fabric.Button);
        const rotationAngle = this.angle || button && button.angle;
        this.rotate(0);
        button.rotate(0);

        // @ts-ignore
        const transform = button.getTransformProperties();
        const width = button.width * Math.abs(transform.scaleX);
        const height = button.height * Math.abs(transform.scaleY);
        const top = transform.translateY - Math.abs(height / 2);
        const left = transform.translateX - Math.abs(width / 2);

        this.addWithUpdate(new fabric.Input({
            title: 'Input',
            name: connectionProperty,
            width,
            height: 80,
            top: top - 90,
            left,
        }));
        this.rotate(rotationAngle);
        this.setCoords();

        if (canvas && lastActiveObject && lastActiveObject !== inputElement && !(lastActiveObject instanceof fabric.FormElement)) {
            canvas.setActiveObject(lastActiveObject);
        }
    }

    get connectionProperty(): ConnectionProperty {
        return this._connectionProperty;
    }

    initialize(items?: any[], options?: IObjectOptions, isAlreadyGrouped?: boolean) {
        // @ts-ignore
        super.initialize(items, options, isAlreadyGrouped);
        this.type = 'connectGroup';

        if (isAlreadyGrouped) { return; }

        this.addWithUpdate(new fabric.ConnectButton({
            title: 'Button',
            text: 'Connect',
            top: options.top || 0,
            left: options.left || 0,
            width: options.width || 80,
            height: options.height || 20,
        }));
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            '_connectionProperty',
        ]));
    }
}
