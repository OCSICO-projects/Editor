import { Subject } from 'rxjs';
import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

import { Message } from '@app/shared/models/message.model';
import { ApiService } from '@app/core/services/api.service';
import { ContentManagerService } from '@app/content-manager/content-manager.service';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { ConfigType } from '@app/constants/config-type';
import { MessageService } from '@app/shared/services/message.service';

@Component({
	selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
	progress;
	progressPercents;
	uploadCount = 0;
	completedUploadCount = 0;
	showWarning: boolean;
	parentId: string;
	allProgressObservables = [];

	onDestroy$ = new Subject();

	public filesUpload: Set<File> = new Set();
	private readonly snackbarDuration: number = 2500;
	private readonly fileListSize: number = 10;

	constructor(
		private contentManagerService: ContentManagerService,
		private snackbarRef: MatSnackBar,
		@Inject(MAT_SNACK_BAR_DATA) public data: any,
		private apiService: ApiService,
		private cd: ChangeDetectorRef,
		public dialog: MatDialog,
		private translateService: TranslateService,
		private messageService: MessageService
	) { }


	ngOnInit() {
		this.setSnackbarFiles();
		this.onFilesAdded();
		this.upload();
		this.onClosePreloader();
	}

	public onClosePreloader() {
		this.messageService.messageClosed$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(res => this.snackbarRef.dismiss());
	}

	public cancelUpload(file): void {
		if (this.filesUpload.size === 1) {
			this.snackbarRef.dismiss();
			return;
		}

		this.filesUpload.delete(file);
	}

	private setSnackbarFiles(): void {
		this.contentManagerService.snackbarFiles
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(files => {
				if (!files) { return; }

				const filesArray = [...files];

				const additionalFilesSet: Set<File> = new Set();

				filesArray.forEach(file => {
					if (this.filesUpload.size < this.fileListSize) {
						const found = filesArray.find(item => {
							return item.name === file.name;
						});

						if (!found) {
							additionalFilesSet.add(file);
							this.filesUpload.add(file);
						}
					} else {
						this.showWarning = true;
					}
				});
				this.upload(additionalFilesSet);
			});
	}

	public onFilesAdded(): void {
		const files: { [key: string]: File } = this.data.files;
		for (const key in files) {
			if (files.hasOwnProperty(key)) {
				if (!isNaN(parseInt(key, 10)) && this.filesUpload.size < this.fileListSize) {
					this.filesUpload.add(files[key]);
				} else {
					this.showWarning = true;
				}
			}
		}
	}

	private openWarningDialog(): void {

		this.translateService.get('CONTENT.UPLOAD_WARNING').subscribe(subTitle => {
			const messageModel = new Message({
				type: ConfigType.typeError,
				subTitle: subTitle,
			});

			this.dialog.open(MessageComponent, {
				autoFocus: false,
				data: messageModel
			});
		});
	}

	public upload(additionalFiles?): void {
		if (this.showWarning) {
			this.openWarningDialog();
		}
		this.uploadCount++;
		this.parentId = this.data.parent && this.data.parent.isFirst ? null : this.data.parent.id;
		this.progress = this.apiService.uploadFiles(additionalFiles ? additionalFiles : this.filesUpload, this.parentId);

		this.apiService.uploadStatus
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(res => {
				if (res) {
					this.progressPercents = res;
					this.cd.markForCheck();
					if (this.checkUploads()) {
						setTimeout(() => { this.snackbarRef.dismiss() }, 2000);
					}
				}
			}, err => this.snackbarRef.dismiss());
	}

	private checkUploads(): boolean {
		let uploads = 0;
		for (const key in this.progressPercents) {
			if (this.progressPercents.hasOwnProperty(key)) {
				const element = this.progressPercents[key];
				this.contentManagerService.uploadProgressBar(element.progress);
				if ((element.complete || element.canceled) && !element.finish) {
					element.finish = true;
					if (element.complete) {
						this.contentManagerService.setUploadFile(element.body.data);
					}
				}

				if (element.complete || element.canceled || element.rejected) {
					uploads++;
				}

				if (element.progress === 100 && element.rejected) {
					this.contentManagerService.uploadProgressBar(null)
					return false
				} else if (element.progress === 100 && element.complete) {
					this.contentManagerService.uploadProgressBar(null)
					return true
				}
			}
		}
	}

	public ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
