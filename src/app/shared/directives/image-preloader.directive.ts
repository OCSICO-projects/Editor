import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
	selector: '[appImagePreloader]'
})
export class ImagePreloaderDirective implements OnInit {

	@Input() imageLoader;

	constructor(
		private el: ElementRef
	) {
		this.el = el;
	}

	public ngOnInit(): void {
		const image = new Image();
		image.addEventListener('load', () => {
			this.el.nativeElement.style.backgroundImage = `url(${this.imageLoader})`;
		});
		image.src = this.imageLoader;
	}
}
