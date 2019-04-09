import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-text',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.TEXT' | translate}}"
            [object]="object"
            [isActive]="isActive"
            previewSrc="/assets/images/editor/icon-object-text.png"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectTextComponent extends ObjectAbstractComponent {

}
