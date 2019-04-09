import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Folder } from '@app/shared/models/folder.model';
import { ContentManagerService } from '@app/content-manager/content-manager.service';

@Component({
	selector: 'app-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit, OnChanges, OnDestroy {
	@Output() select: EventEmitter<Folder> = new EventEmitter();
	@Input() nodes: Array<Folder>;
	@Input() deletedId: string;
	@Input() isMove: boolean;
	openChild: boolean;

	onDestroy$ = new Subject();

	constructor(private contentManagerService: ContentManagerService) {
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.deletedId) {
			this.nodes = this.nodes.filter(el => el.id !== changes.deletedId.currentValue);
		}
	}

	ngOnInit() {
		if (this.nodes) {
			this.contentManagerService.onItemSelected
				.pipe(
					takeUntil(this.onDestroy$)
				)
				.subscribe(selected => {
					this.nodes = this.nodes.filter(el => {
						let nodes = true;
						if (selected && (selected.parent_id || selected.parent_id === null)) {
							nodes = el.id !== selected.id
						}
						return nodes;
					});
				});
		}
	}

	toggleChildren(node, event): void {
		event.stopPropagation();

		if (node.isSelected && node.isExpanded) {
			this.selectFolder(node.children);
		}

		node.isSelected = !node.isSelected;
		node.isExpanded = !node.isExpanded;
	}

	private deSelected(folders): void {
		folders.forEach((folder) => {
			folder.isSelected = false;
			folder.isExpanded = false;
			if (folder.children) {
				this.deSelected(folder.children);
			}
		});
	}

	selectFolder(folder): void { this.select.emit(folder) }

	onSelect(event): void { this.select.emit(event) }

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
