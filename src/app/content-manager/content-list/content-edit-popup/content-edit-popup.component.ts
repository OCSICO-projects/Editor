import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

import { Folder } from '@app/shared/models/folder.model';
import { ContentManagerService } from '@app/content-manager/content-manager.service';

@Component({
	selector: 'app-content-edit-popup',
	templateUrl: './content-edit-popup.component.html',
	styleUrls: ['./content-edit-popup.component.scss']
})
export class ContentEditPopupComponent implements OnInit {

	form: FormGroup;
	name: string;
	resource = ['slide', 'hotspot', 'survey'];

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<ContentEditPopupComponent>,
		private contentManagerService: ContentManagerService,
		@Inject(MAT_DIALOG_DATA) private data: any,
	) { }

	ngOnInit() {
		this.name = this.data.name;
		this.initForm();
	}

	initForm() {
		this.form = this.fb.group({
			name: [this.name, [Validators.required]],
		});
	}

	onFormSubmit() {
		if (this.resource.includes(this.data.subtype)) {
			const editorModel = JSON.parse(this.data.content);
			editorModel.general.name = this.form.value.name;
			this.data.content = JSON.stringify(editorModel);
		}
		this.data.name = this.form.value.name;
		let updatedData = this.data;
		if (this.data.type === 'folder') {
			updatedData = new Folder(this.data);
		}
		updatedData.id = this.data.id;
		updatedData.version = this.data.version;
		this.dialogRef.close(updatedData);
		this.closeDialog();
	}

	closeDialog() {
		this.contentManagerService.onItemSelected.next(null);
	}
}
