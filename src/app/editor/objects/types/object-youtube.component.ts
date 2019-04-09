import { Component } from '@angular/core';

import { ObjectAbstractComponent } from '../object-abstract/object-abstract.component';

@Component({
    selector: 'app-editor-object-youtube',
    template: `
        <app-editor-object-abstract
            type="{{'EDITOR.OBJECTS.YOUTUBE' | translate}}"
            [object]="object"
            [isActive]="isActive"
            [previewSrc]="previewSrc || '/assets/images/editor/icon-object-video.png'"
        >
        </app-editor-object-abstract>
    `,
    styleUrls: ['../object-abstract/object-abstract.component.scss']
})
export class ObjectYoutubeComponent extends ObjectAbstractComponent {

}
