import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TourService } from 'ngx-tour-md-menu';
import { takeUntil } from 'rxjs/operators';

const localStorageStatusKey = 'tour_statuses';

const localStorageStepIdsKey = 'tour_current_step_ids';

const initialTour = 'initial';
const objectSettingsTour = 'objectSettings';

@Injectable({
	providedIn: 'root'
})
export class EditorTourService {
    private steps = {
        [initialTour]: [{
            stepId: 'editor-header-add',
            anchorId: 'editor-header-add',
            content: 'Press “Add” button to add object to the slide or create new slide',
            title: 'Tip: "Add" button',
						enableBackdrop: true,
						endBtnTitle: 'Close'
				},
				{
					stepId: 'editor-general-settings',
					anchorId: 'editor-general-settings',
					content: 'Use general settings to set canvas and background color',
					title: 'Tip: General Canvas Settings',
					enableBackdrop: true,
					endBtnTitle: 'Close'
				}],
        [objectSettingsTour]: [{
            stepId: 'editor-object-settings',
            anchorId: 'editor-object-settings',
            content: 'Use object properties to customize object view or add animation to the object',
						title: 'Tip: Object Properties',
						enableBackdrop: true,
						endBtnTitle: 'Close'
        }],
    };
    private initialTourStepIds = {
        [initialTour]: this.steps[initialTour][0].stepId,
        [objectSettingsTour]: this.steps[objectSettingsTour][0].stepId
    };
    private currentStepIds = this.getCurrentStepIds();
    private currentTour = initialTour;
    private isInitialTour = true;
    private initialTourStatuses = {
        [initialTour]: true,
        [objectSettingsTour]: true
    };
    private tourStatuses = this.getTourStatuses();

    private onDestroy$ = new Subject();

    constructor(
        private tourService: TourService
    ) {
		}

    initialize() {
        if (!this.allToursPassed()) {
						this.tourService.initialize$
							.pipe(
								takeUntil(this.onDestroy$)
							)
							.subscribe(() => {
									setTimeout(() => {
											this.tourService.startAt(this.currentStepIds[this.currentTour]);
									}, 400);
							});
						this.tourService.end$
							.pipe(
								takeUntil(this.onDestroy$)
							)
							.subscribe((x) => {
									this.markTourAsEnded(this.currentTour);
							});
						this.tourService.stepShow$
							.pipe(
								takeUntil(this.onDestroy$)
							)
							.subscribe((step) => {
									this.storeCurrentTourStepId(this.currentTour, step.stepId);
							});
            this.startInitialTour();
        }
    }

    unsubscribe() {
				this.onDestroy$.next();
				this.onDestroy$.complete();
    }

    startInitialTour() {
        this.startTour(initialTour);
    }

    startAddMenuTour() {
        this.startTour(initialTour);
    }

    startObjectSettingsTour() {
        this.startTour(objectSettingsTour);
    }

    private allToursPassed() {
        return !Object.values(this.tourStatuses).includes(true);
    }

    private startTour(tourKey: string) {
        if (this.tourStatuses[tourKey]) {
            this.tourService.end();
            this.isInitialTour = tourKey === initialTour;
            this.currentTour = tourKey;
            this.tourService.initialize(this.steps[tourKey]);
        }
    }

    private getTourStatuses() {
        const tourStatuses = localStorage.getItem(localStorageStatusKey);
        return tourStatuses ? JSON.parse(tourStatuses) : this.initialTourStatuses;

    }

    private markTourAsEnded(tourKey: string) {
        if (this.currentStepIds[tourKey] === this.steps[tourKey][this.steps[tourKey].length - 1].stepId) {
            this.tourStatuses[tourKey] = false;
            localStorage.setItem(localStorageStatusKey, JSON.stringify(this.tourStatuses));
        }
        if (this.allToursPassed()) {
            localStorage.removeItem(localStorageStepIdsKey);
        }
    }

    private getCurrentStepIds() {
        const currentStepIds = localStorage.getItem(localStorageStepIdsKey);
        return currentStepIds ? JSON.parse(currentStepIds) : this.initialTourStepIds;
    }

    private storeCurrentTourStepId(tour: string, stepId: string) {
        this.currentStepIds[tour] = stepId;
        localStorage.setItem(localStorageStepIdsKey, JSON.stringify(this.currentStepIds));
    }
}
