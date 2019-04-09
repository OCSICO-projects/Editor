import { fabric } from 'fabric';
import { ITextOptions } from 'fabric/fabric-impl';
import Button from './Button';

export default class ConnectButton extends Button {
    static fromObject(object: any, callback: (connectButton: ConnectButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('ConnectButton', object, callback);
    }

    initialize(options: ITextOptions) {
        // @ts-ignore
        super.initialize(options);
        this.fill = '#fc6a42';
        this.type = 'connectButton';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionConnect;
    }
}
