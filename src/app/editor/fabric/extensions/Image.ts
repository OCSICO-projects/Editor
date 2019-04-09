import { fabric } from 'fabric';

const toObject = fabric.Image.prototype.toObject;

Object.assign(fabric.Image.prototype, {
    toObject(propertiesToInclude: string[] = []) {
        return toObject.call(this, propertiesToInclude.concat([
            'previewUrl',
        ]));
    },
});
