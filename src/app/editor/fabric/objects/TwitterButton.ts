import { fabric } from 'fabric';
import { ISocialButtonOptions } from 'fabric/fabric-impl';
import SocialButton from './SocialButton';

import iconCircle from '../assets/twitter-circle';
import iconSquare from '../assets/twitter-square';
import iconRectangle from '../assets/twitter-rectangle';

export default class TwitterButton extends SocialButton {
    static fromObject(object: any, callback: (twitterButton: TwitterButton) => any): void {
        // @ts-ignore
        fabric.Object._fromObject('TwitterButton', object, callback);
    }

    initialize(options: ISocialButtonOptions) {
        // @ts-ignore
        super.initialize(options);
        this.type = 'twitterButton';
    }

    protected initHostElement() {
        super.initHostElement();

        this._hostElement.formAction = fabric.settings.actionTwitter;
        this._hostElement.dataset.socialName = 'twitter';
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
