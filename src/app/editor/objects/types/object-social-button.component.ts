import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-social-button',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.BUTTON' | translate}}"
            [object]="object"
            [isActive]="isActive"
            previewSrc="/assets/images/editor/icon-object-social-button.png"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectSocialButtonComponent extends ObjectAbstractComponent {

}
