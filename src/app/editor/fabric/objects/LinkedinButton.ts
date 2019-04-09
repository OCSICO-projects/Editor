import { fabric } from 'fabric';
import { ISocialButtonOptions } from 'fabric/fabric-impl';
import SocialButton from './SocialButton';

import iconCircle from '../assets/linkedin-circle';
import iconSquare from '../assets/linkedin-square';
import iconRectangle from '../assets/linkedin-rectangle';

export default class LinkedinButton extends SocialButton {
    static fromObject(object: any, callback: (linkedinButton: LinkedinButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('LinkedinButton', object, callback);
    }

    initialize(options: ISocialButtonOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'linkedinButton';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionLinkedin;
        this._hostElement.dataset.socialName = 'linkedIn';
    }


    protected updateInnerDOM() {
        super.updateInnerDOM();

        if (this._shape !== this.shape) {
            this._shape = this.shape;

            switch (this.shape) {
                case 'square': this._hostElement.innerHTML = iconSquare; break;
                case 'circle': this._hostElement.innerHTML = iconCircle; break;
                case 'rectangle': this._hostElement.innerHTML = iconRectangle; break;
            }
        }
    }
}
