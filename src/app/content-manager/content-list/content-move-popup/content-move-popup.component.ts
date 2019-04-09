import { MatDialogRef } from '@angular/material';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as _ from 'lodash';

import { Folder } from '@app/shared/models/folder.model';
import { ContentManagerService } from '@app/content-manager/content-manager.service';

@Component({
  selector: 'app-content-move-popup',
  templateUrl: './content-move-popup.component.html',
  styleUrls: ['./content-move-popup.component.scss']
})
export class ContentMovePopupComponent implements OnInit, OnDestroy {

  onDestroy$ = new Subject();

  selectedFolderId: string = null;
  selectedFolderName = 'Documents';
  selectedParentId: string = null;
  folderList: Folder[];
  default = [];

  constructor(
    public dialogRef: MatDialogRef<ContentMovePopupComponent>,
    private contentManagerService: ContentManagerService
  ) { }

  public ngOnInit(): void {
    this.getFoldersList();
  }

  private unselected(nodes): void {
    nodes.forEach((el: any) => {
      el.isSelected = false;
      if (el.children && el.children.length) {
        this.unselected(el.children);
      }
    });
  }

  private getFoldersList(): void {
    this.contentManagerService.getList('folders')
      .pipe(
        takeUntil(this.onDestroy$)
      )
      .subscribe((result: Folder[]) => {
        this.folderList = _.cloneDeep(result);
        this.unselected(this.folderList);
        this.unExpanded(this.folderList);
      });
  }

  private unExpanded(nodes): void {
    nodes.forEach((el: any) => {
      el.isExpanded = false;
      if (el.children && el.children.length) {
        this.unExpanded(el.children);
      }
    });
  }

  public onSelectFolder(node): void {
    if (node.children && node.children.length) {
      this.unselected(node.children);
    }
    let nodeParentId = node.parent_id;
    let nodeId = node.id;
    let nodeName = node.name;
    if (node.isExpanded === false && !node.parent_id) {
      nodeId = null;
      nodeName = 'Documents';
    }
    this.selectedFolderId = nodeId;
    this.selectedFolderName = nodeName;
    this.selectedParentId = nodeParentId;

    node.isSelected = this.selectedFolderId === node.id;

    if (node.parent_id && node.isExpanded === false) {
      this.folderList.forEach(el => {
        if (node.parent_id === el.id) {
          this.selectedFolderName = el.name
          return this.selectedFolderName;
        } else {
          this.updateLocationName(el, node, nodeName);
        }
      })
    }

    if (!node.isExpanded) {
      node.isSelected = false;
    }
    if (node.isExpanded) {
      node.isSelected = true;
    }
  }

  public updateLocationName(el, node, nodeName) {
    if (el.children && el.children.length) {
      el.children.forEach(childItem => {
        if (childItem.id === node.parent_id) {
          this.selectedFolderName = childItem.name
          return this.selectedFolderName;
        } else {
          if (childItem.children && childItem.children.length) {
            return this.updateLocationName(childItem, node, nodeName);
          }
        }
      })
    }
	}

	closeDialog() {
		this.contentManagerService.onItemSelected.next(null);
	}

  public applyChanges(): void {
    this.dialogRef.close({ folder_id: this.selectedFolderId });
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
