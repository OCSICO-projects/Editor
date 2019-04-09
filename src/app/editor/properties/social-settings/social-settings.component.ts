import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';

import fabric from '@app/editor/fabric';
import { SocialButtonShape } from 'fabric/fabric-impl';
import { EditorService } from '@app/editor/services/editor.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-editor-social-settings',
	templateUrl: './social-settings.component.html',
	styleUrls: ['./social-settings.component.scss', '../common.style.scss']
})
export class SocialSettingsComponent implements OnInit, OnDestroy {

	selectedObject: fabric.SocialButton;
	socialEditorExpanded = true;

	onDestroy$ = new Subject();

	constructor(
		private selectImageDialog: MatDialog,
		private editorService: EditorService,
	) { }

	pushHistoryState() { this.editorService.pushHistoryState(); }

	isSocialButtonSelected() { return this.selectedObject instanceof fabric.SocialButton; }

	changeShape(shape: SocialButtonShape): void {
		if (shape === this.selectedObject.shape) { return; }

		if (shape === 'rectangle') {
			const { scaleX, scaleY } = this.selectedObject;
			this.selectedObject.setOptions({ scaleX: scaleX * 3.04, scaleY: scaleY * 0.46 });
		}

		if (this.selectedObject.shape === 'rectangle') {
			const { scaleX, scaleY } = this.selectedObject;
			this.selectedObject.setOptions({ scaleX: scaleX / 3.04, scaleY: scaleY / 0.46 });
		}

		this.selectedObject.set('shape', shape);
		this.editorService.pushHistoryState();
	}

	ngOnInit() {
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(object => {
				this.selectedObject = <fabric.SocialButton>object;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
