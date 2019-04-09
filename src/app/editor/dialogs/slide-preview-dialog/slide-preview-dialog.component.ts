import { Component, Inject, NgZone, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import fabric from '@app/editor/fabric';
import Player from '@app/editor/fabric/player';
import { Slide } from '@app/editor/models/slide.model';

@Component({
	selector: 'app-slide-preview-dialog',
	templateUrl: './slide-preview-dialog.component.html',
	styleUrls: [
		'../dialog.style.scss',
		'../player.style.scss',
		'./slide-preview-dialog.component.scss',
	],
})
export class SlidePreviewDialogComponent implements AfterViewInit, OnDestroy {
	@ViewChild('canvas') canvasRef: ElementRef;

	canvasWidth = fabric.settings.resolutions.landscape.width;
	canvasHeight = fabric.settings.resolutions.landscape.height;

	private readonly initialDialogWidth = '42.7%';
	private readonly initialDialogHeight = '60%';

	fullScreenMode = false;
	player: Player;
	duration: string;

	constructor(
		public dialogRef: MatDialogRef<SlidePreviewDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public currentSlide: Slide,
		private hostElementRef: ElementRef,
		private zone: NgZone,
	) {
		this.duration = String(Math.round(+this.currentSlide.general.duration / 1000));
	}

	findObjectByKey(array, key, value) {
		const result = array.find(item => item[key] === value);
		return result || { label: '' };
	}

	ngAfterViewInit() {
		this.dialogRef.updateSize(this.initialDialogWidth, this.initialDialogHeight);

		this.zone.runOutsideAngular(() => {
			this.player = new Player(this.canvasRef.nativeElement, { interactive: false, loop: !!this.currentSlide.general.duration });

			this.player.load([JSON.stringify(this.currentSlide)]).then(() => {
				this.player.play();
			});
		});
	}

	toggleFullScreenMode() {
		this.fullScreenMode = !this.fullScreenMode;

		if (this.fullScreenMode) {
			this.dialogRef.updateSize('100%', '100%');
		} else {
			this.dialogRef.updateSize(this.initialDialogWidth, this.initialDialogHeight);
		}
	}

	ngOnDestroy() {
		this.player.dispose();
	}
	
}
