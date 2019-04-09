import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '@app/editor/services/editor.service';
import { EditorTourService } from '@app/shared/services/editor-tour.service';
import { Slide } from '@app/editor/models/slide.model';
import fabric from '@app/editor/fabric';

@Component({
	selector: 'app-editor-object-settings',
	templateUrl: './object-settings.component.html',
	styleUrls: ['./object-settings.component.scss', '../common.style.scss'],
})
export class ObjectSettingsComponent implements OnInit, OnDestroy {

	currentSlide: Slide;
	selectedObject: fabric.Object;
	objectSettingsExpanded = true;
	private _showShadow: boolean;
	private _shadowX: number;
	private _shadowY: number;
	private _shadowBlur: number;
	private _shadowColor: string;
	private _stroke: string;
	private _fill: string;
	private _strokeWidth: number;
	private ratio: number;
	private ratioScale: number | string;
	private _scaleX: number | string;
	private _scaleY: number | string;
	private _width: number | string;
	private _height: number | string;
	private _lockUniScaling: boolean;
	private _left: number;
	private _top: number;
	private _angle: number | string;
	private _url: string;

	onDestroy$ = new Subject();
	form: FormGroup;

	constructor(
	    private editorService: EditorService,
        private editorTourService: EditorTourService
    ) { }


	set stroke(value: string) {
		this._stroke = value;
		this.selectedObject.set('stroke', value);
	}

	get stroke() { return this._stroke; }

	set fill(value: string) {
		this._fill = value;
		this.selectedObject.set('fill', value);
	}

	get fill() { return this._fill; }

	set strokeWidth(value: number) {
		this._strokeWidth = value;
		this.selectedObject.set('strokeWidth', value);
	}

	get strokeWidth() { return this._strokeWidth; }

	set shadowX(value: number) {
		this._shadowX = value;
		this.updateObjectShadow();
	}

	get shadowX() { return this.toNumber(this._shadowX, 0); }

	set shadowY(value: number) {
		this._shadowY = value;
		this.updateObjectShadow();
	}

	get shadowY() { return this.toNumber(this._shadowY, 0); }

	set shadowBlur(value: number) {
		this._shadowBlur = value;
		this.updateObjectShadow();
	}

	get shadowBlur() { return this.toNumber(this._shadowBlur, 0); }

	set shadowColor(value: string) {
		this._shadowColor = value;
		this.updateObjectShadow();
	}

	get shadowColor() { return this._shadowColor; }

	set showShadow(showShadow) {
		this._showShadow = showShadow;
		this.selectedObject.setOptions({ showShadow });
	}

	get showShadow() { return this._showShadow; }

	set left(value) {
		this._left = Number(value);
		this.selectedObject.set('left', this._left);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get left() {
		return Math.round(Number(this._left));
	}

	set top(value) {
		this._top = Number(value);
		this.selectedObject.set('top', this._top);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get top() { return Math.round(Number(this._top)); }

	set angle(value) {
		this._angle = Number(value);
		this.selectedObject.set('angle', value);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get angle() { return this.round(this._angle, 2); }

	set width(value) {
		this._width = value;
		this.selectedObject.set('width', value);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get width(): number { return Number(this._width); }

	set height(value) {
		this._height = value;
		this.selectedObject.set('height', value);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get height(): number { return Number(this._height); }

	set scaleX(value) {
		this._scaleX = Number(value);
		this.selectedObject.set('scaleX', value);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get scaleX() { return this.round(Number(this._scaleX), 2); }

	set scaleY(value) {
		this._scaleY = value;
		this.selectedObject.set('scaleY', value);
		this.selectedObject.setCoords();
		this.editorService.selectObject(this.selectedObject);
	}

	get scaleY() { return this.round(Number(this._scaleY), 2); }

	set lockUniScaling(lockUniScaling) {
		this._lockUniScaling = lockUniScaling;
		this.selectedObject.setOptions({ lockUniScaling });
	}

	get lockUniScaling() { return this._lockUniScaling; }

	updateScaleX(scaleXValue): void {
		this.lockUniScaling ? this.setScaleXKeepAspectRatio(scaleXValue) : this.scaleX = scaleXValue;
		this.selectedObject.setCoords();
	}

	updateScaleY(scaleYValue): void {
		this.lockUniScaling ? this.setScaleYKeepAspectRatio(scaleYValue) : this.scaleY = scaleYValue;
		this.selectedObject.setCoords();
	}

	updateWidth(widthValue): void {
		this.lockUniScaling
			? this.setSizeWidthKeepAspectRatio(Number(widthValue))
			: this.width = Number(widthValue);
		this.selectedObject.setCoords();
	}

	updateHeight(heightValue): void {
		this.lockUniScaling
			? this.setSizeHeightKeepAspectRation(Number(heightValue))
			: this.height = Number(heightValue);
		this.selectedObject.setCoords();
	}

	updateRatio() {
		if (this.lockUniScaling) {
			this.ratio = Number(this.width) / Number(this.height);
			this.ratioScale = Number(this.scaleX) / Number(this.scaleY);
		}
	}

	private setScaleXKeepAspectRatio(x): void {
		this.scaleY = Number(x) / Number(this.ratioScale);
		this.scaleX = x;
	}

	private setScaleYKeepAspectRatio(y): void {
		this.scaleX = Number(y) * Number(this.ratioScale);
		this.scaleY = y;
	}

	isAdjustableSize() { return this.selectedObject instanceof fabric.Rect; }

	isFormGroup() { return this.selectedObject instanceof fabric.FormGroup; }

	isSocialButton() { return this.selectedObject instanceof fabric.SocialButton; }

	isRating() { return this.selectedObject instanceof fabric.Rating; }

	isFeedbackForm() { return this.selectedObject instanceof fabric.FeedbackGroup; }

	isFillShown() {
		return (
			!(this.selectedObject instanceof fabric.Image) &&
			!(this.selectedObject instanceof fabric.Video) &&
			!(this.selectedObject instanceof fabric.Youtube) &&
			!(this.selectedObject instanceof fabric.SocialButton)
		);
	}

	getMaxBorderWidth(): number {
		if (
			this.selectedObject instanceof fabric.Text ||
			this.selectedObject instanceof fabric.Rating ||
			this.selectedObject instanceof fabric.FeedbackGroup
		) { return 10; }

		return 50;
	}

	private setSizeWidthKeepAspectRatio(width: number): void {
		this.height = Math.round(width / this.ratio);
		this.width = width;
		this.selectedObject.setCoords();
	}

	private setSizeHeightKeepAspectRation(height: number): void {
		this.width = Math.round(height * this.ratio);
		this.height = height;
		this.selectedObject.setCoords();
	}

	private updateObjectShadow() {
		this.selectedObject.setShadow({
			offsetX: this.shadowX,
			offsetY: this.shadowY,
			blur: this.shadowBlur,
			color: this.shadowColor,
		});
	}
	set url(value: string) {
		this._url = value;
		this.selectedObject.set('url', value);
	}

	get url(): string { return this._url; }


	toNumber(value: any, fallbackValue: number) {
		value = +value;

		return isNaN(value) ? fallbackValue : value;
	}

	private round(value, decimals) {
		return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
	}

	pushHistoryState() { this.editorService.pushHistoryState(); }

	handleSelectedObject = (object: fabric.Object) => {
		this.selectedObject = object;

		if (!object) { return; }

		this.showShadow = object.showShadow;
		this.lockUniScaling = object.lockUniScaling;

		if (object.shadow instanceof fabric.Shadow) {
			const shadow = { ...object.shadow };

			this.shadowX = shadow.offsetX;
			this.shadowY = shadow.offsetY;
			this.shadowBlur = shadow.blur;
			this.shadowColor = shadow.color;
		} else {
			this.shadowX = 0;
			this.shadowY = 0;
			this.shadowBlur = 0;
			this.shadowColor = 'rgb(0,0,0)';
		}

		this._stroke = object.stroke;
		this._fill = object.fill;
		this._strokeWidth = object.strokeWidth;
		this._top = object.top;
		this._left = object.left;
		this._angle = object.angle;
		this._scaleX = object.scaleX;
		this._scaleY = object.scaleY;
		this._width = object.width;
		this._height = object.height;
		this._url = object.url;

		this.form = new FormGroup({
			url: new FormControl(this.selectedObject.url, CustomValidators.url)
		});

		this.editorTourService.startObjectSettingsTour();
	}

	ngOnInit() {
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
			).subscribe(this.handleSelectedObject);
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
