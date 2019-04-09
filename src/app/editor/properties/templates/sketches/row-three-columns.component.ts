import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-row-three-columns',
	template: `
        <div class="sketch">
            <div class="rows">
                <div class="row-2 area"></div>
                <div class="row-2 columns">
                    <div class="column-3 area"></div>
                    <div class="column-3 area"></div>
                    <div class="column-3 area"></div>
                </div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class RowThreeColumnsComponent {
}
