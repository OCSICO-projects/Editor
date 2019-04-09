import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import fabric from '@app/editor/fabric';
import { EditorApiService } from '@app/editor/services/editor-api.service';
import { Slide } from '@app/editor/models/slide.model';

@Injectable({
	providedIn: 'root'
})
export class EditorService {
	private history: Slide[] = [];
	private historyPos = -1;
	private _isSlideUnsaved = false;

	private createPreview = new Subject();
	readonly createPreview$ = this.createPreview.asObservable();

	private generatedPreview = new Subject<string>();
	readonly generatedPreview$ = this.generatedPreview.asObservable();

	private addedObject = new Subject<fabric.Object>();
	readonly addedObject$ = this.addedObject.asObservable();

	private currentSlide = new BehaviorSubject<Slide>(new Slide());
	readonly currentSlide$ = this.currentSlide.asObservable();

	private deletedObject = new Subject<fabric.Object>();
	readonly deletedObject$ = this.deletedObject.asObservable();

	private objectList = new BehaviorSubject<fabric.Object[]>([]);
	readonly objectList$ = this.objectList.asObservable();

	private sortedList = new BehaviorSubject<string[]>([]);
	readonly sortedList$ = this.sortedList.asObservable();

	private selectedObject = new BehaviorSubject<fabric.Object | null>(null);
	readonly selectedObject$ = this.selectedObject.asObservable();

	private objectsRequest = new Subject<Subject<any>>();
	readonly objectsRequest$ = this.objectsRequest.asObservable();

	private loadHistoryStateRequest = new Subject<Slide>();
	readonly loadHistoryStateRequest$ = this.loadHistoryStateRequest.asObservable();

	private stateLoaded = new Subject<void>();
	readonly stateLoaded$ = this.stateLoaded.asObservable();

	constructor(
		private editorApiService: EditorApiService
	) { }

	addObject(object: fabric.Object) {
		this.addedObject.next(object);

		this.selectObject(object);
	}

	deleteObject(objectToDelete: fabric.Object) {
		this.selectedObject$.pipe(first()).subscribe((selectedObject) => {
			if (objectToDelete instanceof fabric.FormGroup &&
				selectedObject instanceof fabric.FormElement
			) {
				this.selectObject(null);
			}

			this.deletedObject.next(objectToDelete);
		});
	}

    generatePreview() {
        this.createPreview.next();
    }

    sendGeneratedPreview(preview: string) {
        this.generatedPreview.next(preview);
    }

	selectObject(object: fabric.Object | null) { this.selectedObject.next(object); }

	requestSlide(): Observable<any[]> {
		return Observable.create(observer => {
			const subject = new Subject<any[]>();

			subject.subscribe(slide => {
				subject.complete();
				observer.next(slide);
				observer.complete();
			});

			this.objectsRequest.next(subject);
		});
	}

	updateObjectList(objects: fabric.Object[]) { this.objectList.next(objects); }

	updateSlide(slide: Slide) {
	    this.currentSlide.next(slide);
	}

	pushHistoryState(simpleObjects = null) {
	    if (simpleObjects) {
	        const objectIds = simpleObjects.map(el => el.id);
            this.sortedList.next(objectIds)
        }

		let selectedObject: fabric.Object;

		this.selectedObject$.pipe(first()).subscribe((object) => {
			selectedObject = object;
			if (object) { object.setCoords(); }
		});

		this.selectObject(null);

		this.requestSlide().subscribe(objects => {
			this.currentSlide$.pipe(first()).subscribe(slide => {
				this.selectObject(selectedObject);

				slide.objects = objects;
				const history = this.history;
				const historicalSlide = history[this.historyPos];
				const snapshot = JSON.stringify(slide);

				if (historicalSlide) {
					historicalSlide.general.resourceId = slide.general.resourceId;
					historicalSlide.general.resourceVersion = slide.general.resourceVersion;
				}
				if (JSON.stringify(history[this.historyPos]) === snapshot) { return; }

				console.debug('Push history state');

				slide.objects = [];

				const slideBlank = JSON.stringify(slide);
				const historySlide = Object.assign(JSON.parse(slideBlank), { objects });
				const currentSlide = Object.assign(JSON.parse(slideBlank), { objects });

				this.historyPos++;
				this._isSlideUnsaved = true;
				this.currentSlide.next(currentSlide);

				history.splice(this.historyPos);
				history.push(historySlide);
			});
		});
	}

	isUndoAvailable() { return this.historyPos > 0; }

	undo() {
		if (!this.isUndoAvailable()) { return; }

		this.currentSlide$.pipe(first()).subscribe((currentSlide) => {
			this.historyPos--;

			const previousState = this.history[this.historyPos];
			previousState.general.resourceId = currentSlide.general.resourceId;
			previousState.general.resourceVersion = currentSlide.general.resourceVersion;

			this.loadHistoryStateRequest.next(previousState);
			this.currentSlide.next(JSON.parse(JSON.stringify(previousState)));
		});
	}

	isRedoAvailable() { return this.historyPos > -1 && this.historyPos < this.history.length - 1; }

	redo() {
		if (!this.isRedoAvailable()) { return; }

		this.currentSlide$.pipe(first()).subscribe((currentSlide) => {
			this.historyPos++;

			const nextState = this.history[this.historyPos];
			nextState.general.resourceId = currentSlide.general.resourceId;
			nextState.general.resourceVersion = currentSlide.general.resourceVersion;

			this.loadHistoryStateRequest.next(nextState);
			this.currentSlide.next(JSON.parse(JSON.stringify(nextState)));
		});
	}

	emitStateLoaded() {
		this.stateLoaded.next();
	}

	resetEditor(initialState = new Slide()) {
		this.history = [];
		this.historyPos = -1;
		this._isSlideUnsaved = false;

		this.stateLoaded$.pipe(first()).subscribe((slide) => {
			this.pushHistoryState();
		});

		this.loadHistoryStateRequest.next(initialState);
	}

	isSlideUnsaved() { return this._isSlideUnsaved && this.history.length > 1; }

	saveSlide(slide: Slide, actions: any, resourceIds: string[], currentFolder?: any, currentSlide?: any, canvasImage?: string) {
		return this.editorApiService
			.saveSlide(slide, actions, resourceIds, currentFolder, currentSlide, canvasImage)
			.pipe(tap(() => this._isSlideUnsaved = false));
	}
}
