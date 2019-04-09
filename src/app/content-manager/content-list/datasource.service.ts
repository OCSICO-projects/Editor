import { Injectable, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ContentManagerService } from 'app/content-manager/content-manager.service';

@Injectable({
	providedIn: 'root'
})
export class DatasourceService implements DataSource<any>, OnDestroy {

	private resources = new BehaviorSubject<any[]>([]);
	public readonly resources$ = this.resources.asObservable();
	private onDestroy$ = new Subject();

	constructor(
		private contentManagerService: ContentManagerService,
	) { }

	public connect(): Observable<any[]> {
		return this.resources$;
	}

	public loadResources() {
		this.contentManagerService.list
			.pipe(
				takeUntil(this.onDestroy$)
			)
			.subscribe(list => {
				this.resources.next(list);
			});
	}

	public disconnect() {
	}

	public ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
