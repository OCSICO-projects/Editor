import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

import { Folder } from '@app/shared/models/folder.model';

@Component({
	selector: 'app-create-popup',
	templateUrl: './create-popup.component.html',
	styleUrls: ['./create-popup.component.scss']
})
export class CreatePopupComponent implements OnInit {

	addFolderForm: FormGroup;
	folder: Folder;
	readOnly: boolean;

	constructor(
		public dialogRef: MatDialogRef<CreatePopupComponent>,
		private fb: FormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: any
	) { }

	public ngOnInit(): void {
		this.folder = {
			type: 'folder',
			name: '',
			version: null,
			parent_id: this.data.isFirst ? null : this.data.id,
		};

		this.initForm();
	}

	initForm() {
		this.addFolderForm = this.fb.group({
			name: [this.folder.name, [Validators.required]],
		});
	}

	public onFormSubmit(): void {
		const folder = new Folder(this.folder);
		this.dialogRef.close(folder);
	}
}
