import { Component } from '@angular/core';

@Component({
	selector: 'app-editor-template-theater',
	template: `
        <div class="sketch">
            <div class="rows">
                <div class="row-theater-big columns">
                    <div class="column-theater-small area"></div>
                    <div class="column-theater-big area"></div>
                    <div class="column-theater-small area"></div>
                </div>
                <div class="row-theater-small area"></div>
            </div>
        </div>
    `,
	styleUrls: ['./styles.scss']
})
export class TheaterComponent {
}
