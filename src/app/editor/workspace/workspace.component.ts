import fabric from '@app/editor/fabric';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '@app/editor/services/editor.service';
import { PainterFactory, PainterService } from '@app/editor/services/painter.factory';
import { Slide } from '@app/editor/models/slide.model';

import * as html2canvas from 'html2canvas';

@Component({
	selector: 'app-editor-workspace',
	templateUrl: './workspace.component.html',
	styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
	@ViewChild('canvas') canvasRef: ElementRef;
	@ViewChild('zoomBox') zoomBoxRef: ElementRef;

	public _zoom = 1;
	private zoomBoxInitialWidth = 0;
	private zoomBoxInitialHeight = 0;
	private canvas: any;

	private currentSlide: Slide;
	public selectedObject: fabric.Object;

	private onDestroy$ = new Subject();

	private painter: PainterService;

	set zoom(value) {
		this._zoom = value;
		this.updateZoomBox();
	}

	get zoom() { return this._zoom; }

	private initializeZoomBox() {
		const zoomBoxEl = this.zoomBoxRef.nativeElement;
		const zoomBoxParentEl = zoomBoxEl.parentElement;

		const computedStyle = window.getComputedStyle(zoomBoxEl);

		this.zoomBoxInitialWidth = parseFloat(computedStyle.width);

		const zoomBoxPaddingTop = parseFloat(computedStyle.paddingTop);
		const zoomBoxPaddingBottom = parseFloat(computedStyle.paddingBottom);
		const parentPaddingTop = parseFloat(computedStyle.paddingTop);
		const parentPaddingBottom = parseFloat(computedStyle.paddingBottom);
		const paddings = zoomBoxPaddingTop + zoomBoxPaddingBottom + parentPaddingTop + parentPaddingBottom;

		this.zoomBoxInitialHeight = parseFloat(window.getComputedStyle(zoomBoxEl.parentElement).height) - paddings;
		this.updateZoomBox();
	}

	private updateZoomBox() {
		const canvasEl = this.canvasRef.nativeElement;
		const zoomBoxEl = this.zoomBoxRef.nativeElement;

		const canvasWidth = this.canvas.getWidth();
		const canvasHeight = this.canvas.getHeight();

		const stretchRatio = this.isHotspotOrSurvey()
			? this.zoomBoxInitialHeight / canvasHeight
			: this.zoomBoxInitialWidth / canvasWidth;

		zoomBoxEl.style.width = canvasWidth * stretchRatio * this.zoom + 'px';
		zoomBoxEl.style.height = canvasHeight * stretchRatio * this.zoom + 'px';
	}

	constructor(
		private editorService: EditorService,
		private painterFactory: PainterFactory,
		private zone: NgZone,
	) { }

	ngOnInit() {
		this.initializeCanvas();
		this.initializeZoomBox();

		this.editorService.addedObject$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleObjectAdded);
		this.editorService.currentSlide$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleSlideUpdated);
		this.editorService.deletedObject$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleObjectDeleted);
		this.editorService.loadHistoryStateRequest$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleLoadHistoryStateRequest);
		this.editorService.objectsRequest$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleObjectsRequest);
		this.editorService.selectedObject$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleObjectSelected);
        this.editorService.sortedList$.pipe(takeUntil(this.onDestroy$)).subscribe(this.handleSortedList);
		this.editorService.createPreview$
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(() => {
				html2canvas(document.getElementsByClassName('canvas-container')[0], {allowTaint : true}).then(canvas => {
					const image = canvas.toDataURL('image/jpeg', 0.7);
					if (image) {
						this.editorService.sendGeneratedPreview(image);
					}
				});
			});

		this.editorService.pushHistoryState();
	}

	ngOnDestroy() {
		this.canvas.dispose();

		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	isHotspotOrSurvey() {
		return this.currentSlide && ['hotspot', 'survey'].includes((this.currentSlide.general.subtype || '').toLowerCase());
	}

	private handleObjectsRequest = (response) => {
		const objects = this.canvas.toJSON().objects;

		response.next(JSON.parse(JSON.stringify(objects)));
	}

	private handleLoadHistoryStateRequest = (state) => {
		state = { ...state };

		this.canvas.loadFromJSON(state, () => {
			const objects = this.canvas.getObjects();

			this.editorService.updateObjectList(objects);
			this.editorService.updateSlide(state);
			this.editorService.emitStateLoaded();
		});
	}

	private handleObjectAdded = (object) => {
		if (object instanceof fabric.Youtube) {
			const scalingWidth = this.canvas.getWidth() / 2;
			object.scaleToWidth(scalingWidth);
		}

		if (object instanceof fabric.Video) {
			const scalingWidth = this.canvas.getWidth() / 2;
			object.scaleToWidth(scalingWidth);
		}

		if (object instanceof fabric.Image) {
			const scalingWidth = this.canvas.getWidth() / 2;
			object.scaleToWidth(scalingWidth);
		}

		if (object instanceof fabric.Rating || object instanceof fabric.Comment) {
			const formGroup = this.canvas.getObjects().find(searchedObject => searchedObject instanceof fabric.FormGroup);
			formGroup.addWithUpdate(object);
			formGroup.setNestedProperties();
		} else {
			this.canvas.add(object);
		}

		this.canvas.getObjects().slice().forEach(orderedObject => {
			if (orderedObject instanceof fabric.HtmlElement || orderedObject instanceof fabric.FormGroup) {
				orderedObject.bringToFront();
			}
		});

		this.editorService.updateObjectList(this.canvas.getObjects());
		this.editorService.pushHistoryState();
	}

	private handleObjectDeleted = (object) => {
		if (object.group) {
			object.group.removeWithUpdate(object);
		} else {
			this.canvas.remove(object);
			this.editorService.updateObjectList(this.canvas.getObjects());
		}
	}

	private handleSlideUpdated = (slide: Slide) => {
		if (this.currentSlide && this.currentSlide.general.subtype !== slide.general.subtype) {
			const subType = (slide.general.subtype || '').toLowerCase();

			if (['hotspot', 'survey'].includes(subType)) {
				this.canvas.setWidth(fabric.settings.resolutions.portait.width);
				this.canvas.setHeight(fabric.settings.resolutions.portait.height);
			} else {
				this.canvas.setWidth(fabric.settings.resolutions.landscape.width);
				this.canvas.setHeight(fabric.settings.resolutions.landscape.height);
			}
		}

		this.updateZoomBox();

		this.painter
			.drawGrid(slide.general.gridSize)
			.setGridIsShown(slide.general.showGrid)
			.changeTemplate(slide.general.templateId)
			.setTemplateIsShown(slide.general.showTemplate);

		this.canvas.backgroundColor = slide.backgroundColor;

		this.currentSlide = slide;
	}

	private handleObjectSelected = (object: fabric.Object) => {
		this.selectedObject = object;

		if (!object) {
			this.canvas.discardActiveObject();
			return;
		}

		// @ts-ignore
		if (object instanceof fabric.FormElement && object.group) {
			this.attachFormElementToCanvas(object, false);
		} else {
			this.canvas.setActiveObject(object);
		}

		if (object instanceof fabric.FormGroup) {
			object.setOptions({
				subTargetCheck: false,
				hoverCursor: 'pointer',
			});
		}
	}

	private initializeCanvas() {
		this.zone.runOutsideAngular(() => {
			this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
				hoverCursor: 'pointer',
				selection: false,
			});
		});
		// TODO: debugging purpose, delete later
		(<any>window).canvas = this.canvas;
		(<any>window).push = () => this.editorService.pushHistoryState();
		this.painter = this.painterFactory.make(this.canvas);

		this.canvas.on({
			'object:modified': () => this.editorService.pushHistoryState(),
			'object:removed': () => this.editorService.pushHistoryState(),
			'mouse:move': this.handleMouseMove,
			'mouse:down': this.handleMouseDown,
			'selection:created': this.handleSelection,
			'selection:updated': this.handleSelection,
			'selection:cleared': this.handleSelection,
            'object:moving': this.handleObjectMoving,
		});

		this.canvas
			.setWidth(fabric.settings.resolutions.landscape.width)
			.setHeight(fabric.settings.resolutions.landscape.height);
	}

    handleObjectMoving = (e) => {
        const obj = e.target;
        if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
            return;
        }
        obj.setCoords();
        if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
            obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
        }
        if (obj.getBoundingRect().top + obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width  > obj.canvas.width){
            obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
            obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
        }
    }

	handleSelection = (e) => {
		this.editorService.selectObject(e.selected ? e.selected[0] : null);

		if (e.deselected && e.deselected[0] instanceof fabric.FormGroup) {
			e.deselected[0].setOptions({
				subTargetCheck: true,
				hoverCursor: 'default',
			});
		}
	}

	private handleSortedList = (ids) => {
	    ids.map(id => {
	        this.canvas._objects.map(object => {
	            if (object.id === id) {
	                this.canvas.bringToFront(object);
                }
            });
            this.canvas.renderAll();
        });
    }

	handleMouseMove = (e) => {
		if (
			!e.target ||
			!(e.target instanceof fabric.FormGroup) ||
			this.selectedObject instanceof fabric.FormGroup
		) { return; }

		if (e.subTargets.length) {
			e.target.set('hoverCursor', 'pointer');
		} else {
			e.target.set('hoverCursor', 'default');
		}
	}

	handleMouseDown = (e) => {
		if (!(e.target instanceof fabric.FormGroup) || !e.subTargets.length) { return; }

		const target = e.subTargets[0];
		this.attachFormElementToCanvas(target);
	}

	attachFormElementToCanvas(target: fabric.FormElement, isPointerEvent = true) {
		const canvas = this.canvas;

		if (canvas.contains(target)) { return; }

		// @ts-ignore
		target.dirty = true;
		// @ts-ignore
		const group = target.group;

		const targetIndex = group.detatch(target);
		// @ts-ignore
		canvas._groupSelector = null;
		canvas.attach(target);
		canvas.setActiveObject(target);

		if (isPointerEvent) {
			// @ts-ignore
			canvas._setupCurrentTransform({}, target);
			// @ts-ignore
			canvas._transformObject({});
		}

		target.on('deselected', function handleDeselected() {
			target.off('deselected', handleDeselected);

			if (!canvas.getObjects().find(object => object === target)) { return; }

			canvas.detatch(target);
			group.attach(target, targetIndex);
			group.hoverCursor = 'default';
		});
	}
}
