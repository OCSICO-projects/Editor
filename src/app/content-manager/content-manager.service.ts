import { environment } from '@env/environment';
import { ActivatedRoute } from '@angular/router';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Resource } from '@app/shared/models/resource.model';
import { Folder } from '@app/shared/models/folder.model';
import { MessageService } from '@app/shared/services/message.service';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/auth.service';

@Injectable({
	providedIn: 'root'
})
export class ContentManagerService {

	private readonly baseYoutubeUrl: string = environment.youtubeApiUrl;
	private readonly apiKey: string = environment.googleApiKey;

	onItemSelected = new BehaviorSubject<Folder | Resource>(null);
	eventsSubject = new BehaviorSubject<Folder>(null);
	foldersSubject = new BehaviorSubject<Folder[]>(null);
	updateFolder = new BehaviorSubject<Folder>(null);
	deleteFolder = new BehaviorSubject<Folder>(null);
	snackbarFiles = new BehaviorSubject<any>(null);
	folders = this.foldersSubject.asObservable();
	fileUpload = new BehaviorSubject<Resource>(null);
	openedNavBar = new BehaviorSubject<boolean>(null);
	renameFolder = new BehaviorSubject<Folder>(null);
	contentMultiselect = new BehaviorSubject<boolean>(false);
	selectFolderForSlide = new BehaviorSubject<Folder>(null);
	currentSlide = new BehaviorSubject<Resource>(null);
	currentList: EventEmitter<Folder[]> = new EventEmitter();
	currentListResponse: EventEmitter<Folder[]> = new EventEmitter();
	list = new BehaviorSubject<any>(null);
	uploadProgress = new BehaviorSubject<any>(null);
	routeFolder: Folder;

	constructor(
		private http: HttpClient,
		private apiService: ApiService,
		private authService: AuthService,
		private route: ActivatedRoute,
		private messageService: MessageService,
	) {}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
		return null;
	}

	public uploadProgressBar(file: any) {
		this.uploadProgress.next(file);
	}

	public setContentMultiselect(multiselectFlag: boolean): void {
		this.contentMultiselect.next(multiselectFlag);
	}

	public setRenameFolder(folder): void {
		this.renameFolder.next(folder);
	}

	public toggleNavBar(flag: boolean): void {
		this.openedNavBar.next(flag);
	}

	public setUploadFile(file: Resource): void {
		this.fileUpload.next(file);
	}

	public setDeleteFolder(id: Folder): void {
		this.deleteFolder.next(id);
	}

	public setUpdatedFolder(folder: Folder): void {
		this.updateFolder.next(folder);
	}

	public selectSlide(node): void {
		this.currentSlide.next(node)
	}

	public selectItem(node): void {
		this.onItemSelected.next(node);
	}

	public populateFolderList(): void {
		this.getList('folders').subscribe(result => {
			this.setFolders(result);
		});
	}

	public setSnackbarfiles(files): void {
		this.snackbarFiles.next(files);
	}

	public setEvent(data: any): void {
		this.eventsSubject.next(data);
	}

	public setFolders(data: Folder[]): void {
		this.foldersSubject.next(this.buildFoldersTree(data));
	}

	public onSetList(list: any): void {
		this.list.next(list);
	}

	public removeContentNode(method: string, params: any): Observable<any> {
		return this.apiService.delete(method, params);
	}

	public youtubeSearch(query: string, pageToken?: string): Observable<any> {
		let requestString = `${this.baseYoutubeUrl}search?q=${query}&part=snippet&maxResults=10&key=${this.apiKey}`;
		if (pageToken) {
			requestString += `&pageToken=${pageToken}`;
		}

		return this.http.get(requestString);
	}

	public youtubeContentDetails(ids: string): Observable<any> {
		const requestString = `${this.baseYoutubeUrl}videos?id=${ids}&part=contentDetails&key=${this.apiKey}`;
		return this.http.get(requestString);
	}

	public addContentNode(method: string, body: any): Observable<Folder> {
		return this.apiService.post(method, body)
			.map((newNode: Folder | Resource) => {
				if (['resources'].includes(method)) {
					newNode.icon = newNode.type;
				} else {
					newNode.type = 'folder';
				}

				if (method === 'folders') {
					newNode.children = [];
				}

				if (newNode.file) {
					newNode.image = newNode.file.preview;
				}

				if (newNode.type === 'youtube') {
					newNode.image = `https://img.youtube.com/vi/${newNode.file.url.substring(newNode.file.url.lastIndexOf('/') + 1)}/0.jpg`;
					newNode.file = {
						filename: newNode.name,
						preview: newNode.image
					};
				}

				if (newNode.type === 'compose') {
					newNode.icon = newNode.subtype;
				}

				newNode.title = newNode.name;
				return newNode;
			});
	}

	public updateNode(params: Folder | Resource) {
		if ((params.parent_id || params.parent_id === null) && params.type === 'folder') {
			return this.apiService.put(`folders/${params.id}`, { 'name': params.name, 'parent_id': params.parent_id })
				.map((result: Folder | Resource) => {
					result.title = result.name;
					return result;
				});
		}
		if (params.folder_id || params.folder_id === null) {
			return this.apiService.put(`resources/${params.id}`, { 'name': params.name, 'folder_id': params.folder_id });
		}

	}

	public getList(method: string, params?: any): Observable<Folder[] | Resource[]> {
		return this.apiService.get(method, params)
			.map((result: any) => {
				if (!result) {
					return;
				}
				result.map((el) => {
					el.title = el.name;

					if (el.preview) {
						el.image = el.preview;
					}
					if (el.type === 'youtube') {
						el.image = `https://img.youtube.com/vi/${el.content.url.substring(el.content.url.lastIndexOf('/') + 1)}/0.jpg`;
					}
				});
				if (method === 'folders') {
					return this.buildFoldersTree(result);
				} else {
					return this.setIcons(result);
				}
			});
	}

	public findRouteFolder(id: string, nodes: Folder[]): Folder {
		let isFind: boolean;
		nodes.forEach(el => {
			if (el.id === id) {
				this.routeFolder = el;
				isFind = true;
			}
			if (el.children && el.children.length > 0 && !isFind) {
				this.findRouteFolder(id, el.children);
			}
		});
		return this.routeFolder;
	}

	private setIcons(nodes: Resource[]) {
		nodes.forEach(el => {
			if (el.subtype) {
				el.icon = el.subtype ? el.subtype : el.type;
				el.resourceId = el.id;
				el.duration = true;
			}
			if (el.parent_id) {
				el.type = 'folder';
				el.icon = 'folder';
			}
		});
		return nodes;
	}

	public buildFoldersTree(data: Folder[]) {

		if (!data) {
			return [];
		}

		let i = data.length;

		const result = [],
			temp = {};
		let j = i;

		while (i--) {
			if (data[i]) {
				temp[data[i].id] = data[i];
			}

		}
		for (i = 0; i < j; i++) {

			if (data[i] && !data[i].type) {
				data[i].type = 'folder';
				data[i].icon = 'folder';
				if (!data[i].children) {
					data[i].children = [];
				}
			}
			if (data[i] && data[i].parent_id === null) {
				data[i].type === 'folder' ? result.push(data[i]) : result.push(data[i]);
				continue;
			}
			let parent;
			if (data[i]) {
				parent = temp[data[i].parent_id];
			}

			if (parent && !parent.children) {
				parent.children = [];
			}
			if (parent && parent.type === 'folder' && parent.children) {
				parent.children.push(data[i]);
				data.splice(i, 1);
				i--;
				j--;
			}
		}
		return result;
	}

	public requestCurrentList(): void {
		this.currentList.emit(null);
	}

	public handleRequestCurrentList(): EventEmitter<any> {
		return this.currentList;
	}

	public responseCurrentList(list): void {
		this.currentListResponse.emit(list);
	}

	public handleResponseCurrentList(): EventEmitter<any> {
		return this.currentListResponse;
	}
}
