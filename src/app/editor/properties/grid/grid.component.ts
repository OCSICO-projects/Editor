import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '@app/editor/services/editor.service';
import { Slide } from '@app/editor/models/slide.model';

@Component({
	selector: 'app-editor-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.scss', '../common.style.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GridComponent implements OnInit, OnDestroy {
	public min = 20;
	public max = 150;
	public step = 1;

	onDestroy$ = new Subject();
	private currentSlide: Slide;

	constructor(private editorService: EditorService) { }

	set showGrid(showGrid: boolean) {
		if (this.currentSlide) {
			this.currentSlide.general.showGrid = showGrid;
			this.editorService.pushHistoryState();
		}
		this.editorService.updateSlide(this.currentSlide);
	}

	get showGrid(): boolean {
		if (this.currentSlide) {
			return this.currentSlide.general.showGrid;
		}
	}

	set gridSize(gridSize: number) {
		this.editorService.updateSlide(this.currentSlide);
	}

	updateGridSize(value): void {
		if (this.currentSlide) {
			this.currentSlide.general.gridSize = value;
			this.editorService.updateSlide(this.currentSlide);
		}
	}

	get gridSize(): number {
		if (this.currentSlide) {
			return this.currentSlide.general.gridSize;
		}
	}

	ngOnInit() {
		this.editorService.currentSlide$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(slide => {
				this.currentSlide = slide;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
