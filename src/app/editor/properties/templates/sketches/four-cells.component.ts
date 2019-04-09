import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-four-cells',
	template: `
        <div class="sketch">
            <div class="columns">
                <div class="column-2 rows">
                    <div class="row-2 area"></div>
                    <div class="row-2 area"></div>
                </div>
                <div class="column-2 rows">
                    <div class="row-2 area"></div>
                    <div class="row-2 area"></div>
                </div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class FourCellsComponent {
}
