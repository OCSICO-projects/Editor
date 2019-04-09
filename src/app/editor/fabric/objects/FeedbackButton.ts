import { fabric } from 'fabric';
import { ITextOptions } from 'fabric/fabric-impl';
import Button from './Button';

export default class FeedbackButton extends Button {
    static fromObject(object: any, callback: (feedbackButton: FeedbackButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('FeedbackButton', object, callback);
    }

    initialize(options: ITextOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'feedbackButton';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionFeedback;
    }
}
