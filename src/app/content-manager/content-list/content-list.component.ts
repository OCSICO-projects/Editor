import { Subject } from 'rxjs';
import { Component, OnInit, ViewChild, AfterContentChecked, Output, EventEmitter, Input, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSort, MatIconRegistry, MatTableDataSource, MatDialog, MatPaginator, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import * as moment from 'moment';
import * as _ from 'lodash';

import { Folder } from '@app/shared/models/folder.model';
import { Resource } from '@app/shared/models/resource.model';
import { ContentManagerService } from '@app/content-manager/content-manager.service';
import { DatasourceService } from '@app/content-manager/content-list/datasource.service';
import { takeUntil } from 'rxjs/operators';

type Node = Folder | Resource;

interface Filter {
	type?: string[];
	mediaType?: string[];
}

@Component({
	selector: 'content-list',
	templateUrl: './content-list.component.html',
	styleUrls: ['./content-list.component.scss'],
})
export class ContentListComponent implements OnInit, AfterContentChecked, OnDestroy {

	private readonly contentTypeSlide: string = 'slide';
	private readonly contentTypeHotspor: string = 'hotspot';
	private readonly contentTypeSurvey: string = 'survey';
	private readonly contentTypeFolder: string = 'folder';

	@Input() filterInclude: Filter | undefined;
	@Input() filterExclude: Filter | undefined;
	@Input() isLoad: boolean;
	@Input() dialogOptions: boolean;
	@Input() public copiedNode: Node;

	@Output() onShowNodeEmitter = new EventEmitter<Node>();
	@Output() deleteNode = new EventEmitter<Node>();
	@Output() editNode = new EventEmitter<Node>();
	@Output() moveNode = new EventEmitter<Node>();
	@Output() renameNode = new EventEmitter<Node>();
	@Output() select = new EventEmitter<Folder>();
	@Output() path = new EventEmitter<Folder>();
	@Output() contentMenuSelection = new EventEmitter<any>();
	@Output() openContentElement = new EventEmitter<Folder>();
	@Output() shareNode = new EventEmitter<Resource>();

	@Output() copyNode = new EventEmitter<Resource>();
	@Output() pasteNode = new EventEmitter<null>();

	@ViewChild(MatSort) gridSort: MatSort;

	displayedColumns: string[] = ['icon', 'name', 'type', 'size', 'modified', 'more'];
	dataSource;

	ctrlPressed: boolean;
	selectedContent: any = [];
	selectedNode: Resource | Folder;
	sortTimeout: any;

	onDestroy$ = new Subject();

	constructor(
		private contentManagerService: ContentManagerService,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		public dialog: MatDialog,
		private datasourceService: DatasourceService,
		public dialogRef: MatDialogRef<ContentManagerService>,
	) {

	}

	public ngAfterContentChecked(): void {
		if (this.dataSource) {
			this.dataSource.sort = this.gridSort;
		}
	}

	@HostListener('window:keydown', ['$event']) public onKeyPressed($event: KeyboardEvent): void {
		if ($event.ctrlKey || $event.metaKey) {
			this.ctrlPressed = true;
		}
	}

	@HostListener('window:keyup', ['$event']) public onKeyUpped($event: KeyboardEvent): void {
		if ($event.keyCode === 17 || !$event.metaKey) {
			this.ctrlPressed = false;
		}
	}

	public ngOnInit(): void {
		this.datasourceService.loadResources();
		this.setListDataSource();
		this.currentListNavigate();
	}

	public dateFormat(date): string {
		return moment(date).format('LLL');
	}

	private deselectNode(): void {
		this.dataSource.forEach((el: any) => el.selected = false);
	}

	public onSelect(node: Folder | Resource): void {
		let selectedNodes: any;
		if (this.ctrlPressed && node.type !== this.contentTypeFolder) {
			node.selected = !node.selected;

			selectedNodes = this.dataSource.filter((el: Folder | Resource) => {

				if (el.selected && el.type === this.contentTypeFolder) {
					el.selected = false;
				}

				if (el.selected) {
					return el;
				}
			});
			this.contentManagerService.setContentMultiselect(true);
		}

		if (!this.ctrlPressed) {
			this.contentManagerService.setContentMultiselect(false);
			this.deselectNode();
			node.selected = true;
			this.selectedNode = Object.assign({}, node);
			this.selectedContent = [];
			selectedNodes = node;
		}

		this.contentManagerService.selectItem(selectedNodes);
	}

	public isEditable(row) {
		const type = (row.type || '').toLowerCase();
		return type === 'compose';
	}

	public nodePreview(node: Node): void { this.onShowNodeEmitter.emit(node); }

	public nodeEdit(node: Node) { this.editNode.emit(node); }

	public nodeChoose(node) {
		if (this.isEditable(node)) {
			this.nodeEdit(node);
		} else {
			this.nodePreview(node);
		}
	}

	public nodeMove(node: Node) { this.moveNode.emit(node); }

	public nodeDelete(node: Node) { this.deleteNode.emit(node); }

	public nodeCopy(node: Resource) { this.copyNode.emit(node); }

	public nodePaste() { this.pasteNode.emit(null); }

	public nodeRename(node: Node) { this.renameNode.emit(node); }

	public nodeShare(node: Resource): void { this.shareNode.emit(node); }

	private currentListNavigate() {
		this.contentManagerService.handleRequestCurrentList()
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(res => {
				this.contentManagerService.responseCurrentList(this.dataSource);
			});
	}

	public convertSize(kilobytes: number): string {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(kilobytes) / Math.log(1024));
		return (kilobytes / Math.pow(1024, i)).toFixed(1) + sizes[i];
	}

	public setListDataSource(): void {
		this.datasourceService.connect()
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(data => {
				if (!data) { return; }
				this.dataSource = _.cloneDeep(data);
			});
	}

	public addToCanvas(item): void {
		const arrayItem = [];
		if (item.type !== this.contentTypeFolder) {
			arrayItem.push(item)
		}
		this.dialogRef.close(arrayItem);
	}

	public ngOnDestroy(): void {
		clearTimeout(this.sortTimeout);
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
