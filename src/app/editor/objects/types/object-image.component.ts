import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-image',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.IMAGE' | translate}}"
            [object]="object"
            [isActive]="isActive"
            [previewSrc]="previewSrc || '/assets/images/editor/icon-object-button.png'"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['./../object-abstract/object-abstract.component.scss']
})
export class ObjectImageComponent extends ObjectAbstractComponent {

}
