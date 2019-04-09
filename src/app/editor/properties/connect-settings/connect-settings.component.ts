import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';

@Component({
	selector: 'app-editor-connect-settings',
	templateUrl: './connect-settings.component.html',
	styleUrls: ['./connect-settings.component.scss', '../common.style.scss']
})
export class ConnectSettingsComponent implements OnInit, OnDestroy {
	selectedObject: fabric.ConnectGroup;
	connectEditorExpanded = true;
	
	onDestroy$ = new Subject();

	constructor(private editorService: EditorService) { }

	isConnectSelected(): boolean { return this.selectedObject instanceof fabric.ConnectGroup; }

	ngOnInit() {
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe((object: fabric.ConnectGroup) => {
				this.selectedObject = object;

				if (!object) { return; }
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
