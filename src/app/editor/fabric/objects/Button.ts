import { fabric } from 'fabric';
import { ITextOptions } from 'fabric/fabric-impl';
import FormElement from './FormElement';

export default class Button extends FormElement {
    text: string;
    textColor: string;
    _hostElement: HTMLButtonElement;

    static fromObject(object: any, callback: (button: Button) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('Button', object, callback);
    }

    initialize(options: ITextOptions) {
        this.text = '';
        this.textColor = '#ffffff';

        // @ts-ignore
        super.initialize(options);
        this.type = 'button';
    }

    protected initHostElement() {
        this._hostElement = <HTMLButtonElement>fabric.util.makeElement('button', {'data-form-submit': true});

        fabric.util.setStyle(this._hostElement, {
            borderRadius: '6px',
            cursor: 'pointer',
            color: this.textColor,
        });
    }

    protected updateInnerDOM(): void {
        super.updateInnerDOM();

        fabric.util.setStyle(this._hostElement, {
            color: this.textColor,
        });

        if (this._hostElement.innerText !== this.text) {
            this._hostElement.innerText = this.text;
        }
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'text',
            'textColor',
        ]));
    }
}
