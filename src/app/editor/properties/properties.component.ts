import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';
import { AnimationsComponentDeclarations } from '@app/editor/properties/animations/animations.component';
import { TemplatesComponentDeclarations } from '@app/editor/properties/templates/templates.component';
import { GeneralSettingsComponent } from '@app/editor/properties/general-settings/general-settings.component';
import { TextSettingsComponent } from '@app/editor/properties/text-settings/text-settings.component';
import { ShapeSettingsComponent } from '@app/editor/properties/shape-settings/shape-settings.component';
import { ObjectSettingsComponent } from '@app/editor/properties/object-settings/object-settings.component';
import { SocialSettingsComponent } from '@app/editor/properties/social-settings/social-settings.component';
import { ConnectSettingsComponent } from '@app/editor/properties/connect-settings/connect-settings.component';
import { GridComponent } from '@app/editor/properties/grid/grid.component';

@Component({
	selector: 'app-editor-properties',
	templateUrl: './properties.component.html',
	styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit, OnDestroy {

	selectedObject: fabric.Object | null;
	onDestroy$ = new Subject();

	constructor(private editorService: EditorService) { }

	isFormGroup() { return this.selectedObject instanceof fabric.FormGroup; }

	isAnimationAvailable() {
		return !(this.selectedObject instanceof fabric.FormGroup || this.selectedObject instanceof fabric.FormElement);
	}

	ngOnInit() {
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(object => {
				this.selectedObject = object;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}

export const PropertiesComponentDeclarations = [
	PropertiesComponent,
	AnimationsComponentDeclarations,
	TemplatesComponentDeclarations,
	GeneralSettingsComponent,
	ObjectSettingsComponent,
	TextSettingsComponent,
	ShapeSettingsComponent,
	SocialSettingsComponent,
	ConnectSettingsComponent,
	GridComponent,
];
