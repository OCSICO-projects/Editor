import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-comment',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.COMMENT' | translate}}"
            [object]="object"
            [isActive]="isActive"
            previewSrc="/assets/images/editor/icon-object-comment.png"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectCommentComponent extends ObjectAbstractComponent {

}
