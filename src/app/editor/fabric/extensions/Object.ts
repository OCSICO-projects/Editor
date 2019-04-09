import { fabric } from 'fabric';

// @ts-ignore
const _setShadow = fabric.Object.prototype._setShadow;

const toObject = fabric.Object.prototype.toObject;

// @ts-ignore
const initialize = fabric.Object.prototype.initialize;

Object.assign(fabric.Object.prototype, {
    id: '',
    isAnimationAborted: false,
    resourceId: null,
    showShadow: true,
    title: '',
    url: '',

    initialize(...args: any[]) {
        this.animations = {
            start: null,
            end: null,
        };

        this.setShadow({
            offsetX: 0,
            offsetY: 0,
            blur: 0,
            color: 'rgb(0,0,0)',
        });

        this.id = fabric.util.generateId();

        initialize.apply(this, args);
    },

    toObject(propertiesToInclude: string[] = []) {
        return toObject.call(this, propertiesToInclude.concat([
            'id',
            'animations',
            'evented',
            'resourceId',
            'selectable',
            'showShadow',
            'title',
            'url',
        ]));
    },

    _setShadow: function(ctx: CanvasRenderingContext2D) {
        if (!this.showShadow) { return; }

        _setShadow.call(this, ctx);
    },
});
