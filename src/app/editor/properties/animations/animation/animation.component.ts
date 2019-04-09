import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { Animation, AnimationType } from '@app/editor/fabric/animations';
import { EditorService } from '@app/editor/services/editor.service';

@Component({
	selector: 'app-editor-animation',
	templateUrl: './animation.component.html',
	styleUrls: ['./animation.component.scss', '../../common.style.scss']
})
export class AnimationComponent implements OnChanges {
	readonly repetitionRange = Array(15).fill(null).map((x, i) => i + 1);

	@Input() animation: Animation | null;
	@Input() isPlaying: boolean;
	@Input() label: string;
	@Input() object: any;
	@Input() repetitionEnabled = false;
	@Output() onChange = new EventEmitter<Animation | null>();
	@Output() play = new EventEmitter<Animation>();

	blockExpanded = true;

	AnimationType = AnimationType;

	private _type = '';
	private _startTime: number | string = 0;
	private _duration: number | string = 0;
	private _repetition: number | string = '';

	constructor(
		private editorService: EditorService,
	) { }

	set type(value) {
		this._type = value;

		if (!value) {
			this.animation = null;
		} else {
			if (!this.animation) { this.animation = new Animation({ type: AnimationType.fadeIn }); }
			this.animation.type = AnimationType[value];
		}

		this.emitAnimation();
	}

	get type() { return this._type; }

	set startTime(value: number | string) {
		this._startTime = this.normalizeTime(value);
		this.animation.startTime = this._startTime;

		this.emitAnimation();
	}

	get startTime() { return this._startTime; }

	set duration(value: number | string) {
		this._duration = value;
		this.animation.duration = +this.duration;

		this.emitAnimation();
	}

	get duration() { return this.normalizeTime(this._duration); }

	set repetition(value) {
		this._repetition = value;
		this.animation.repetition = this.repetition === '' ? null : this.repetition;

		this.emitAnimation();
	}

	get repetition() { return this._repetition === '' ? '' : this.normalizeTime(this._repetition); }

	normalizeTime(value: number | string): number {
		value = +value;
		value = isNaN(value) ? 0 : value;
		value = value > 999 ? 999 : value;
		value = value < 0 ? 0 : value;

		return value;
	}

	emitAnimation() { this.onChange.emit(this.animation); }

	startAnimationPreview() { this.play.emit(this.animation); }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.animation) {
			const animation = changes.animation.currentValue;
			this.animation = animation;

			if (animation) {
				this._type = animation.type;
				this._startTime = animation.startTime;
				this._duration = animation.duration;
				this._repetition = animation.repetition ? this.animation.repetition : '';
			} else {
				this._type = '';
			}
		}
	}
}

export const AnimationComponentDeclarations = [
	AnimationComponent,
];
