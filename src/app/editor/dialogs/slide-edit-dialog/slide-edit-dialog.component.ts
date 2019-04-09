import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { Slide } from '../../models/slide.model';

import * as _ from 'lodash';

@Component({
	selector: 'slide-edit-dialog',
	templateUrl: './slide-edit-dialog.component.html',
	styleUrls: ['../dialog.style.scss'],
})
export class SlideEditDialogComponent implements OnInit {
	slideForm: FormGroup;
	currentSlide: Slide;
	slideSettings: any;

	constructor(
		public dialogRef: MatDialogRef<SlideEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder
	) {
		const slide = this.isNew() ? new Slide() : data.slide;
		this.currentSlide = _.cloneDeep(slide);
	}

	ngOnInit(): void {
		this.slideSettings = this.currentSlide.general;
		this.initForm();
	}

	public initForm() {
		this.slideForm = this.fb.group({
      name: [this.slideSettings.name, [Validators.required]]
    });
	}

	isNew() { return this.data && this.data.isNew; }

	onSubmit() {
		if (this.slideForm.valid) {
			const values = { ...this.slideForm.value };

			if (values.duration) { values.duration = String(values.duration * 1000); }

			Object.assign(this.currentSlide.general, values);
			this.dialogRef.close(this.currentSlide);
		}
	}

}
