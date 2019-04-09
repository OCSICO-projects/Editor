import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-cell',
	template: `
        <div class="sketch">
            <div class="cell area"></div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class CellComponent {
}
