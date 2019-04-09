import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';

@Component({
	selector: 'app-editor-text-settings',
	templateUrl: './text-settings.component.html',
	styleUrls: ['./text-settings.component.scss', '../common.style.scss'],
})
export class TextSettingsComponent implements OnInit, OnDestroy {

	selectedObject: fabric.IText | fabric.FormElement;
	textEditorExpanded = true;

	onDestroy$ = new Subject();

	constructor(private editorService: EditorService) { }

	isTextSelected() {
		return (
			this.selectedObject instanceof fabric.IText ||
			this.isRating() ||
			this.isFeedbackForm() ||
			this.isFormElement()
		);
	}

	isFormElement() { return this.selectedObject instanceof fabric.FormElement; }

	isButton() { return this.selectedObject instanceof fabric.Button; }

	isRating() { return this.selectedObject instanceof fabric.Rating; }

	isFeedbackForm() { return this.selectedObject instanceof fabric.FeedbackGroup; }

	toggleBold() {
		const fontWeight = this.selectedObject.fontWeight !== 'bold' ? 'bold' : '';
		this.selectedObject.fontWeight = fontWeight;
	}

	toggleItalic() {
		const fontStyle = this.selectedObject.fontStyle !== 'italic' ? 'italic' : '';
		this.selectedObject.fontStyle = fontStyle;
	}

	toggleUnderline() {
		this.selectedObject.underline = !this.selectedObject.underline;
	}

	pushHistoryState() {
		this.editorService.pushHistoryState();
	}

	ngOnInit() {
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(object => {
				this.selectedObject = <fabric.IText>object;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
