import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { Slide } from '@app/editor/models/slide.model';
import { RedirectType } from '@app/editor/models/general-settings.model';

import * as _ from 'lodash';

@Component({
	selector: 'hotspot-edit-dialog',
	templateUrl: './hotspot-edit-dialog.component.html',
	styleUrls: ['../dialog.style.scss'],
})
export class HotspotEditDialogComponent implements OnInit {
	hotspotForm: FormGroup;
	currentSlide: Slide;
	RedirectType = RedirectType;

	constructor(
		public dialogRef: MatDialogRef<HotspotEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
	) {
		const slide = this.isNew() ? new Slide({ general: { type: 'compose', subtype: 'hotspot' } }) : data.slide;
		this.currentSlide = _.cloneDeep(slide);
	}

	ngOnInit(): void {
		const slideSettings = this.currentSlide.general;
		
		this.hotspotForm = this.fb.group({
      name: [slideSettings.name, [Validators.required]]
    });

		if (this.isNew()) { return; }

		this.hotspotForm.addControl('ssid', new FormControl(slideSettings.ssid));
		this.hotspotForm.addControl('redirectType', new FormControl(slideSettings.redirectType));

		if (slideSettings.redirectType === RedirectType.external) {
			this.hotspotForm.addControl('redirectUrl', new FormControl(slideSettings.redirectEndpoint));
			this.hotspotForm.addControl('redirectId', new FormControl(''));
		} else {
			this.hotspotForm.addControl('redirectUrl', new FormControl(''));
			this.hotspotForm.addControl('redirectId', new FormControl(slideSettings.redirectEndpoint));
		}
	}

	isNew() { return this.data && this.data.isNew; }

	onSubmit() {
		if (!this.hotspotForm.valid) { return; }

		const formValues = this.hotspotForm.getRawValue();

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
