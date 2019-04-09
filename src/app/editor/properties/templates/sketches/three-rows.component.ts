import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-three-rows',
	template: `
        <div class="sketch">
            <div class="rows">
                <div class="row-3 area"></div>
                <div class="row-3 area"></div>
                <div class="row-3 area"></div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class ThreeRowsComponent {
}
