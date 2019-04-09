import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { Slide } from '@app/editor/models/slide.model';
import { RedirectType } from '@app/editor/models/general-settings.model';

import * as _ from 'lodash';

@Component({
	selector: 'survey-edit-dialog',
	templateUrl: './survey-edit-dialog.component.html',
	styleUrls: ['../dialog.style.scss'],
})
export class SurveyEditDialogComponent implements OnInit {
	surveyForm: FormGroup;
	currentSlide: Slide;
	RedirectType = RedirectType;

	constructor(
		public dialogRef: MatDialogRef<SurveyEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
	) {
		const slide = this.isNew() ? new Slide({ general: { subtype: 'survey' } }) : data.slide;
		this.currentSlide = _.cloneDeep(slide);
	}

	ngOnInit(): void {
		const slideSettings = this.currentSlide.general;

		this.surveyForm = this.fb.group({
      name: [slideSettings.name, [Validators.required]]
    });

		if (this.isNew()) { return; }

		this.surveyForm.addControl('ssid', new FormControl(slideSettings.ssid));
		this.surveyForm.addControl('trackingLink', new FormControl(slideSettings.trackingLink));

		this.surveyForm.addControl('redirectType', new FormControl(slideSettings.redirectType));

		if (slideSettings.redirectType === RedirectType.external) {
			this.surveyForm.addControl('redirectUrl', new FormControl(slideSettings.redirectEndpoint));
			this.surveyForm.addControl('redirectId', new FormControl(''));
		} else {
			this.surveyForm.addControl('redirectUrl', new FormControl(''));
			this.surveyForm.addControl('redirectId', new FormControl(slideSettings.redirectEndpoint));
		}
	}

	isNew() { return this.data && this.data.isNew; }

	onSubmit() {
		if (!this.surveyForm.valid) { return; }

		const formValues = this.surveyForm.getRawValue();

		if (!this.isNew()) {
			formValues.redirectEndpoint = formValues.redirectType === RedirectType.external
				? formValues.redirectUrl
				: formValues.redirectId;
			formValues.redirectEndpoint = formValues.redirectEndpoint || '';

			delete formValues.redirectUrl;
			delete formValues.redirectId;
		}

		Object.assign(this.currentSlide.general, formValues);
		this.dialogRef.close(this.currentSlide);
	}
}
