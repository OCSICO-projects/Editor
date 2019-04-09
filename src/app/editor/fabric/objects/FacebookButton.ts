import { fabric } from 'fabric';
import { ISocialButtonOptions } from 'fabric/fabric-impl';
import SocialButton from './SocialButton';

import iconSquare from '../assets/facebook-square';
import iconCircle from '../assets/facebook-circle';
import iconRectangle from '../assets/facebook-rectangle';

export default class FacebookButton extends SocialButton {
    static fromObject(object: any, callback: (facebookButton: FacebookButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('FacebookButton', object, callback);
    }

    initialize(options: ISocialButtonOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'facebookButton';

        this.initHostElement();
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionFacebook;
        this._hostElement.dataset.socialName = 'facebook';
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
