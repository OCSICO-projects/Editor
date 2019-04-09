import { fabric } from 'fabric';
import { ITextOptions } from 'fabric/fabric-impl';
import Button from './Button';

export default class VoucherButton extends Button {
    static fromObject(object: any, callback: (voucherButton: VoucherButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('VoucherButton', object, callback);
    }

    initialize(options: ITextOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'voucherButton';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionVoucher;
    }
}
