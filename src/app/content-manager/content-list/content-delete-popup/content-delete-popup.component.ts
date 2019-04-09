import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-content-delete-popup',
	templateUrl: './content-delete-popup.component.html',
	styleUrls: ['./content-delete-popup.component.scss']
})
export class ContentDeletePopupComponent {

	constructor(
		public dialogRef: MatDialogRef<ContentDeletePopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }
}
