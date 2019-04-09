import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '@app/editor/services/editor.service';
import { CanvasTemplates } from '@app/editor/models/canvas-templates.model';
import { Slide } from '@app/editor/models/slide.model';
import { TwoColumnsComponent } from '@app/editor/properties/templates/sketches/two-columns.component';
import { TwoRowsComponent } from '@app/editor/properties/templates/sketches/two-rows.component';
import { RowTwoColumnsComponent } from '@app/editor/properties/templates/sketches/row-two-columns.component';
import { CellComponent } from '@app/editor/properties/templates/sketches/cell.component';
import { FourCellsComponent } from '@app/editor/properties/templates/sketches/four-cells.component';
import { TwoColumnsRowComponent } from '@app/editor/properties/templates/sketches/two-columns-row.component';
import { ColumnTwoRowsComponent } from '@app/editor/properties/templates/sketches/column-two-rows.component';
import { ThreeColumnsComponent } from '@app/editor/properties/templates/sketches/three-columns.component';
import { RowThreeColumnsComponent } from '@app/editor/properties/templates/sketches/row-three-columns.component';
import { ColumnThreeRowsComponent } from '@app/editor/properties/templates/sketches/column-three-rows.component';
import { ThreeRowsComponent } from '@app/editor/properties/templates/sketches/three-rows.component';
import { TheaterComponent } from '@app/editor/properties/templates/sketches/theater.component';

@Component({
	selector: 'app-editor-templates',
	templateUrl: './templates.component.html',
	styleUrls: ['./templates.component.scss', '../common.style.scss']
})
export class TemplatesComponent implements OnInit, OnDestroy {
	isTemplateShown = true;

	onDestroy$ = new Subject();

	private activeTemplate: CanvasTemplates;
	private currentSlide: Slide;

	constructor(private editorService: EditorService) { }

	set showTemplate(isTemplateShown) {
		if (this.currentSlide) {
			this.currentSlide.general.showTemplate = isTemplateShown;
			this.editorService.updateSlide(this.currentSlide);
		}
	}

	get showTemplate() {
		if (this.currentSlide) {
			return this.currentSlide.general.showTemplate;
		}
	}

	ngOnInit() {
		this.editorService.currentSlide$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(slide => {
				this.currentSlide = slide;
				this.activeTemplate = slide.general.templateId;
				this.isTemplateShown = slide.general.showTemplate;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	changeTemplate(templateId: CanvasTemplates) {
		this.currentSlide.general.templateId = templateId;
		this.editorService.pushHistoryState();
	}

	getActiveTemplate() { return this.activeTemplate; }
}

export const TemplatesComponentDeclarations = [
	TemplatesComponent,
	CellComponent,
	FourCellsComponent,
	TwoColumnsComponent,
	TwoRowsComponent,
	RowTwoColumnsComponent,
	TwoColumnsRowComponent,
	ColumnTwoRowsComponent,
	ThreeColumnsComponent,
	RowThreeColumnsComponent,
	ColumnThreeRowsComponent,
	ThreeRowsComponent,
	TheaterComponent,
];
