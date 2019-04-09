import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { ContentPopupComponent } from 'app/content-manager/content-popup/content-popup.component';

@Component({
	selector: `app-editor-redirect-resource`,
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => RedirectResourceComponent),
		multi: true
	}],
	template: `
        <div class="resource-field">
            <mat-form-field>
                <input
                    matInput
                    placeholder="{{ 'EDITOR.HOTSPOTS.FIELDS.REDIRECT_RESOURCE_ID' | translate }}"
                    [(ngModel)]="redirectId"
                    readonly
                >
            </mat-form-field>

            <button mat-icon-button type="button" (click)="selectResource()">
                <mat-icon>insert_drive_file</mat-icon>
            </button>

            <button mat-icon-button type="button" (click)="deleteResource()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
    `,
	styles: [`
        .resource-field {
            display: flex;
            align-items: center;
        }

        mat-form-field {
            width: 100%;
            margin-right: 10px;
        }

        button {
            width: 54px;
            height: 54px;
        }

        mat-icon {
            font-size: 32px;
            width: 44px;
            height: 44px;
            line-height: 44px !important;
        }
    `],
})
export class RedirectResourceComponent implements ControlValueAccessor {
	protected _redirectId = '';
	protected isDisabled = true;
	protected onChange: Function;

	constructor(
		private selectResourceDialog: MatDialog
	) {}

	set redirectId(value: string) {
		this._redirectId = value;
		this.onChange(value);
	}

	get redirectId() { return this._redirectId; }

	writeValue(value: string) { this._redirectId = value; }

	registerOnChange(fn) { this.onChange = fn; }

	registerOnTouched(fn) { }

	selectResource() {
		const dialogRef = this.selectResourceDialog.open(ContentPopupComponent, {
			autoFocus: false,
			panelClass: 'editor-dialog',
			data: { filterExclude: { subtype: ['hotspot'] } },
		});

		dialogRef.afterClosed().subscribe(resource => {
			if (resource) {
				this.redirectId = resource.id;
			}
		});
	}

	deleteResource() { this.redirectId = ''; }
}



