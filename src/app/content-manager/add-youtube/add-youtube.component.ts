import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';

import { ContentManagerService } from 'app/content-manager/content-manager.service';

@Component({
	selector: 'app-add-youtube',
	templateUrl: './add-youtube.component.html',
	styleUrls: ['./add-youtube.component.scss']
})
export class AddYoutubeComponent {

	private readonly hourInMiliseconds: number = 3600000;

	searchString: string;
	youtubeResult;
	youtubeList: any = [];
	selectedVideoId = '';
	safeUrl;
	selectedYoutubeVideos: any = [];
	unsafeUrl: string;

	constructor(
		public dialogRef: MatDialogRef<AddYoutubeComponent>,
		private contentManagerService: ContentManagerService,
		private sanitizer: DomSanitizer,
	) { }

	public search(): void {
		this.videoRequests();
	}

	private videoRequests(token?): void {
		this.contentManagerService.youtubeSearch(this.searchString, token || null).subscribe(res => {
			let idsString = '';
			res.items.forEach(el => {
				if (el.id && el.id.videoId) {
					idsString += el.id.videoId + ',';
				}
			});
			this.contentManagerService.youtubeContentDetails(idsString).subscribe(result => {
				res.items.forEach(video => {
					result.items.forEach(videoDetail => {
						if (video.id.videoId === videoDetail.id) {
							video.details = videoDetail.contentDetails;
							video.duration = moment.duration(videoDetail.contentDetails.duration).asMilliseconds();
						}
					});
				});
				this.youtubeResult = res;
				this.youtubeList = res.items;
				this.checkSelected();
			});
		});
	}


	public convertDuration(duration): any {
		const durationMs = moment.duration(duration).asMilliseconds();
		if (durationMs >= this.hourInMiliseconds) {
			return moment(moment.duration(duration).asMilliseconds()).format('hh:mm:ss');
		}

		return moment(moment.duration(duration).asMilliseconds()).format('mm:ss');
	}

	private checkSelected(): void {
		this.youtubeList.forEach(video => {
			const found = this.selectedYoutubeVideos.some(selectedVideo => {
				return selectedVideo.id.videoId === video.id.videoId;
			});
			video.selected = found;
		});
	}

	public nextPage(): void {
		this.videoRequests(this.youtubeResult.nextPageToken);
	}

	public prevPage(): void {
		this.videoRequests(this.youtubeResult.prevPageToken);
	}

	public contentUrl(): void {
		this.unsafeUrl = `https://www.youtube.com/embed/${this.selectedVideoId}`;
		this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.unsafeUrl);
	}

	public selectVideo($event, video): void {
		this.selectedVideoId = video.id.videoId;
		this.contentUrl();
		video.url = this.unsafeUrl;

		if ($event.ctrlKey || $event.metaKey) {
			const found = this.selectedYoutubeVideos.find(selectedVideo => {
				return selectedVideo.id.videoId === video.id.videoId;
			});
			video.selected = !found;

			if (found) {
				this.deleteFromSelected(video);
				return;
			}

			this.selectedYoutubeVideos.push(video);
			return;
		}
		this.youtubeList.forEach(youtubeVideo => {
			youtubeVideo.selected = false;
		});

		this.selectedYoutubeVideos.splice(0, this.selectedYoutubeVideos.length, video);
		video.selected = true;
	}

	public deleteFromSelected(video): void {
		video.selected = false;
		this.selectedYoutubeVideos = this.selectedYoutubeVideos.filter(el => {
			return el.id.videoId !== video.id.videoId;
		});
	}

	public save(): void {
		this.contentManagerService.onItemSelected.subscribe(result => {
			this.selectedYoutubeVideos.folder_id = result ? result.id : null;
		})
		this.dialogRef.close(this.selectedYoutubeVideos);
	}
}
