import { fabric } from 'fabric';

import { ITextOptions } from 'fabric/fabric-impl';

import FormElement from './FormElement';

export default class Comment extends FormElement {
    _hostElement: HTMLTextAreaElement;
    text: string;

    static fromObject(object: any, callback: (comment: Comment) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('Comment', object, callback);
    }

    initialize(options: ITextOptions) {
        this.text = '';

        options.fill = options.fill || '#ffffff';
        options.strokeWidth = options.strokeWidth || 1;
        options.stroke = options.stroke || '#000000';
        options.textAlign = options.textAlign || 'left';
        options.lineHeight = options.lineHeight || 1.3;

        // @ts-ignore
        super.initialize(options);

        this.type = 'comment';
    }

    protected initHostElement() {
        this._hostElement = <HTMLTextAreaElement>fabric.util.makeElement('textarea', { name: this.id });

        this._hostElement.addEventListener('input', this.handleInput.bind(this));

        fabric.util.setStyle(this._hostElement, {
            padding: '4px 8px',
            resize: 'none',
        });

        this.updateInnerDOM();
    }

    handleInput(e: any): void { this.text = e.target.value; }

    protected updateInnerDOM(): void {
        super.updateInnerDOM();

        if (this.text !== this._hostElement.value) {
            this._hostElement.value = this.text;
        }
    }

    dispose(): void {
        this._hostElement.removeEventListener('input', this.handleInput);

        super.dispose();
    }
}
