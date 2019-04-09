import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-content-item-icon',
	templateUrl: './content-item-icon.component.html',
	styleUrls: ['./content-item-icon.component.scss']
})
export class ContentItemIconComponent {
	@Input() row;
}
