import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';

@Component({
	selector: 'app-editor-shape-settings',
	templateUrl: './shape-settings.component.html',
	styleUrls: ['./shape-settings.component.scss', '../common.style.scss']
})
export class ShapeSettingsComponent implements OnInit, OnDestroy {
	public min = 0;
	public max = 50;
	public step = 1;

	selectedObject: fabric.Object;
	connectEditorExpanded = true;

	onDestroy$ = new Subject();

	private _strokeLineJoin: string;
	private _borderRadius: number;

	constructor(private editorService: EditorService) { }

	isShapeSelected() {
		return (
			this.selectedObject instanceof fabric.Rect ||
			this.selectedObject instanceof fabric.Triangle ||
			this.selectedObject instanceof fabric.Path
		);
	}

	isRectangleSelected() { return this.selectedObject instanceof fabric.Rect; }

	set strokeLineJoin(value: string) {
		this._strokeLineJoin = value;
		this.selectedObject.setOptions({ strokeLineJoin: value });
		this.editorService.pushHistoryState();
	}

	get strokeLineJoin() { return this._strokeLineJoin; }

	set borderRadius(value: number) {
		this._borderRadius = value;

		const percent = value / 100;

		const width = this.selectedObject.width;
		const height = this.selectedObject.height;

		this.selectedObject.setOptions({
			ry: width * percent,
			rx: height * percent,
		});
	}

	get borderRadius() { return this._borderRadius; }

	ngOnInit() {
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(object => {
				this.selectedObject = object;

				if (!object) { return; }

				this._strokeLineJoin = object.strokeLineJoin || 'miter';

				if (object instanceof fabric.Rect) {
					this._borderRadius = Math.round(object.rx / object.width * 100);
				}
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
