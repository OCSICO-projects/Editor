import { fabric } from 'fabric';

import { ITextOptions } from 'fabric/fabric-impl';

import Input from './Input';

export default class Password extends Input {
    static fromObject(object: any, callback: (password: Password) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('Password', object, callback);
    }

    initialize(options: ITextOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'password';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.type = 'password';
    }
}
