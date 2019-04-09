import fabric from '@app/editor/fabric';

import { Injectable } from '@angular/core';
import { EditorService } from '@app/editor/services/editor.service';

@Injectable({
	providedIn: 'root'
})
export class ObjectFactory {
	constructor(private editorService: EditorService) { }

	addRect(): void {
		this.editorService.addObject(new fabric.Rect({
			title: 'Rectangle',
			left: 13,
			top: 13,
			fill: '#ffffff',
			width: 200,
			height: 200,
			stroke: '#000000',
			strokeWidth: 1,
			strokeLineJoin: 'miter'
		}));
	}

	addText(): void {
		this.editorService.addObject(new fabric.IText('Text string', {
			title: 'Text',
			left: 150,
			top: 150,
			fontFamily: 'Roboto',
			angle: 0,
			fill: '#000000',
			scaleX: 2,
			scaleY: 2,
			fontWeight: '',
			fontStyle: '',
			textDecoration: '',
			stroke: '#555555',
			strokeWidth: 0,
			hasRotatingPoint: true,
		}));
	}

	addCircle(): void {
		this.editorService.addObject(new fabric.Circle({
			title: 'Circle',
			left: 43,
			top: 43,
			fill: '#ffffff',
			radius: 78,
			stroke: '#000000',
			strokeWidth: 1,
		}));
	}

	addStar(): void {
		this.editorService.addObject(new fabric.Path('m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z', {
			title: 'Star',
			stroke: '#000000',
			strokeWidth: 1,
			fill: '#ffbf35',
			width: 400,
			height: 400,
			scaleX: 4,
			scaleY: 4,
			originX: 'left',
			originY: 'top'
		}));
	}

	addTriangle(): void {
		this.editorService.addObject(new fabric.Triangle({
			title: 'Triangle',
			left: 300,
			top: 10,
			strokeWidth: 1,
			width: 400,
			height: 400,
			stroke: '#000000',
			strokeLineJoin: 'miter',
			fill: '#ffffff',
			originX: 'center'
		}));
	}

	addButton(): void {
		this.editorService.addObject(new fabric.Button({
			title: 'Button',
			width: 240,
			height: 100,
			top: 40,
			left: 40,
			fill: 'red',
			text: 'Label',
		}));
	}

	addVoucherForm(): void {
		this.editorService.addObject(new fabric.FormGroup([
			new fabric.Input({
				title: 'Input',
				name: 'username',
				top: 10,
				left: 10,
				width: 480,
				height: 80,
			}),
			new fabric.Password({
				title: 'Input',
				name: 'password',
				top: 100,
				left: 10,
				width: 480,
				height: 80,
			}),
			new fabric.VoucherButton({
				title: 'Button',
				fill: '#fc6a42',
				text: 'Submit',
				top: 190,
				left: 10,
				width: 480,
				height: 80
			}),
		], {
				title: 'Voucher',
			}));
	}

	addConnectForm(): void {
		this.editorService.addObject(new fabric.ConnectGroup([], {
			title: 'Connect',
			top: 60,
			left: 40,
			width: 400,
			height: 80,
		}));
	}

	addFeedbackGroup(): void {
		this.editorService.addObject(new fabric.FeedbackGroup([
			new fabric.Rating({
				title: 'Rating',
				top: 20,
				left: 10,
				width: 400,
				height: 80,
				fontSize: 40,
			}),
			new fabric.FeedbackButton({
				title: 'Button',
				fill: '#fc6a42',
				text: 'Submit',
				top: 120,
				left: 10,
				width: 400,
				height: 80
			}),
		], {
				title: 'Feedback',
			}));
	}

	addRating(): void {
		this.editorService.addObject(new fabric.Rating({
			title: 'Rating',
			width: 400,
			height: 80,
			fontSize: 40,
		}));
	}

	addComment(): void {
		this.editorService.addObject(new fabric.Comment({
			title: 'Comment',
			width: 400,
			height: 160,
		}));
	}

	addFacebookButton(): void {
		this.editorService.addObject(new fabric.FacebookButton({
			title: 'Facebook',
			width: 160,
			height: 160,
		}));
	}

	addTwitterButton(): void {
		this.editorService.addObject(new fabric.TwitterButton({
			title: 'Twitter',
			width: 160,
			height: 160,
		}));
	}

	addLinkedinButton(): void {
		this.editorService.addObject(new fabric.LinkedinButton({
			title: 'Linkedin',
			width: 160,
			height: 160,
		}));
	}
}
