import fabric from '@app/editor/fabric';
import { IAnimationOptions } from 'fabric/fabric-impl';
import { BaseModel } from '@app/shared/models/base.model';

export enum AnimationType {
    fadeIn = 'fadeIn',
    fadeOut = 'fadeOut',
    zoomIn = 'zoomIn',
    zoomOut = 'zoomOut',
    bounceIn = 'bounceIn',
    bounceOut = 'bounceOut',
    slideInLeft = 'slideInLeft',
    slideOutRight = 'slideOutRight',
    rotateIn = 'rotateIn',
    rotateOut = 'rotateOut',
}

export const AnimationsMap = Object.freeze({
    fade: [AnimationType.fadeIn, AnimationType.fadeOut],
    zoom: [AnimationType.zoomIn, AnimationType.zoomOut],
    bounce: [AnimationType.bounceIn, AnimationType.bounceOut],
    slide: [AnimationType.slideInLeft, AnimationType.slideOutRight],
    rotate: [AnimationType.rotateIn, AnimationType.rotateOut],
});

export class Animation extends BaseModel {
    type: AnimationType = AnimationType.fadeIn;
    startTime = 0; // delay after animation, in seconds
    duration = 0;
    repetition = null;
}

export interface AnimatedProperties {
    opacity?: number;
    left?: number;
    top?: number;
    scaleX?: number;
    scaleY?: number;
}

export default class {
    static animationId = 0;

    static play(object: fabric.Object, animation: Animation): Promise<void> {
        const duration = animation.duration * 1000;
        // console.debug(`Running ${animation.type} (id: ${this.animationId}) for ${animation.duration} seconds: ${Math.round(performance.now() / 100) / 10}`);

        return (<any>this)[animation.type](object, duration);
    }

    static runAnimation(object: fabric.Object, animatedProperties: AnimatedProperties, animationOptions: IAnimationOptions): Promise<void> {
        const animationId = this.animationId++;

        return new Promise((resolve, reject) => {
            Object.assign(animationOptions, {
                abort: () => {
                    if (object.isAnimationAborted) { reject(`Animation aborted (id: ${animationId})`); }
                    return object.isAnimationAborted;
                },
                onChange: () => object.setCoords(),
                onComplete: () => resolve(),
            });

            object.animate(animatedProperties, animationOptions);
        });
    }

    static fadeIn(object: fabric.Object, duration: number): Promise<void> {
        const animatedProperties = { opacity: object.opacity };
        object.set('opacity', 0);

        return this.runAnimation(object, animatedProperties, { duration });
    }

    static fadeOut(object: fabric.Object, duration: number): Promise<void> {
        const animatedProperties = { opacity: 0 };

        return this.runAnimation(object, animatedProperties, { duration });
    }

    static zoomIn(object: fabric.Object, duration: number): Promise<void> {
        const initialOpacity = object.opacity;
        const initialScaleX = object.scaleX;
        const initialScaleY = object.scaleY;

        object._setOriginToCenter();

        object.setOptions({
            opacity: 0,
            scaleX: 0.3 * initialScaleX,
            scaleY: 0.3 * initialScaleY,
        });

        const opacityKeyframe50 = { opacity: initialOpacity };
        const opacityKeyframe50Options = { duration: 0.5 * duration, easing: fabric.util.ease.linear };

        const keyframe100 = {
            scaleX: initialScaleX,
            scaleY: initialScaleY,
        };
        const keyframe100Options = { duration, easing: fabric.util.ease.linear };

        const opacityAnimation = this.runAnimation(object, opacityKeyframe50, opacityKeyframe50Options);
        const mainAnimation = this.runAnimation(object, keyframe100, keyframe100Options);

        return Promise.all([opacityAnimation, mainAnimation])
            .then(() => { object._resetOrigin(); });
    }

    static zoomOut(object: fabric.Object, duration: number): Promise<void> {
        const initialScaleX = object.scaleX;
        const initialScaleY = object.scaleY;

        object._setOriginToCenter();

        const keyframe50 = {
            opacity: 0,
            scaleX: 0.3 * initialScaleX,
            scaleY: 0.3 * initialScaleY,
        };
        const keyframe50Options = { duration: 0.5 * duration, easing: fabric.util.ease.linear };

        const keyframe100 = { opacity: 0 };
        const keyframe100Options = { duration: 0.5 * duration, easing: fabric.util.ease.linear };

        const animationChain = this.runAnimation(object, keyframe50, keyframe50Options)
            .then(() => this.runAnimation(object, keyframe100, keyframe100Options))
            .then(() => object._resetOrigin());

        return animationChain;
    }

    static bounceIn(object: fabric.Object, duration: number): Promise<void> {
        const initialOpacity = object.opacity;
        const initialScaleX = object.scaleX;
        const initialScaleY = object.scaleY;

        object._setOriginToCenter();

        object.setOptions({
            opacity: 0,
            scaleX: 0.3 * initialScaleX,
            scaleY: 0.3 * initialScaleY,
        });

        const opacityKeyframe60 = { opacity: initialOpacity };
        const opacityKeyframeOptions = { duration: 0.6 * duration, easing: fabric.util.ease.easeOutCubic };

        const keyframeOptions = { duration: 0.2 * duration, easing: fabric.util.ease.easeOutCubic };

        const keyframe20 = { scaleX: 1.1 * initialScaleX, scaleY: 1.1 * initialScaleY };
        const keyframe40 = { scaleX: 0.9 * initialScaleX, scaleY: 0.9 * initialScaleY };
        const keyframe60 = { scaleX: 1.03 * initialScaleX, scaleY: 1.03 * initialScaleY };
        const keyframe80 = { scaleX: 0.97 * initialScaleX, scaleY: 0.97 * initialScaleY };
        const keyframe100 = { scaleX: initialScaleX, scaleY: initialScaleY };

        const opacityAnimation = this.runAnimation(object, opacityKeyframe60, opacityKeyframeOptions);
        const mainAnimation = this.runAnimation(object, keyframe20, keyframeOptions)
            .then(() => this.runAnimation(object, keyframe40, keyframeOptions))
            .then(() => this.runAnimation(object, keyframe60, keyframeOptions))
            .then(() => this.runAnimation(object, keyframe80, keyframeOptions))
            .then(() => this.runAnimation(object, keyframe100, keyframeOptions));

        return Promise.all([opacityAnimation, mainAnimation])
            .then(() => object._resetOrigin());
    }

    static bounceOut(object: fabric.Object, duration: number): Promise<void> {
        const initialOpacity = object.opacity;
        const initialScaleX = object.scaleX;
        const initialScaleY = object.scaleY;

        object._setOriginToCenter();

        const keyframe20 = { scaleX: 0.9 * initialScaleX, scaleY: 0.9 * initialScaleY };
        const keyframe20Options = { duration: 0.2 * duration, easing: fabric.util.ease.linear };

        const keyframe50 = { scaleX: 1.1 * initialScaleX, scaleY: 1.1 * initialScaleY };
        const keyframe50Options = { duration: 0.3 * duration, easing: fabric.util.ease.linear };

        const keyframe55 = { opacity: initialOpacity };
        const keyframe55Options = { duration: 0.05 * duration };

        const keyframe100 = { opacity: 0, scaleX: 0.3 * initialScaleX, scaleY: 0.3 * initialScaleY };
        const keyframe100Options = { duration: 0.45 * duration, easing: fabric.util.ease.linear };

        const animationChain = this.runAnimation(object, keyframe20, keyframe20Options)
            .then(() => this.runAnimation(object, keyframe50, keyframe50Options))
            .then(() => this.runAnimation(object, keyframe55, keyframe55Options))
            .then(() => this.runAnimation(object, keyframe100, keyframe100Options))
            .then(() => object._resetOrigin());

        return animationChain;
    }

    static slideInLeft(object: fabric.Object, duration: number): Promise<void> {
        const initialLeft = object.left;

        object.set('left', -object.getScaledWidth());

        const keyframe100 = { left: initialLeft };
        const keyframe100Options = { duration, easing: fabric.util.ease.linear };

        return this.runAnimation(object, keyframe100, keyframe100Options);
    }

    static slideOutRight(object: fabric.Object, duration: number): Promise<void> {
        // @ts-ignore
        const targetLeft = object.canvas.getWidth() + object.getScaledWidth();

        const keyframe100 = { left: targetLeft };
        const keyframe100Options = { duration, easing: fabric.util.ease.linear };

        return this.runAnimation(object, keyframe100, keyframe100Options);
    }

    static rotateIn(object: fabric.Object, duration: number): Promise<void> {
        const initialAngle = object.angle;
        const initialOpacity = object.opacity;

        object._setOriginToCenter();

        object.setOptions({ angle: initialAngle - 100, opacity: 0 });

        const keyframe100 = { angle: initialAngle, opacity: initialOpacity };
        const keyframe100Options = { duration, easing: fabric.util.ease.linear };

        return this.runAnimation(object, keyframe100, keyframe100Options)
            .then(() => object._resetOrigin());
    }

    static rotateOut(object: fabric.Object, duration: number): Promise<void> {
        object._setOriginToCenter();

        const keyframe100 = { angle: object.angle + 200, opacity: 0 };
        const keyframe100Options = { duration, easing: fabric.util.ease.linear };

        return this.runAnimation(object, keyframe100, keyframe100Options)
            .then(() => object._resetOrigin());
    }

    static delay(object: fabric.Object, durationSec: number): Promise<void> {
        // console.debug(`Running delay (id: ${this.animationId}) for ${durationSec} seconds: ${Math.round(performance.now() / 100) / 10}`);
        return this.runAnimation(object, { opacity: object.opacity }, { duration: durationSec * 1000 });
    }
}
