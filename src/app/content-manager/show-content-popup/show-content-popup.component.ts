import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
	selector: 'app-show-content-popup',
	templateUrl: './show-content-popup.component.html',
	styleUrls: ['./show-content-popup.component.scss']
})
export class ShowContentPopupComponent implements OnInit {

	private readonly mediaTypePDF: string = 'application/pdf';
	private readonly initialDialogWidth = '700px';
	private readonly initialDialogHeight = '620px';
	private readonly toggledSize: string = '100%';

	videoUrl;
	fullScreen: boolean;
	url;
	sizeValue = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	constructor(
		public dialogRef: MatDialogRef<ShowContentPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private sanitizer: DomSanitizer
	) { }

	public ngOnInit(): void {
		this.contentUrl();
	}

	public contentUrl(): any {
		if (this.data.subtype === 'youtube') {
			return this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
		}

		if (this.data.subtype === 'video' || this.data.subtype === 'image') {
			return this.url = this.data.file.url;
		}

		if (this.data.subtype === 'slide') {
			return this.url = this.data.preview;
		}

		if (this.data.mediaType === this.mediaTypePDF || this.data.subtype === 'audio') {
			return this.data.file.preview;
		}
	}

	public getMediaSrc(): string {
		return this.data.preview;
	}

	public convertSize(kilobytes: number): string {
		const sizes = this.sizeValue;
		const i = Math.floor(Math.log(kilobytes) / Math.log(1024));
		return (kilobytes / Math.pow(1024, i)).toFixed(1) + sizes[i];
	}

	public toggleFullscreen(): void {

		this.fullScreen = !this.fullScreen;

		let width = this.toggledSize;
		let height = this.toggledSize;

		if (!this.fullScreen) {
			width = this.initialDialogWidth;
			height = 'auto';
		}

		this.dialogRef.updateSize(width, height);
	}
}
