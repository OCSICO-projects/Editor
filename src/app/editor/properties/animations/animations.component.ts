import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';

import fabric from '@app/editor/fabric';
import { Animation } from '@app/editor/fabric/animations';
import { EditorService } from '@app/editor/services/editor.service';
import { AnimationComponent } from '@app/editor/properties/animations/animation/animation.component';

@Component({
	selector: 'app-editor-animations',
	templateUrl: './animations.component.html',
	styleUrls: ['./animations.component.scss']
})
export class AnimationsComponent implements OnInit, OnDestroy {
	@ViewChild('canvasPreviewRef') canvasPreviewRef: ElementRef;

	isAnimationPlaying = {
	    start: false,
        stop: false
    };

	blockExpanded = true;
	previewVisible = false;

    private _object: fabric.Object;

    @Input()
    set object(object: fabric.Object) {
        this._object = object;
        this.previewVisible = false;
    }

    get object(): fabric.Object {
        return this._object;
    }

	public canvas: any;

	constructor(
		private editorService: EditorService,
		private zone: NgZone,
	) { }

	private initializeCanvas() {
		this.zone.runOutsideAngular(() => {
			this.canvas = new fabric.StaticCanvas(this.canvasPreviewRef.nativeElement, {
				hoverCursor: 'pointer',
				selection: false,
				backgroundColor: '#ededed'
			});
		});
	}

	ngOnInit() { this.initializeCanvas(); }

	ngOnDestroy() { this.canvas.dispose(); }

	handleStartChange(animation: Animation) {
		this.object.animations.start = animation;

		// TODO: WAT?

		// if (animation && this.object.animations.end) {
		// 	this.object.animations.end.repetition = animation.repetition;
		// }
        //
		// if (!animation && this.object.animations.end) {
		// 	this.object.animations.end.repetition = null;
		// }

		this.editorService.pushHistoryState();
	}

	handleEndChange(animation: Animation) {
		this.object.animations.end = animation;

        // TODO: WAT?

		// if (animation && this.object.animations.start) {
		// 	this.object.animations.end.repetition = this.object.animations.start.repetition;
		// }

		this.editorService.pushHistoryState();
	}


	playAnimation(animation: Animation, animationType: string) {
		this.previewVisible = true;
		const canvasWidth = this.canvas.getWidth();
		const canvasHeight = this.canvas.getHeight();
		const radius = Math.floor(Math.min(canvasWidth, canvasHeight) / 2.5);

		const circle = new fabric.Circle({
			radius,
			fill: '#fc6a42',
		});

		this.canvas.clear();
		this.canvas.add(circle);
		this.canvas.centerObject(circle);

		this.isAnimationPlaying[animationType] = true;
		fabric.animations.play(circle, animation).then(() => this.isAnimationPlaying[animationType] = false );
	}
}

export const AnimationsComponentDeclarations = [
	AnimationsComponent,
	AnimationComponent,
];
