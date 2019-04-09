import { Component } from '@angular/core';

import Player from '@app/editor/fabric/player';

import test from './slides/test';
import slide0 from './slides/slide0';
import slide1 from './slides/slide1';
import slide2 from './slides/slide2';
import youtube from './slides/resource_youtube';
import video from './slides/resource_video';
import image from './slides/resource_image';

@Component({
	selector: 'app-player',
	templateUrl: './player.component.html',
	styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {

	ngAfterViewInit() {
		const canvasElement = <HTMLCanvasElement>document.getElementById('canvas');
		const player = new Player(canvasElement, { skipOption: 5, redirectUrl: 'http://google.by' });
		player.load([youtube, slide0, slide1, slide2]).then(() => {
			player.play();
		});

	}

}

export const PlayerComponentDeclarations = [
	PlayerComponent,
];
