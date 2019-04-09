import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CdkTableModule } from '@angular/cdk/table';
import {
	MatButtonModule,
	MatButtonToggleModule,
	MatDialogModule,
	MatFormFieldModule,
	MatGridListModule,
	MatIconModule,
	MatProgressSpinnerModule,
	MatInputModule,
	MatSelectModule,
	MatSliderModule,
	MatTabsModule,
	MatToolbarModule,
	MatRippleModule,
	MatSidenavModule,
	MatSlideToggleModule,
	MatSortModule,
	MatTableModule,
	MatMenuModule,
	MatCheckboxModule,
	MatAutocompleteModule,
	MatCardModule,
	MatListModule,
	MatDatepickerModule,
	MatNativeDateModule,
	MatRadioModule,
	MatSnackBarModule,
	MatProgressBarModule,
	MatTooltipModule,
	MatChipsModule,
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TextMaskModule } from 'angular2-text-mask';

import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { EllipsisTextPipe } from './pipes/ellipsis-text.pipe';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatToolbarModule,
		TranslateModule.forChild(),
		MatProgressBarModule,
		FormsModule,
		FlexLayoutModule,
		ReactiveFormsModule,
		MatCheckboxModule,
		TranslateModule,
		MatFormFieldModule,
	],
	exports: [
		FlexLayoutModule,
		ReactiveFormsModule,
		FormsModule,
		TranslateModule,
		CdkTableModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatDialogModule,
		MatFormFieldModule,
		MatGridListModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatInputModule,
		MatSelectModule,
		MatSliderModule,
		MatTabsModule,
		MatToolbarModule,
		MatRippleModule,
		MatSidenavModule,
		MatSlideToggleModule,
		MatSortModule,
		MatTableModule,
		MatMenuModule,
		MatCheckboxModule,
		MatAutocompleteModule,
		MatCardModule,
		MatListModule,
		MatChipsModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatRadioModule,
		MatSnackBarModule,
		MatTooltipModule,
		ProgressBarComponent,
		EllipsisTextPipe,
		MatProgressBarModule,
		TextMaskModule,
		TranslateModule
	],
	declarations: [
		ProgressBarComponent,
		EllipsisTextPipe,
	],
})

export class SharedModule {
}
