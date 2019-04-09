import { Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { of } from 'rxjs/observable/of';

export class ContentDataSource extends DataSource<any> {
	constructor(private searchResult: any[], private paginator: MatPaginator, private sort: MatSort) {
		super();
	}

	connect(): Observable<any[]> {
		const data = this.searchResult.slice();

		if (this.paginator) {
			const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
			const pages = data.splice(startIndex, this.paginator.pageSize);
			return of(pages);
		}

		return of(data);
	}

	disconnect() {
	}
}

