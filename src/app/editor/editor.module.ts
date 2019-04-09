import { NgModule } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { CommonModule } from '@angular/common';

import { EditorComponent, EditorComponentDeclarations } from '@app/editor/editor.component';
import { SlideEditDialogComponent } from '@app/editor/dialogs/slide-edit-dialog/slide-edit-dialog.component';
import { SlidePreviewDialogComponent } from '@app/editor/dialogs/slide-preview-dialog/slide-preview-dialog.component';
import { HotspotPreviewDialogComponent } from '@app/editor/dialogs/hotspot-preview-dialog/hotspot-preview-dialog.component';
import { HotspotEditDialogComponent } from '@app/editor/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import { SurveyEditDialogComponent } from '@app/editor/dialogs/survey-edit-dialog/survey-edit-dialog.component';
import { TourMatMenuModule } from 'ngx-tour-md-menu';

import { SharedModule } from '@app/shared/shared.module';
import { AuthModule } from '@app/auth/auth.module';

@NgModule({
	entryComponents: [
		SlidePreviewDialogComponent,
		HotspotPreviewDialogComponent,
		SlideEditDialogComponent,
		HotspotEditDialogComponent,
		SurveyEditDialogComponent,
		EditorComponent
	],
	imports: [
		CommonModule,
		NgxDnDModule,
		SharedModule,
		ColorPickerModule,
		TourMatMenuModule,
		AuthModule
	],
	declarations: [
		EditorComponentDeclarations,
	]
})
export class EditorModule { }
