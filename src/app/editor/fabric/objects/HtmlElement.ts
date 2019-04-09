import { fabric } from 'fabric';
import { ITextOptions } from 'fabric/fabric-impl';

export default abstract class HtmlElement extends fabric.Object {
    protected _hostElement: HTMLElement;
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    fontStyle: string;
    textAlign: string;
    lineHeight: number;
    underline: boolean;

    static fromObject(object: any, callback: any): void {
        throw new Error(`Method fromObject() must be implemented in clas inhereted from FormElement`);
    }

    initialize(options: ITextOptions) {
        this.fill = '#dddddd';
        this.strokeWidth = 0;
        this.stroke = '#ffffff';
        this.textAlign = 'center';
        this.fontStyle = '';
        this.fontWeight = '';
        this.fontSize = 14;
        this.fontFamily = 'arial';
        this.lineHeight = 1.2;

        // @ts-ignore
        super.initialize(options);
        this.type = 'htmlElement';

        this.initHostElement();
    }

    getHostElement(): HTMLElement { return this._hostElement; }

    render(ctx: CanvasRenderingContext2D): void { this.updateInnerDOM(); }

    protected abstract initHostElement(): void;

    protected updateInnerDOM(): void {
        const shadow = this.shadow;
        const boxShadow = this.showShadow && shadow && typeof shadow === 'object'
            ? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
            : 'none';

        const transform = this.getTransformProperties();

        const borderWidth = this.strokeWidth / 2;
        const width = (this.width + this.strokeWidth) * Math.abs(transform.scaleX);
        const height = (this.height + this.strokeWidth) * Math.abs(transform.scaleY);
        const top = transform.translateY - Math.abs(height / 2);
        const left = transform.translateX - Math.abs(width / 2);
        const scaleX = transform.scaleX < 0 ? -1 : 1;
        const scaleY = transform.scaleY < 0 ? -1 : 1;

        fabric.util.setStyle(this._hostElement, {
            position: 'absolute',
            width: width + 'px',
            height: height + 'px',
            top: top + 'px',
            left: left + 'px',
            border: `${borderWidth}px solid ${this.stroke}`,
            outline: 'none',
            boxShadow,
            backgroundColor: this.fill,
            transform: `rotate(${transform.angle}deg) scale(${scaleX}, ${scaleY})`,
            // transformOrigin: `${this.originX} ${this.originY}`,
            opacity: this.opacity,
            fontFamilty: this.fontFamily,
            fontWeight: this.fontWeight,
            fontStyle: this.fontStyle,
            fontSize: this.fontSize + 'px',
            textAlign: this.textAlign,
            textDecoration: this.underline ? 'underline' : 'none',
            lineHeight: this.lineHeight,
            boxSizing: 'border-box',
            visibility: this.isNotVisible() ? 'hidden' : 'visible',
            pointerEvents: 'auto',
        });
    }

    getTransformProperties() {
        let matrix;

        // @ts-ignore
        if (this.group && !this.group._transformDone) {
            // @ts-ignore
            matrix = this.calcTransformMatrix();
        } else {
            // @ts-ignore
            matrix = this.calcOwnMatrix();
        }

        return fabric.util.qrDecompose(matrix);
    }

    getCSSTransform() {
        const transform = this.getTransformProperties();

        const width = this.width * Math.abs(transform.scaleX);
        const height = this.height * Math.abs(transform.scaleY);

        return {
            width,
            height,
            top: transform.translateY - Math.abs(height / 2),
            left: transform.translateX - Math.abs(width / 2),
            scaleX: transform.scaleX < 0 ? -1 : 1,
            scaleY: transform.scaleY < 0 ? -1 : 1,
        };
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'textAlign',
            'fontStyle',
            'fontWeight',
            'fontSize',
            'fontFamily',
            'lineHeight',
            'underline',
        ]));
    }

    dispose() { this._hostElement.remove(); }
}
