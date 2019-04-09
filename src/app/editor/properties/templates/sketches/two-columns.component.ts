import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-two-columns',
	template: `
        <div class="sketch">
            <div class="columns">
                <div class="column-2 area"></div>
                <div class="column-2 area"></div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class TwoColumnsComponent {
}
