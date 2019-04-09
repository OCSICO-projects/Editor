import { Component, ElementRef, OnDestroy, OnInit, DoCheck, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';
import { Slide } from '@app/editor/models/slide.model';

@Component({
	selector: 'app-editor-general-settings',
	templateUrl: './general-settings.component.html',
	styleUrls: ['./general-settings.component.scss', '../common.style.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GeneralSettingsComponent implements OnInit, DoCheck, OnDestroy {
	@ViewChild('backgroundColor') colorPickerRef: ElementRef;

	selectedObject: fabric.Object = null;
	slide: Slide;
	backgroundColor: string;
	isAreaExpanded = true;
	cpPosition = 'bottom';

	onDestroy$ = new Subject();

	constructor(private editorService: EditorService) { }

	setBackgroundColor(backgroundColor: string): void {
		this.slide.backgroundColor = backgroundColor;
		this.editorService.updateSlide(this.slide);
	}

	ngOnInit() {
		this.editorService.currentSlide$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(slide => {
				this.slide = slide;
			});

		this.editorService.selectedObject$
		.pipe(
			takeUntil(this.onDestroy$)
		)
		.subscribe(object => {
			this.selectedObject = object;
		});
	}

	ngDoCheck() {
		if (!this.colorPickerRef) { return; }
		const colorPickerElement = this.colorPickerRef.nativeElement;
		this.cpPosition = window.innerHeight - colorPickerElement.getBoundingClientRect().top < 300 ? 'top' : 'bottom';
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
