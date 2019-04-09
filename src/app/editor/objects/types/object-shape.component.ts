import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-shape',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.SHAPE' | translate}}"
            [object]="object"
            [isActive]="isActive"
            previewSrc="/assets/images/editor/icon-object-shape.png"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectShapeComponent extends ObjectAbstractComponent {

}
