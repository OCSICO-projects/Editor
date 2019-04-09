import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { environment } from '@env/environment';
import { HttpClient, HttpResponse, HttpRequest, HttpEventType } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class ApiService {

	uploadStatus = new BehaviorSubject<any>(null);
	cancelUpload = new BehaviorSubject<string>(null);

	private url = '';
	progressObject = {};
	fileRequests = [];

	constructor(
		public http: HttpClient
	) {
		this.url = environment.apiUrl;
	}

	public setCanceledFile(fileName: string): boolean {
		this.fileRequests.forEach(request => {
			if (request.file === fileName) {
				this.progressObject[fileName] = {
					progress: 0,
					canceled: true,
				};
				this.uploadStatus.next(this.progressObject);
			}
		});
		return true;
	}

	public uploadFiles(files: Set<File>, folderId?: string): { [key: string]: Observable<number> } {
		const status = {};
		files.forEach(file => {
			const formData = new FormData();

			if (folderId) {
				formData.set('folder_id', folderId);
			}

			formData.set('file', file, file.name);

			this.progressObject[file.name] = {
				progress: 0
			};

			this.uploadStatus.next(this.progressObject);
			const req = new HttpRequest('POST', this.url + `/resources/files`, formData, {
				reportProgress: true
			});

			const request = this.http.request(req).subscribe((event: any) => {
				if (event.status === 415 || event.status === 500 || event.status === 413 || event.status === 0) {
					this.progressObject[file.name].rejected = true;
					this.uploadStatus.next(this.progressObject);
					this.progressObject = {};
					this.fileRequests = [];
				}
				if (event.type === HttpEventType.UploadProgress) {
					const percentDone = Math.round(100 * event.loaded / event.total);
					this.progressObject[file.name] = {
						progress: percentDone
					};
					this.uploadStatus.next(this.progressObject);
				} else if (event instanceof HttpResponse) {
					this.progressObject[file.name].complete = true;
					this.progressObject[file.name].body = event.body;
					this.uploadStatus.next(this.progressObject);
					this.progressObject = {};
					this.fileRequests = [];
				}
			});
			this.fileRequests.push({ request: request, file: file.name });
		});
		return status;
	}

	private extractBatchData(response: any): any {
		const results = [];
		if (response.data.email) {
			results.push(response.data)
		} else {
			response.data.forEach(subResponse => {
				results.push(subResponse);
			});
		}
		return results;
	}

	private extractData(response: any): any {
		const res = typeof response.data === 'object' ? Object.assign({}, response.data) : response.data;
		return res || null;
	}

	public get(method: string, params?) {
		return this.http.get(`${this.url}/${method}`)
			.map(this.extractBatchData.bind(this));
	}


	public post(method: string, body: any | null) {
		return this.http.post(`${this.url}/${method}`, body)
			.map(this.extractData.bind(this));
	}

	public put(method: string, body: any | null) {
		return this.http.put(`${this.url}/${method}`, body)
			.map(this.extractData.bind(this));
	}

	public delete(method: string, params) {
		return this.http.delete(`${this.url}/${method}`, { params: params });
	}

}
