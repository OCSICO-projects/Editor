import { fabric } from 'fabric';
import { ISocialButtonOptions, SocialButtonAction, SocialButtonShape } from 'fabric/fabric-impl';
import FormElement from './FormElement';

export default abstract class SocialButton extends FormElement {
    shape: SocialButtonShape;
    _shape: SocialButtonShape;
    _hostElement: HTMLButtonElement;

    action: SocialButtonAction = {
        accessType: 'login',
        redirectUrl: '',
        post: {
            page: '',
            text: '',
            image: '',
            imageEnabled: false,
        },
        like: {
            page: '',
        },
    };

    initialize(options: ISocialButtonOptions) {
        options.shape = options.shape || 'square';
        options.fill = options.fill || '#ffffff';

        // @ts-ignore
        super.initialize(options);
        this.type = 'facebookButton';

        this.initHostElement();
    }

    protected initHostElement() {
        this._hostElement = <HTMLButtonElement>fabric.util.makeElement('button', { type: 'submit' });

        fabric.util.setStyle(this._hostElement, {
            borderRadius: '6px',
            padding: '0',
            cursor: 'pointer',
        });
    }

    protected updateInnerDOM() {
        super.updateInnerDOM();

        fabric.util.setStyle(this._hostElement, { backgroundColor: 'transparent' });
    }

    toObject(propertiesToInclude: string[] = []) {
        return super.toObject(propertiesToInclude.concat([
            'action',
            'shape',
        ]));
    }
}
