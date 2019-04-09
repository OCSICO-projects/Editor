import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-column-three-rows',
	template: `
        <div class="sketch">
            <div class="columns">
                <div class="column-2 area"></div>
                <div class="column-2 rows">
                    <div class="row-3 area"></div>
                    <div class="row-3 area"></div>
                    <div class="row-3 area"></div>
                </div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class ColumnThreeRowsComponent {
}
