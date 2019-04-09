// tslint:disable
import { fabric } from 'fabric';
import { IRatingOptions } from 'fabric/fabric-impl';

import FormElement from './FormElement';

export default class Rating extends FormElement {
    static starId = 0;

    starSize: number;
    starDistance: number;
    text: string;
    textColor: string;
    textBackgroundColor: string;

    protected styleEl: HTMLStyleElement;
    protected textEl: HTMLDivElement;
    protected ratingEl: HTMLDivElement;
    _hostElement: HTMLDivElement;

    static fromObject(object: any, callback: (rating: Rating) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('Rating', object, callback);
    }

    initialize(options: IRatingOptions) {
        options.textAlign = options.textAlign || 'center';
        options.text = ('text' in options) ? options.text : 'Question?';

        // @ts-ignore
        super.initialize(options);

        this.type = 'rating';

        this.initStyles();
    }

    protected initHostElement(): void {
        this.initStyles();
        this._hostElement = document.createElement('div');

        this.textEl = document.createElement('div');
        this.ratingEl = <HTMLDivElement>fabric.util.makeElement('div', { class: `canvas-rating-${this.id}` });

        for (let i = 5; i > 0; i--) {
            const id = `_canvas-rating-star-${Rating.starId++}`;
            this.ratingEl.innerHTML += `
                <input type="radio" name="fb-${this.id}" id="${id}" value="${i}" /><label for="${id}"></label>
            `;
        }

        fabric.util.setStyle(this._hostElement, {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            justifyContent: 'center',
        });

        fabric.util.setStyle(this.ratingEl, {
            display: 'flex',
            flexFlow: 'row-reverse nowrap',
            alignItems: 'center',
            textBackgroundColor: this.textBackgroundColor
        });

        this._hostElement.appendChild(this.textEl);
        this._hostElement.appendChild(this.ratingEl);

        this.updateInnerDOM();
    }

    protected updateInnerDOM(): void {
        super.updateInnerDOM();

        if (this.textEl.innerText !== this.text) { this.textEl.innerText = this.text; }

        const transform = this.getTransformProperties();

        const width = this.width * Math.abs(transform.scaleX);
        const height = this.height * Math.abs(transform.scaleY);
        const top = transform.translateY - Math.abs(height / 2);
        const left = transform.translateX - Math.abs(width / 2);

        fabric.util.setStyle(this._hostElement, {
            width: width + 'px',
            height: height + 'px',
            top: top + 'px',
            left: left + 'px',
            backgroundColor: 'transparent',
            border: '',
            textDecoration: 'none',
        });

        fabric.util.setStyle(this.textEl, {
            color: this.textColor,
            fontSize: this.fontSize + 'px',
            textDecoration: this.underline ? 'underline' : 'none',
            fontStyle: this.fontStyle,
            fontWeight: this.fontWeight,
        });

        fabric.util.setStyle(this.ratingEl, {
            justifyContent: this.mapTextAlignToFlex(this.textAlign),
            webkitTextStroke: `${this.strokeWidth}px ${this.stroke}`,
            textStroke: `${this.strokeWidth}px ${this.stroke}`,
            textDecoration: 'none',
            fontStyle: 'normal',
            fontWeight: 'normal',
            // fontSize: this.starSize + 'px'
        });

        this.updateStyles();
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'starSize',
            'starDistance',
            'text',
            'textColor',
            'textBackgroundColor',
        ]));
    }

    protected mapTextAlignToFlex(align: string) {
        switch (align) {
            case 'left': return 'flex-end';
            case 'right': return 'flex-start';
            case 'justify': return 'space-between';
            default: return 'center';
        }
    }

    protected initStyles(): void {
        this.styleEl =  <HTMLStyleElement>fabric.util.makeElement('style');

        document.querySelector('head').appendChild(this.styleEl);
    }

    protected updateStyles(): void {
        const styles = `
            .canvas-rating-${this.id} > input {
                position:absolute;
                visibility: hidden;
            }
            .canvas-rating-${this.id} > label {
                float: right;
                width: calc(1em + ${this.strokeWidth * 2}px);
                overflow: hidden;
                white-space: nowrap;
                cursor: pointer;
                color: ${this.textBackgroundColor};
                margin: 0 ${this.starDistance/2}px
            }
            .canvas-rating-${this.id} > label:before {
                content: '\u2605 ';
            }
            .canvas-rating-${this.id} > input:checked ~ label {
                color: ${this.fill};
            }
            .canvas-rating-${this.id} > label:hover,
            .canvas-rating-${this.id} > label:hover ~ label {
                color: ${shadeColor(this.fill, -0.1)};
            }
            .canvas-rating-${this.id} > input:checked + label:hover,
            .canvas-rating-${this.id} > input:checked + label:hover ~ label,
            .canvas-rating-${this.id} > input:checked ~ label:hover,
            .canvas-rating-${this.id} > input:checked ~ label:hover ~ label,
            .canvas-rating-${this.id} > label:hover ~ input:checked ~ label {
                color: ${shadeColor(this.fill, -0.25)};
            }
        `;

        if (this.styleEl.innerHTML !== styles) { this.styleEl.innerHTML = styles; }
    }

    dispose() {
        super.dispose();

        this.styleEl.remove();
    }
}

function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? percent * -1 : percent;
    const R = f >> 16;
    const G = f >> 8 & 0x00FF;
    const B = f & 0x0000FF;

    const hexValue = (
        0x1000000 +
        (Math.round((t - R) * p) + R ) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
    );

    return '#' + hexValue.toString(16).slice(1);
}
