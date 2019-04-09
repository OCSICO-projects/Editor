import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Message } from '@app/shared/models/message.model';
import { ConfigType } from '@app/constants/config-type';

@Component({
	selector: 'app-message',
	templateUrl: './message.component.html',
	styleUrls: ['./message.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MessageComponent {
	configType = ConfigType;
	
	constructor(
		public dialogRef: MatDialogRef<MessageComponent>,
		@Inject(MAT_DIALOG_DATA) public message: Message,
	) { }

}
