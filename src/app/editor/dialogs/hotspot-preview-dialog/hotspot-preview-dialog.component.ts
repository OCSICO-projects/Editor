import { Component, ElementRef, Inject, NgZone, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import fabric from '@app/editor/fabric';
import Player from '@app/editor/fabric/player';
import { Slide } from '@app/editor/models/slide.model';

@Component({
	selector: 'app-hotspot-preview-dialog',
	templateUrl: './hotspot-preview-dialog.component.html',
	styleUrls: [
		'../dialog.style.scss',
		'../player.style.scss',
		'./hotspot-preview-dialog.component.scss'
	],
})
export class HotspotPreviewDialogComponent implements AfterViewInit, OnDestroy {
	@ViewChild('canvasPortait') canvasPortaitRef: ElementRef;
	@ViewChild('canvasLandscape') canvasLandscapeRef: ElementRef;

	canvasWidth = fabric.settings.resolutions.portait.width;
	canvasHeight = fabric.settings.resolutions.portait.height;

	private readonly initialDialogWidth = '60%';
	private readonly initialDialogHeight = 'auto';

	fullScreenMode = false;
	playerPortait: Player;
	playerLandscape: Player;

	constructor(
		public dialogRef: MatDialogRef<HotspotPreviewDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public currentSlide: Slide,
		private hostElementRef: ElementRef,
		private zone: NgZone,
	) { }

	ngAfterViewInit() {
		this.dialogRef.updateSize(this.initialDialogWidth, this.initialDialogHeight);

		this.zone.runOutsideAngular(() => {
			this.playerPortait = new Player(this.canvasPortaitRef.nativeElement, { interactive: false });
			this.playerLandscape = new Player(this.canvasLandscapeRef.nativeElement, { interactive: false });

			Promise.all([
				this.playerPortait.load([JSON.stringify(this.currentSlide)]),
				this.playerLandscape.load([JSON.stringify(this.currentSlide)]),
			])
				.then(() => {
					this.playerPortait.play();
					this.playerLandscape.play();
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
		this.playerPortait.dispose();
		this.playerLandscape.dispose();
	}
}
