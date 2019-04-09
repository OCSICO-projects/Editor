import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@app/core/services/api.service';
import { Slide } from '@app/editor/models/slide.model';
import { Resource } from '@app/shared/models/resource.model';

@Injectable({
	providedIn: 'root'
})
export class EditorApiService {
	constructor(
		private apiService: ApiService,
	) { }

	getResource(id: string): Observable<Resource> {
		return <Observable<Resource>>this.apiService.post('resourses', id);
	}

	public updateObject(name:string, id:string, parentId:string) {
		return this.apiService.put(`resources/${id}`, { 'name':	name, 'folder_id': parentId });
	}

	saveSlide(slide: Slide, actions: any, resourceIds: string[], currentFolder?: any, currentSlide?: any, canvasImage?: string) {
		let requestMethod = 'resources';

		const requestParameters = {
			folder_id: currentFolder.folder_id,
			parent_id: currentFolder.parent_id,
			name: slide.general.name ? slide.general.name : 'NewSlide',
			subtype: slide.general.subtype.toLocaleLowerCase(),
			type: 'compose',
			actions,
			relates: resourceIds,
			file_id: null,
			preview_id: null,
			mediaType: null,
			content: JSON.stringify(slide),
            thumbnail: canvasImage
		};

		if (currentSlide && currentSlide.id) {
			requestMethod = `resources/${currentSlide.id}`;
			requestParameters['id'] = currentSlide.id;
			requestParameters['folder_id'] = currentSlide.folder_id;
			requestParameters['version'] = currentSlide.version;
			requestParameters['thumbnail'] = canvasImage;
			return this.apiService.put(requestMethod, requestParameters);
		} else {
			return this.apiService.post(requestMethod, requestParameters);
		}
	}
}
