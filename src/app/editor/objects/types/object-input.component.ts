import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-input',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.INPUT' | translate}}"
            [object]="object"
            [isActive]="isActive"
            previewSrc="/assets/images/editor/icon-object-input.png"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectInputComponent extends ObjectAbstractComponent {

}
