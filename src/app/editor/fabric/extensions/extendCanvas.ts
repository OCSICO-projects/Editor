import fabric from '../';
import { ICanvasOptions } from 'fabric/fabric-impl';

type Constructor<T = {}> = new (...args: any[]) => T;

const extendCanvas = <T extends Constructor<fabric.StaticCanvas>>(baseCanvas: T) => class extends baseCanvas {
    containerClass: string;
    formElementsContainerEl: HTMLElement;
    formStubEl: HTMLFormElement;
    formStubElId: string;
    isRenderLoopRunning: boolean;
    selectionKey: null;

    protected fitWidth = false;
    protected renderAnimationFrameId: any;

    initialize(element: HTMLCanvasElement | string, options?: ICanvasOptions) {
        this.containerClass = 'canvas-container';

        super.initialize(element, options);

        this.selectionKey = null;

        // @ts-ignore
        if (!baseCanvas.canvasId) { baseCanvas.canvasId = 0; }
        // @ts-ignore
        this.formStubElId = 'canvas-form-stub-' + baseCanvas.canvasId++;

        this.renderLoop = this.renderLoop.bind(this);
    }

    _initOptions(options: ICanvasOptions) {
        super._initOptions(options);

        this.updateCanvasStretching();
    }

    // @ts-ignore
    setWidth(value: string | number, options?: any): this {
        super.setWidth(value, options);
        this.updateCanvasStretching();

        return this;
    }

    // @ts-ignore
    setHeight(value: string | number, options?: any): this {
        super.setHeight(value, options);
        this.updateCanvasStretching();

        return this;
    }

    protected updateCanvasStretching() {
        const style = {
            width: '100%',
            height: '100%',
            position: 'absolute',
        };

        fabric.util.setStyle(this.lowerCanvasEl, style);
        if (this.upperCanvasEl) {
            fabric.util.setStyle(this.upperCanvasEl, style);
        }
    }

    startRenderLoop() {
        if (this.isRenderLoopRunning) { return; }

        this.isRenderLoopRunning = true;
        this.renderLoop();
    }

    stopRenderLoop() {
        this.isRenderLoopRunning = false;
        cancelAnimationFrame(this.renderAnimationFrameId);
    }

    protected renderLoop() {
        this.renderAll();
        this.renderAnimationFrameId = requestAnimationFrame(this.renderLoop);
    }

    requestRenderAll(): this { return this; }

    dispose() {
        this.stopRenderLoop();

        return super.dispose();
    }

    add(...objects: fabric.Object[]): any {
        super.add(...objects);

        this.appendFormElements(objects);

        return this;
    }

    attach(object: fabric.Object): void { this.getObjects().push(object); }

    detatch(object: fabric.Object): void {
        const index = this.getObjects().findIndex((o: any) => o === object);
        this.getObjects().splice(index, 1);
    }

    appendFormElements(objects: fabric.Object[]) {
        objects.forEach((object) => {
            if (object instanceof fabric.FormGroup) {
                this.appendFormElements(object.getObjects());
            }

            if (object instanceof fabric.HtmlElement) {
                const element = object.getHostElement();
                this.formElementsContainerEl.appendChild(element);

                if (object instanceof fabric.SocialButton) {
                    (<HTMLButtonElement>element).setAttribute('form', this.formStubElId);
                }
            }
        });
    }

    remove(...objects: fabric.Object[]): any {
        super.remove(...objects);
        objects.forEach(object => object.dispose && object.dispose());

        return this;
    }

    renderAll(allOnTop?: boolean): this {
        super.renderAll();
        this._recalculateCanvasContainerSizes();
        this._recalculateFormElementContainerScale();

        return this;
    }

    loadPlayerFromJSON(json: string | any, callback: () => void, reviver?: Function): this {
        // @ts-ignore
        const videoFromObject = fabric.Video.fromObject;
        fabric.Video.fromObject = fabric.Video.videoFromObject;

        // @ts-ignore
        const youtubeFromObject = fabric.Youtube.fromObject;
        fabric.Youtube.fromObject = fabric.Youtube.videoFromObject;

        this.loadFromJSON(json, callback, reviver);

        fabric.Video.fromObject = videoFromObject;
        fabric.Youtube.fromObject = youtubeFromObject;


        return this;
    }

    loadFromJSON(json: string | any, callback: () => void, reviver?: Function): this {
        this.formElementsContainerEl.innerHTML = '';
        super.loadFromJSON(
            json,
            () => {
                this.appendFormElements(this.getObjects());
                callback();
            },
            reviver
        );

        return this;
    }

    _initWrapperElement() {
        this.wrapperEl = fabric.util.wrapElement(this.lowerCanvasEl, 'div', { class: this.containerClass });
        fabric.util.setStyle(this.wrapperEl, {
            width: this.width + 'px',
            height: this.height + 'px',
            margin: 'auto',
            position: 'relative',
            overflow: 'hidden',
        });
        fabric.util.makeElementUnselectable(this.wrapperEl);
    }

    _createLowerCanvas(canvasElement: HTMLCanvasElement): void {
        // @ts-ignore
        super._createLowerCanvas(canvasElement);
    }

    protected _initFormElementsContainer(insertAfterElement: HTMLElement) {
        this.formElementsContainerEl = fabric.util.makeElement('form', { method: 'post' });
        this.formStubEl = fabric.util.makeElement('form', { id: this.formStubElId, style: 'position: absolute;' }) as HTMLFormElement;

        fabric.util.setStyle(this.formElementsContainerEl, {
            position: 'absolute',
            width: this.width + 'px',
            height: this.height + 'px',
            margin: '0',
            padding: '0',
            border: 'none',
            overflow: 'hidden',
            transformOrigin: 'top left',
            pointerEvents: 'none',
        });

        fabric.util.insertNodeAfter(this.formStubEl, insertAfterElement);
        fabric.util.insertNodeAfter(this.formElementsContainerEl, insertAfterElement);
    }

    protected _recalculateCanvasContainerSizes(): void {
        const wrapper = this.wrapperEl;
        const wrapperParent = wrapper.parentElement;

        if (!wrapperParent) { return; }

        const computedStyle = window.getComputedStyle(wrapperParent);
        const wrapperParentPaddingTop = parseFloat(computedStyle.paddingTop);
        const wrapperParentPaddingRight = parseFloat(computedStyle.paddingRight);
        const wrapperParentPaddingBottom = parseFloat(computedStyle.paddingBottom);
        const wrapperParentPaddingLeft = parseFloat(computedStyle.paddingLeft);

        const wrapperParentWidth = wrapperParent.clientWidth - wrapperParentPaddingRight - wrapperParentPaddingLeft;
        const wrapperParentHeight = wrapperParent.clientHeight - wrapperParentPaddingTop - wrapperParentPaddingBottom;

        const widthRatio = wrapperParentWidth / this.width;
        const heightRatio = wrapperParentHeight / this.height;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        if (this.fitWidth) {
            const width = this.width * widthRatio + 'px';
            const height = this.height * widthRatio + 'px';

            fabric.util.setStyle(wrapper, { width, height });
        } else {
            const width = this.width * scaleRatio + 'px';
            const height = this.height * scaleRatio + 'px';

            fabric.util.setStyle(wrapper, { width, height });
        }
    }

    protected _recalculateFormElementContainerScale(): void {
        const computedStyle = window.getComputedStyle(this.wrapperEl);
        const width = parseFloat(computedStyle.width);
        const height = parseFloat(computedStyle.height);

        const scaleX = width / this.getWidth();
        const scaleY = height / this.getHeight();

        fabric.util.setStyle(this.formElementsContainerEl, {
            transform: `scale(${scaleX}, ${scaleY})`
        });
    }

    protected _setCssDimension<K extends keyof CSSStyleDeclaration>(prop: K, value: number) {
        // @ts-ignore
        super._setCssDimension(prop, value);

        this.formElementsContainerEl.style[prop] = value;

        return this;
    }
};

export default extendCanvas;
