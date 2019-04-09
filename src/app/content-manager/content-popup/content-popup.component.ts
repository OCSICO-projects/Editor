import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MatIconRegistry, MatSnackBar, MAT_DIALOG_DATA, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import * as _ from 'lodash';

import { IconGenerator } from '@app/shared/components/icon-generator';
import { Folder } from '@app/shared/models/folder.model';
import { Resource } from '@app/shared/models/resource.model';
import { AuthService } from '@app/auth/auth.service';
import { ContentManagerService } from '@app/content-manager/content-manager.service';
import { ShowContentPopupComponent } from '@app/content-manager/show-content-popup/show-content-popup.component';
import { CreatePopupComponent } from '@app/content-manager/create-popup/create-popup.component';
import { FileUploadComponent } from '@app/content-manager/file-upload/file-upload.component';
import { ContentEditPopupComponent } from '@app/content-manager/content-list/content-edit-popup/content-edit-popup.component';
import { ContentMovePopupComponent } from '@app/content-manager/content-list/content-move-popup/content-move-popup.component';
import { MessageService } from '@app/shared/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentDeletePopupComponent } from '@app/content-manager/content-list/content-delete-popup/content-delete-popup.component';
import { AddYoutubeComponent } from '@app/content-manager/add-youtube/add-youtube.component';

interface Filter {
	type?: string[];
	subtype?: string[];
	mediaType?: string[];
}

interface DialogOptions {
	filterInclude?: Filter;
	filterExclude?: Filter;
	flag?: boolean;
}

@Component({
	selector: 'content-popup',
	templateUrl: './content-popup.component.html',
	styleUrls: ['./content-popup.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ContentPopupComponent implements OnInit, OnDestroy {

	@ViewChild('contentManagerSidenav') contentManagerSidenav;
	@ViewChild('fileInput') file;

	private readonly snackbarDuration: number = 1000;
	private readonly defocusDuration: number = 350;
	private readonly routeContent: string = 'apps/content';
	private readonly routeEditor: string = '/editor';
	private readonly nodeTypeFolder: string = 'folder';
	private readonly nodeTypeYoutube: string = 'youtube';
	private readonly nodeTypeVimeo: string = 'vimeo';
	private readonly nodeTypeFile: string = 'file';
	private readonly nodeSubtypePDF: string = 'pdf';
	private readonly nodeTypeCompose: string = 'compose';

	viewTypeToggle = true;
	listFolders: Folder[];
	listResources: Resource[];
	routeFolder: Folder;
	pathArr = [];
	clearButtonVisible: boolean;
	list: any;
	uploadProgress: number;
	searchString: string;
	selected;
	snackBarOpen: boolean;
	originFolders;
	selectedNodes = [];
	selectedNode: Folder | Resource;
	copiedNode;
	horizontalPosition: MatSnackBarHorizontalPosition = 'center';
	verticalPosition: MatSnackBarVerticalPosition = 'bottom';
	isLoad: boolean;
	dialogOption:any = this.dialogOptions;

	onDestroy$ = new Subject();

	constructor(
		private contentManagerService: ContentManagerService,
		private authService: AuthService,
		public dialog: MatDialog,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		private route: ActivatedRoute,
		private router: Router,
		public dialogRef: MatDialogRef<ContentManagerService>,
		public snackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) protected dialogOptions: DialogOptions,
		private messageService: MessageService,
		private translateService: TranslateService,
	) {
		this.dialogOptions = dialogOptions || {};
		const generator = new IconGenerator(iconRegistry, sanitizer);
		generator.getIcon('youtube');
	}

	public ngOnInit(): void {
		this.pathArr.push({ isFirst: true, id: 0, name: 'Home' });
		this.handleCurrentList();
		this.getFolderList();
		this.selectedItem();
		this.updateAfterUpload();
		this.contentManagerService.uploadProgress
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(progress => {
				this.uploadProgress = progress;
			})
	}

	private updateAfterUpload(): void {
		this.contentManagerService.requestCurrentList();
		this.contentManagerService.fileUpload
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(res => {

				if (!res) {
					return;
				}

				if (res.preview) {
					res.image = res.preview;
				}
				res.icon = res.subtype;

				if (res.folder_id == this.pathArr[this.pathArr.length - 1].id) {
					this.list.push(res);
				}

				if (!res.folder_id && this.pathArr[this.pathArr.length - 1].isFirst) {

					this.list.push(res);
				}
				this.contentManagerService.onSetList(this.list)
			});
	}

	public selectedItem(): void {
		this.contentManagerService.onItemSelected
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(selected => {
				this.selected = selected;
			});
	}

	private openSnackBar(title: string): void {
		this.snackBar.open(title, '', {
			duration: this.snackbarDuration,
			horizontalPosition: this.horizontalPosition,
			verticalPosition: this.verticalPosition,
			panelClass: 'snack-bar'
		});
	}

	public onClose(): void {
		this.dialogRef.close();
	}

	public addFile(): void {
		const arrayItem = [];

		if (this.selected && this.selected.length) {
			this.selected.forEach(el => {
				if (el.type !== this.nodeTypeFolder) {
					arrayItem.push(el);
				}
			})
		} else {
			arrayItem.push(this.selected);
		}
		this.dialogRef.close(arrayItem);
	}

	private handleCurrentList(): void {
		this.contentManagerService.handleResponseCurrentList()
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(list => {
				this.list = list;
			});
	}

	public handleShowNode(node: Folder | Resource): void {
		if (node.type === this.nodeTypeFolder) {
			this.getFolderList(node.id);
			this.pathArr.push(node);
			return;
		}
		if ([this.nodeTypeYoutube, this.nodeTypeFile, this.nodeTypeCompose].includes(node.type)) {
			this.dialog.open(ShowContentPopupComponent, {
				autoFocus: false,
				panelClass: 'contents-show-form-dialog',
				data: node
			});
			return;
		}

	}

	public openContentDialog(menuSelector: number, title?: string, type?: string): void {
		if (menuSelector === 1) {
			const dialogRef = this.dialog.open(CreatePopupComponent, {
				autoFocus: false,
				panelClass: 'contents-add-form-dialog',
				data: this.pathArr[this.pathArr.length - 1]
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result) {
					this.addContentNode(result);
				}
			});
		}
	}

	public openYouTubeDialog() {
		const dialogRef = this.dialog.open(AddYoutubeComponent, {
			autoFocus: false,
			panelClass: 'contents-add-form-dialog'
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.addContentNode(result);
			}
		});
	}

	private addContentNode(node: Folder | Resource) {
		let method;
		let params;

		this.contentManagerService.requestCurrentList();

		if (node && node[0] && node[0].url) {
			method = `resources`;
			params = { 'name': node[0].snippet.title, 'folder_id': node.folder_id, 'url': node[0].url, 'type': 'file', 'subtype': 'youtube' };
		} else {
			method = `folders`;
			params = { 'name': node.name, 'parent_id': node.parent_id };
		}
		this.contentManagerService.addContentNode(method, params)
			.subscribe((response: Resource | Folder) => {
				response.name = response.name;
				response.id = response.id;
				response.icon = response.subtype
				this.list.push(response);
				this.contentManagerService.onSetList(this.list);
			});
	}

	public renameNode(node): void {
		if (node) {
			this.contentManagerService.requestCurrentList();
			const dialogRef = this.dialog.open(ContentEditPopupComponent, {
				autoFocus: false,
				panelClass: 'contents-add-form-dialog',
				data: node
			});

			dialogRef.afterClosed().subscribe(result => {
				if (!result) { return; }

				this.contentManagerService.updateNode(result).subscribe((updatedNode: Folder | Resource) => {
					this.list.forEach(el => {
						if (updatedNode && updatedNode.parent_id === this.selected.folder_id) {
							el.name = updatedNode.name;
							el.title = updatedNode.title;
							el.version = updatedNode.version;
							el.updated_at = updatedNode.updated_at;
							this.contentManagerService.setRenameFolder(el);
						}
					});
					this.contentManagerService.onSetList(this.list);
				});
			});
		}
	}


	public changeNodeLocation(node: Folder | Resource): void {
		if (node) {
			const dialogRef = this.dialog.open(ContentMovePopupComponent, {
				autoFocus: false,
				panelClass: 'contents-move-form-dialog'
			});

			dialogRef.afterClosed().subscribe(result => {
				if (!result) { return; }

				this.contentManagerService.requestCurrentList();
				if (node.type === 'folder') {
					node.parent_id = result.folder_id;
				} else {
					node.folder_id = result.folder_id;
				}

				if (['slide', 'hotspot', 'survey'].includes(node.subtype)) {
					const editorModel = JSON.parse(node.content);
					editorModel.general.parent_id = result.parent_id;
					node.file = JSON.stringify(editorModel);
				}

				this.contentManagerService.updateNode(node).subscribe((updatedNode: Folder | Resource) => {
					this.list = this.list.filter(el => { return el.selected ? el.id !== updatedNode.id : true });
					this.contentManagerService.folders.subscribe(result => {
						result.forEach(el => {
							if (updatedNode.parent_id === el.id || updatedNode.folder_id === el.id) {
								el.children.push(updatedNode);
							} else {
								this.updateFolderList(el, updatedNode)
							}
						});
					})

					this.translateService.get('CONTENT.ITEM_CHANGE_LOCATION').subscribe(msg => {
						this.messageService.showSuccessMessage(msg);
					});
					this.contentManagerService.onSetList(this.list);
				});
			});
		}
	}

	public updateFolderList(el, updatedNode) {
		if (el.children && el.children.length) {
			el.children.forEach(childItem => {
				if (updatedNode.parent_id === childItem.id) {
					childItem.children.push(updatedNode);
				} else {
					if (childItem.children && childItem.children.length) {
						return this.updateFolderList(childItem, updatedNode)
					}
				}
			})
		}
	};

	public deleteContentNode(node: Folder | Resource): void {
		if (node) {
			const dialogRef = this.dialog.open(ContentDeletePopupComponent, {
				autoFocus: false,
				panelClass: 'contents-add-form-dialog',
				data: node
			});

			dialogRef.afterClosed().subscribe(result => {
				if (!result) { return; }
				const idsForDeleted = this.selectedNodes.map(el => el.id);

				this.contentManagerService.requestCurrentList();
				this.contentManagerService.removeContentNode(node && node.type === this.nodeTypeFolder ?
					`folders/${node.id}` : `resources/${node.id}`, {
						'name': node.name
					}).subscribe(result => {

						if (result) {
							this.list = this.list.filter(el => el.id !== node.id);
						}

						if (!result) {
							this.contentManagerService.setDeleteFolder(node);
						}

						this.contentManagerService.onSetList(this.list);
						this.selectedNodes = [];
					});

			});
		}
	}

	private getFolderList(id?: string): void {
		this.contentManagerService.getList(`folders`).subscribe((result: Folder[]) => {
			if (!result) {
				this.contentManagerService.populateFolderList();
				return;
			}

			if (result) {
				this.contentManagerService.populateFolderList();
			}

			if (id) {
				const routeFolder = this.contentManagerService.findRouteFolder(id, result);
				this.contentManagerService.setEvent(routeFolder);
				this.getResourceList(routeFolder.children, routeFolder.id);
				return;
			}

			this.getResourceList(result);
			this.contentManagerService.setEvent({ isFirst: true });
		});
	}

	private getResourceList(list: Folder[], folder_id?: string): void {
		this.isLoad = false;
		if (!folder_id) {
			this.contentManagerService.getList(`resources`)
				.subscribe((result: Resource[]) => {
					this.isLoad = true;
					result.forEach(el => {
						let found = false;
						list.forEach(elFolder => {
							if (elFolder.id === el.folder_id) {
								found = true;
							}
							if (folder_id === elFolder.parent_id && folder_id === el.folder_id) {
								list.push(el);
								list.push(elFolder);
							}
						});
						if (!found && !el.folder_id) {
							list.push(el);
						}
					});
					list = list.filter(el => this.dialogOptions.flag ? ['compose', 'folder'].includes(el.type) : ['file', 'folder'].includes(el.type) || ['youtube', 'video', 'image'].includes(el.subtype));
					this.list = list;
					this.contentManagerService.onSetList(list);
				});
		} else {
			this.contentManagerService.getList(`folders/${folder_id}/resources`)
				.subscribe((result: Resource[]) => {
					this.isLoad = true;
					result.forEach(el => {
						list.push(el);
					});
					list = list.filter(el => this.dialogOptions.flag ? ['compose', 'folder'].includes(el.type) : ['file', 'folder'].includes(el.type) || ['youtube', 'video', 'image'].includes(el.subtype));
					this.list = list;
					this.contentManagerService.onSetList(list);
				});
		}
	}

	public openSlideEditDialog(): void {
		this.router.navigate([this.routeEditor]);
	}

	public changeViewType(): void {
		this.viewTypeToggle = !this.viewTypeToggle;
		this.viewTypeToggle ? this.contentManagerSidenav.open() : this.contentManagerSidenav.close();
	}

	public breadcrumbsEmitter(nodes: Folder[]): void {
		this.pathArr = nodes;
	}

	public selectBreadCrumb(node: any): void {
		this.pathArr.forEach((el, i) => {
			if (el.id === node.id) {
				this.pathArr.splice(i + 1);
			}
		});
		if (node.isFirst) {
			this.getFolderList();
			return;
		}

		this.getFolderList(node.id);
	}

	public deFocus(): void {
		setTimeout(() => { this.clearButtonVisible = false; }, this.defocusDuration);
	}

	public closeSidenav(): void {
		if (this.contentManagerSidenav.opened) {
			this.contentManagerSidenav.close();
			return;
		}

		this.contentManagerSidenav.open();
	}

	public uploadFile(fileList: FileList): void {
		this.contentManagerService.requestCurrentList();

		if (this.snackBarOpen) {
			this.contentManagerService.setSnackbarfiles(Array.from(fileList));
		} else {
			this.snackBarOpen = true;

			const snackBarRef = this.snackBar.openFromComponent(FileUploadComponent, {
				data: { files: fileList, parent: this.pathArr[this.pathArr.length - 1] },
				panelClass: 'upload-snackbar',
				horizontalPosition: 'end',
				verticalPosition: 'top',
			});

			snackBarRef.afterDismissed().subscribe(res => {

				const folders: Folder[] = [];
				const list = this.pathArr[this.pathArr.length - 1].children;
				let parentFolderId = null;

				if (!this.pathArr[this.pathArr.length - 1].isFirst) {
					parentFolderId = this.pathArr[this.pathArr.length - 1].id;
				}
				this.list.forEach(el => {
					if (el.type === this.nodeTypeFolder) {
						folders.push(el);
					}
				});

				this.originFolders = _.cloneDeep(folders);

				this.snackBarOpen = false;
				this.file.nativeElement.value = '';
			});
		}
	}

	public clearSearch(): void {
		this.searchString = '';
		this.contentManagerService.requestCurrentList();
		this.contentManagerService.onSetList(this.list);
	}

	public ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
