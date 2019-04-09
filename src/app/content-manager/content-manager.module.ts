import { CdkTableModule } from '@angular/cdk/table';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ResizableModule } from 'angular-resizable-element';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ContentListComponent } from '@app/content-manager/content-list/content-list.component';
import { ContentTileComponent } from '@app/content-manager/content-tile/content-tile.component';
import { ContentPopupComponent } from '@app/content-manager/content-popup/content-popup.component';
import { TreeViewComponent } from '@app/content-manager/content-tile/tree-view/tree-view.component';
import { ContentMovePopupComponent } from '@app/content-manager/content-list/content-move-popup/content-move-popup.component';
import { ContentEditPopupComponent } from '@app/content-manager/content-list/content-edit-popup/content-edit-popup.component';
import { CreatePopupComponent } from '@app/content-manager/create-popup/create-popup.component';
import { ShowContentPopupComponent } from '@app/content-manager/show-content-popup/show-content-popup.component';
import { ContentItemIconComponent } from '@app/content-manager/content-item-icon/content-item-icon.component';
import { FileUploadComponent } from '@app/content-manager/file-upload/file-upload.component';
import { ImagePreloaderDirective } from '@app/shared/directives/image-preloader.directive';
import { ContentDeletePopupComponent } from '@app/content-manager/content-list/content-delete-popup/content-delete-popup.component';
import { AddYoutubeComponent } from '@app/content-manager/add-youtube/add-youtube.component';

import { SharedModule } from '@app/shared/shared.module';

@NgModule({
	declarations: [
		ContentListComponent,
		ContentTileComponent,
		ContentPopupComponent,
		TreeViewComponent,
		ContentMovePopupComponent,
		ContentEditPopupComponent,
		ContentDeletePopupComponent,
		CreatePopupComponent,
		ShowContentPopupComponent,
		ContentItemIconComponent,
		FileUploadComponent,
		ImagePreloaderDirective,
		AddYoutubeComponent
	],
	imports: [
		CdkTableModule,
		SharedModule,
		ResizableModule,
		BrowserAnimationsModule

	],
	entryComponents: [
		ContentPopupComponent,
		ContentMovePopupComponent,
		ContentEditPopupComponent,
		ContentDeletePopupComponent,
		CreatePopupComponent,
		ShowContentPopupComponent,
		FileUploadComponent,
		AddYoutubeComponent
	],
	schemas: [
		CUSTOM_ELEMENTS_SCHEMA
	]
})
export class ContentManagerModule {
}
