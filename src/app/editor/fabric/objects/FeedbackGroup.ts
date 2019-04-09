import { fabric } from 'fabric';
import { IFeedbackGroupOptions } from 'fabric/fabric-impl';

import FormGroup from './FormGroup';


export default class FeedbackGroup extends FormGroup {
    protected _fill: string;
    protected _fontSize: number;
    protected _fontStyle: string;
    protected _fontWeight: string;
    protected _textBackgroundColor: string;
    protected _textColor: string;
    protected _borderWidth: number;
    protected _startSize: number;
    protected _stroke: string;
    protected _underline: boolean;

    set fill(value) { this._fill = value; this.setNestedProperties(); }
    get fill() { return this._fill; }

    set fontSize(value) { this._fontSize = value; this.setNestedProperties(); }
    get fontSize() { return this._fontSize; }

    set fontStyle(value) { this._fontStyle = value; this.setNestedProperties(); }
    get fontStyle() { return this._fontStyle; }

    set fontWeight(value) { this._fontWeight = value; this.setNestedProperties(); }
    get fontWeight() { return this._fontWeight; }

    set textBackgroundColor(value) { this._textBackgroundColor = value; this.setNestedProperties(); }
    get textBackgroundColor() { return this._textBackgroundColor; }

    set textColor(value) { this._textColor = value; this.setNestedProperties(); }
    get textColor() { return this._textColor; }

    set borderWidth(value) { this._borderWidth = value; this.setNestedProperties(); }
    get borderWidth() { return this._borderWidth; }

    set starSize(value) { this._startSize = value; this.setNestedProperties(); }
    get starSize() { return this._startSize; }

    set stroke(value) { this._stroke = value; this.setNestedProperties(); }
    get stroke() { return this._stroke; }

    set underline(value) { this._underline = value; this.setNestedProperties(); }
    get underline() { return this._underline; }

    static fromObject(object: any, callback: (feedbackForm: FeedbackGroup) => any): void {
        // @ts-ignore
        fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
            // @ts-ignore
            const options = fabric.util.object.clone(object, true);
            delete options.objects;
            // @ts-ignore
            if (callback) { callback(new fabric.FeedbackGroup(enlivenedObjects, options, true)); }
        });
    }

    initialize(items?: any[], options?: IFeedbackGroupOptions) {
        options.borderWidth = options.borderWidth || 0;
        options.fill = options.fill || '#fc6a42';
        options.fontSize = options.fontSize || 40;
        options.fontStyle = options.fontStyle || '';
        options.fontWeight = options.fontWeight || '';
        options.starSize = options.starSize || 40;
        options.stroke = options.stroke || '#000000';
        options.textBackgroundColor = options.textBackgroundColor || '#cccccc';
        options.textColor = options.textColor || '#000000';
        options.underline = ('underline' in options) ? options.underline : false;

        // @ts-ignore
        super.initialize(items, options);
        this.type = 'feedbackGroup';
        this.setNestedProperties();
    }

    setNestedProperties() {
        this.getObjects()
            .filter(object => object instanceof fabric.Rating)
            // @ts-ignore
            .forEach(object => object.setOptions({
                fill: this.fill,
                fontSize: this.fontSize,
                fontStyle: this.fontStyle,
                fontWeight: this.fontWeight,
                textBackgroundColor: this.textBackgroundColor,
                textColor: this.textColor,
                starSize: this.starSize,
                strokeWidth: this.borderWidth,
                stroke: this.stroke,
                underline: this.underline,
            }));
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'borderWidth',
            'fontStyle',
            'fontWeight',
            'starSize',
            'textBackgroundColor',
            'textColor',
            'textDecoration',
            'underline',
        ]));
    }

}
