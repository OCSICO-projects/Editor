import { fabric } from 'fabric';

import { IInputOptions } from 'fabric/fabric-impl';

import FormElement from './FormElement';

export default class Input extends FormElement {
    _hostElement: HTMLInputElement;
    name: string;
    text: string;

    static fromObject(object: any, callback: (input: Input) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('Input', object, callback);
    }

    initialize(options: IInputOptions) {
        this.text = '';

        options.fill = options.fill || '#ffffff';
        options.strokeWidth = options.strokeWidth || 1;
        options.stroke = options.stroke || '#000000';
        options.textAlign = options.textAlign || 'left';
        options.name = options.name || null;

        // @ts-ignore
        super.initialize(options);

        this.type = 'input';
    }

    protected initHostElement(): void {
        this._hostElement = <HTMLInputElement>fabric.util.makeElement('input', {
            type: 'text',
            spellcheck: false,
        });

        if (this.name) { this._hostElement.name = this.name; }

        this._hostElement.addEventListener('input', this.handleInput.bind(this));

        fabric.util.setStyle(this._hostElement, {
            outline: 'none',
            borderRadius: '4px',
            padding: '0 8px',
        });
    }

    handleInput(e: any): void { this.text = e.target.value; };

    protected updateInnerDOM(): void {
        super.updateInnerDOM();

        if (this.text !== this._hostElement.value) {
            this._hostElement.value = this.text;
        }
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'name',
        ]));
    }

    dispose(): void {
        this._hostElement.removeEventListener('input', this.handleInput);

        super.dispose();
    }
}
