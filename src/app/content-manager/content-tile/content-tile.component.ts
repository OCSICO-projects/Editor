import { Component, OnInit, ViewChild, Input, EventEmitter, Output, HostListener, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { ContentManagerService } from '@app/content-manager/content-manager.service';
import { Folder } from '@app/shared/models/folder.model';
import { Resource } from '@app/shared/models/resource.model';

type Node = Folder | Resource;

interface Filter {
	type?: string[];
	mediaType?: string[];
}

@Component({
	selector: 'content-tile',
	templateUrl: './content-tile.component.html',
	styleUrls: ['./content-tile.component.scss']
})
export class ContentTileComponent implements OnInit, OnDestroy {

	private readonly contentTypeSlide: string = 'slide';
	private readonly contentTypeFolder: string = 'folder';

	@Input() filterInclude: Filter | undefined;
	@Input() filterExclude: Filter | undefined;
	@Input() listFolders: Folder[];
	@Input() listResources: Resource[];
	@Input() isLoad: boolean;
	@Input() public copiedNode: Node;
	@Input() dialogOptions: boolean;

	@Output() onShowNodeEmitter = new EventEmitter<Node>();
	@Output() deleteNode = new EventEmitter<Node>();
	@Output() editNode = new EventEmitter<Node>();
	@Output() moveNode = new EventEmitter<Node>();
	@Output() renameNode = new EventEmitter<Node>();

	@ViewChild(MatSort) gridSort: MatSort;
	@Output() select = new EventEmitter<Folder>();
	@Output() path = new EventEmitter<Folder>();
	@Output() contentMenuSelection = new EventEmitter<any>();
	@Output() openContentElement = new EventEmitter<Folder>();

	@Output() copyNode = new EventEmitter<Resource>();
	@Output() pasteNode = new EventEmitter<Resource>();

	dataSource = new MatTableDataSource();
	displayedColumns = ['icon', 'name', 'type', 'size', 'modified', 'detail-button'];
	selected: Folder;
	items: any;
	ctrlPressed: boolean;
	selectedContent: any = [];
	selectedNode: Resource | Folder;

	onDestroy$ = new Subject();

	constructor(
		private contentManagerService: ContentManagerService,
		public dialog: MatDialog,
		public dialogRef: MatDialogRef<ContentManagerService>,
	) { }

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
		this.setListDataSource();
		this.currentListNavigate();
	}

	private deselectNode(): void {
		this.dataSource.filteredData.forEach((el: any) => el.selected = false);
	}

	public onSelect(node: Folder | Resource): void {
	    if (node.disabled) {
	        return;
        }
		this.contentManagerService.selectSlide(node);
		let selectedNodes: any;
		if (this.ctrlPressed && node.type !== this.contentTypeFolder) {
			node.selected = !node.selected;

			selectedNodes = this.dataSource.filteredData.filter((el: Folder | Resource) => {
				if (el.selected && el.type === this.contentTypeFolder) {
					el.selected = false;
				}
				if (el.selected && el.type !== this.contentTypeFolder) {
					return el;
				}
			});
			this.contentManagerService.setContentMultiselect(true);
		}

		if (!this.ctrlPressed) {
			this.deselectNode();
			node.selected = true;
			this.selectedNode = Object.assign({}, node);
			this.selectedContent = [];
			selectedNodes = node;
			this.contentManagerService.setContentMultiselect(false);
		}

		this.contentManagerService.selectItem(selectedNodes);
	}

	public isEditable(row) {
		const type = (row.type || '').toLowerCase();
		return type === 'compose' && !row.disabled;
	}

	public nodePreview(node: Node) {
        if (node.disabled) {
            return;
        }

	    this.onShowNodeEmitter.emit(node);
	}

	public nodeEdit(node: Node) {
        if (node.disabled) {
            return;
        }

        this.editNode.emit(node);
	}

	public nodeChoose(node) {
        if (node.disabled) {
            return;
        }

		if (this.isEditable(node)) {
			this.nodeEdit(node);
		} else {
			this.nodePreview(node);
		}
	}

	public nodeMove(node: Node) { this.moveNode.emit(node); }

	public nodeDelete(node: Node) { this.deleteNode.emit(node); }

	public nodeRename(node: Node) { this.renameNode.emit(node); }

	private currentListNavigate() {
		this.contentManagerService.handleRequestCurrentList()
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(res => {
				this.contentManagerService.responseCurrentList(this.dataSource.filteredData);
			});
	}

	public setListDataSource(): void {
		this.contentManagerService.list
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(result => {
				if (!result) { return; }
				this.dataSource = new MatTableDataSource(result);
			});
	}

	public addToCanvas(item): void {
		const arrayItem = [];
		if (item.type !== this.contentTypeFolder) {
			arrayItem.push(item)
			this.dialogRef.close(arrayItem);
		}
	}

	public styleForItem(item) {

    }

	public ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
