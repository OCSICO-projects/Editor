import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { Slide } from '@app/editor/models/slide.model';
import { EditorService } from '@app/editor/services/editor.service';
import { ObjectAbstractComponent } from '@app/editor/objects/object-abstract/object-abstract.component';
import { ObjectShapeComponent } from '@app/editor/objects/types/object-shape.component';
import { ObjectTextComponent } from '@app/editor/objects/types/object-text.component';
import { ObjectImageComponent } from '@app/editor/objects/types/object-image.component';
import { ObjectVideoComponent } from '@app/editor/objects/types/object-video.component';
import { ObjectFormGroupComponent } from '@app/editor/objects/types/object-form-group.component';
import { ObjectInputComponent } from '@app/editor/objects/types/object-input.component';
import { ObjectButtonComponent } from '@app/editor/objects/types/object-button.component';
import { ObjectSocialButtonComponent } from '@app/editor/objects/types/object-social-button.component';
import { ObjectRatingComponent } from '@app/editor/objects/types/object-rating.component';
import { ObjectCommentComponent } from '@app/editor/objects/types/object-comment.component';
import { ObjectYoutubeComponent } from '@app/editor/objects/types/object-youtube.component';

@Component({
	selector: 'app-editor-objects',
	templateUrl: './objects.component.html',
	styleUrls: ['./objects.component.scss'],
})
export class ObjectsComponent implements OnInit, OnDestroy {
	objectList: fabric.Object[] = [];

	simpleObjects: fabric.Object[] = [];
	simpleHtmlObjects: fabric.HtmlElement[] = [];
	formObjects: fabric.FormElement[] = [];

	currentSlide: Slide;
	selectedObject: fabric.Object;
	formGroup: fabric.FormGroup | null;
	
	onDestroy$ = new Subject();

	constructor(
		public editorService: EditorService,
	) { }

	isShape(object: fabric.Object) {
		return (
			object instanceof fabric.Rect ||
			object instanceof fabric.Circle ||
			object instanceof fabric.Triangle ||
			object instanceof fabric.Path
		);
	}

	isText(object: fabric.Object) { return object instanceof fabric.Text; }

	isImage(object: fabric.Object) { return object instanceof fabric.Image; }

	isVideo(object: fabric.Object) { return object instanceof fabric.Video; }

	isButton(object: fabric.Object) { return object instanceof fabric.Button; }

	isSocialButton(object: fabric.Object) { return object instanceof fabric.SocialButton; }

	isRating(object: fabric.Object) { return object instanceof fabric.Rating; }

	isInput(object: fabric.Object) { return object instanceof fabric.Input; }

	isComment(object: fabric.Object) { return object instanceof fabric.Comment; }

	isYoutube(object: fabric.Object) { return object instanceof fabric.Youtube; }

	getFormGroup(): fabric.FormGroup {
		return this.objectList.find(object => object instanceof fabric.FormGroup) as fabric.FormGroup;
	}

	getFormElements(formGroup: fabric.FormGroup, objects: fabric.Object[]): fabric.FormElement[] {
		const groupedObjects = <fabric.FormElement[]>(formGroup && formGroup.getObjects() || []);
		const canvasElements = <fabric.FormElement[]>objects.filter(object => this.isFormElement(object));
		const groupedElements = groupedObjects;
		const elements = [...canvasElements, ...groupedElements];

		elements.sort(this.sortHtmlElements);

		return elements;
	}

	isHtmlElement(object: fabric.Object) { return object instanceof fabric.HtmlElement; }

	isFormElement(object: fabric.Object) {
		return (
			object instanceof fabric.HtmlElement &&
			!(object instanceof fabric.Youtube)
		);
	}

	isDraggable(object: fabric.Object) { return !(object instanceof fabric.Group) && !(object instanceof fabric.HtmlElement); }

	sortHtmlElements(a: fabric.HtmlElement, b: fabric.HtmlElement) {
		// @ts-ignore
		const orderA = a.canvas.getFormElementOrder(a);
		// @ts-ignore
		const orderB = b.canvas.getFormElementOrder(b);

		return orderA - orderB;
	}

	ngOnInit() {
		this.editorService.objectList$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(objects => {
				this.objectList = objects;

				this.formGroup = <fabric.FormGroup>objects.find(object => object instanceof fabric.FormGroup) || null;

				this.simpleObjects = objects.filter(object => !(object instanceof fabric.Group) && !this.isHtmlElement(object));
				this.simpleHtmlObjects = <fabric.HtmlElement[]>objects.filter(object => this.isHtmlElement(object) && !this.isFormElement(object));
				this.formObjects = this.getFormElements(this.formGroup, objects);
			});
		this.editorService.currentSlide$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(slide => {
				this.currentSlide = slide;
			});
		this.editorService.selectedObject$
			.pipe(
				takeUntil(this.onDestroy$)
			).subscribe(selected => {
				this.selectedObject = selected;
			});
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}

export const ObjectsComponentDeclarations = [
	ObjectsComponent,
	ObjectAbstractComponent,
	ObjectShapeComponent,
	ObjectTextComponent,
	ObjectImageComponent,
	ObjectVideoComponent,
	ObjectFormGroupComponent,
	ObjectInputComponent,
	ObjectButtonComponent,
	ObjectSocialButtonComponent,
	ObjectRatingComponent,
	ObjectCommentComponent,
	ObjectYoutubeComponent,
];
