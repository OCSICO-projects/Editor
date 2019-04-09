import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

import fabric from '@app/editor/fabric';
import { EditorService } from '@app/editor/services/editor.service';
import { EditorApiService } from '@app/editor/services/editor-api.service';

@Component({
	selector: 'app-editor-object-abstract',
	templateUrl: './object-abstract.component.html',
	styleUrls: ['./object-abstract.component.scss']
})

export class ObjectAbstractComponent implements OnInit {
	constructor(
		public editorService: EditorService,
		private editorApiService: EditorApiService
	) { }

	id: string;
	parentId: string;

	@ViewChild('input') input: ElementRef;
	@Input() object: fabric.Object;
	@Input() type: string;
	@Input() isActive: boolean;
	@Input() isActiveGroup: boolean;
	@Input() previewSrc: string | null;

	ngOnInit() {
		this.parentId = this.object.resourceParentId;
		this.id = this.object.resourceId;
	}

	onChangeName() {
		if (['image', 'video'].includes(this.input.nativeElement.title)) {
			this.editorApiService.updateObject(this.input.nativeElement.value, this.id, this.parentId).subscribe();
		}
	}

	delete() {
		this.editorService.deleteObject(this.object);
	}

	select() {
		this.editorService.selectObject(null);
		this.editorService.selectObject(this.object);
	}

	isCopyAvailable() {
		return (
			!(this.object instanceof fabric.FormGroup) &&
			!(this.object instanceof fabric.Input) &&
			!(this.object instanceof fabric.Rating) &&
			!(this.object instanceof fabric.Comment) &&
			!(this.object instanceof fabric.Button) &&
			!(this.object instanceof fabric.SocialButton)
		);
	}

	isDeleteAvailable() {
		return (
			!(this.object instanceof fabric.Input) &&
			!(this.object instanceof fabric.Button)
		);
	}

	copy() {
		this.object.clone((newObject) => {
			let { top: topOrigin, left: leftOrigin } = this.object;

			if (this.object instanceof fabric.FormElement) {
				const cssTransform = this.object.getCSSTransform();

				topOrigin = cssTransform.top;
				leftOrigin = cssTransform.left;
			}

			newObject.setOptions({
				title: `${this.object.title} copy`,
				top: topOrigin + 15,
				left: leftOrigin + 15,
				id: fabric.util.generateId(),
			});

			this.editorService.addObject(newObject);
		});
	}

	toggleVisibility() {
		this.object.visible = !this.object.visible;
		this.editorService.pushHistoryState();
	}

}
