import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-three-columns',
	template: `
        <div class="sketch">
            <div class="columns">
                <div class="column-3 area"></div>
                <div class="column-3 area"></div>
                <div class="column-3 area"></div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class ThreeColumnsComponent {
}
