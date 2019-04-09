import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-two-rows',
	template: `
        <div class="sketch">
            <div class="rows">
                <div class="row-2 area"></div>
                <div class="row-2 area"></div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class TwoRowsComponent {
}
