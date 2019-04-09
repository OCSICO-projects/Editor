import { throwError as observableThrowError, Subject } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { catchError, first, switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import fabric from '@app/editor/fabric';

import { EditorService } from '@app/editor/services/editor.service';
import { ObjectFactory } from '@app/editor/services/object.factory';
import { MessageService } from '@app/shared/services/message.service';
import { EditorTourService } from '@app/shared/services/editor-tour.service';
import { Slide } from '@app/editor/models/slide.model';
import { RedirectType } from '@app/editor/models/general-settings.model';
import { PropertiesComponentDeclarations } from '@app/editor/properties/properties.component';
import { WorkspaceComponent } from '@app/editor/workspace/workspace.component';
import { ObjectsComponentDeclarations } from '@app/editor/objects/objects.component';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { Message } from '@app/shared/models/message.model';
import { SlidePreviewDialogComponent } from '@app/editor/dialogs/slide-preview-dialog/slide-preview-dialog.component';
import { HotspotPreviewDialogComponent } from '@app/editor/dialogs/hotspot-preview-dialog/hotspot-preview-dialog.component';
import { SlideEditDialogComponent } from '@app/editor/dialogs/slide-edit-dialog/slide-edit-dialog.component';
import { HotspotEditDialogComponent } from '@app/editor/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import { SurveyEditDialogComponent } from '@app/editor/dialogs/survey-edit-dialog/survey-edit-dialog.component';
import { RedirectResourceComponent } from '@app/editor/dialogs/redirect-resource.component';
import { ContentPopupComponent } from '@app/content-manager/content-popup/content-popup.component';
import { ContentMovePopupComponent } from '@app/content-manager/content-list/content-move-popup/content-move-popup.component';
import { ConfigType } from '@app/constants/config-type';
import { ContentManagerService } from '@app/content-manager/content-manager.service';
import { Resource } from '@app/shared/models/resource.model';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    entryComponents: [SlideEditDialogComponent],
})

export class EditorComponent implements OnInit, OnDestroy {
    currentSlide: Slide;
    objectList: fabric.Object[];
    currentFolderSlide: any;
    defaultSlide = [];

    canvasImage: string;

    onDestroy$ = new Subject();

    private slideDialogConfig = {
        autoFocus: false,
        panelClass: 'slide-edit-dialog',
        data: {slide: this.currentSlide, isNew: false}
    };

    constructor(
        private addFileDialog: MatDialog,
        private messageService: MessageService,
        private translateService: TranslateService,
        private contentManagerService: ContentManagerService,
        public dialog: MatDialog,
        public editorService: EditorService,
        public objectFactory: ObjectFactory,
        private editorTourService: EditorTourService
    ) {
    }

    ngOnInit() {
        this.editorService.currentSlide$
            .pipe(
                takeUntil(this.onDestroy$)
            )
            .subscribe(slide => {
                this.currentSlide = slide;
            });
        this.editorService.objectList$
            .pipe(
                takeUntil(this.onDestroy$)
            )
            .subscribe(objectList => this.objectList = objectList);
        this.editorTourService.initialize();

        this.saveCurrentSlide();

        this.currentSlide.general.name = this.currentSlide.general.name ? this.currentSlide.general.name : 'NewSlide';
    }

    currentSlideName() {
        return this.currentSlide.general.name.length > 30 ? this.currentSlide.general.name.slice(0, 30) + '...' : this.currentSlide.general.name;
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.editorTourService.unsubscribe();
    }

    saveCurrentSlide() {
        this.editorService.generatedPreview$
            .pipe(
                first()
            )
            .subscribe(preview => {
                if (preview) {
                    this.canvasImage = preview;
                    this.contentManagerService.getList(`resources`)
                        .pipe(
                            takeUntil(this.onDestroy$)
                        )
                        .subscribe((result: Resource[]) => {
                            if (this.currentFolderSlide && this.currentFolderSlide.id) {
                                this.saveSlide$(this.defaultSlide, this.currentFolderSlide).subscribe();
                            } else {
                                let saveStart;

                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].type === 'compose' && result[i].name === this.currentSlide.general.name) {
                                        this.messageService.showErrorMessage('This name already exists.');
                                        saveStart = false;
                                        break;
                                    } else {
                                        saveStart = true;
                                    }
                                }
                                if (saveStart) {
                                    const dialogRef = this.dialog.open(ContentMovePopupComponent, {
                                        panelClass: 'contents-move-form-dialog',
                                    });
                                    dialogRef.afterClosed().subscribe(currentFolder => {
                                        if (!currentFolder) {
                                            return;
                                        }
                                        this.saveSlide$(currentFolder, this.defaultSlide).subscribe();
                                    });
                                }

                            }
                        });
                }
            });
        this.editorService.generatePreview();
    }

    isFormAdded() {
        return this.objectList.some(object => object instanceof fabric.FormGroup);
    }

    isFeedbackFormAdded() {
        return this.objectList.some((object) => (
            object instanceof fabric.FormGroup &&
            object.getObjects().some(nestedObject => nestedObject instanceof fabric.FeedbackButton)
        ));
    }

    isFacebookButtonAdded() {
        return this.objectList.some(object => object instanceof fabric.FacebookButton);
    }

    isTwitterButtonAdded() {
        return this.objectList.some(object => object instanceof fabric.TwitterButton);
    }

    isLinkedinButtonAdded() {
        return this.objectList.some(object => object instanceof fabric.LinkedinButton);
    }

    isHotspotOrSurvey() {
        return this.currentSlide && this.currentSlide.general && ['hotspot', 'survey'].includes(this.currentSlide.general.subtype);
    }

    isSurvey() {
        return this.currentSlide && this.currentSlide.general && this.currentSlide.general.subtype === 'survey';
    }

    isHotspot() {
        return this.currentSlide && this.currentSlide.general && this.currentSlide.general.subtype === 'hotspot';
    }

    confirmUnsavedChanges() {
        if (!this.editorService.isSlideUnsaved()) {
            return of(null);
        }

        return this.translateService.get('MESSAGES.CONFIRM_SUBTITLE')
            .pipe(
                switchMap((subTitle) => {
                    const messageModel = new Message({
                        type: ConfigType.typeWarning,
                        subTitle: subTitle,
                    });
                    const dialogRef = this.dialog.open(MessageComponent, {autoFocus: false, data: messageModel});
                    return dialogRef.afterClosed();
                }),
                switchMap((result) => {
                    if (result === true) {
                        this.contentManagerService.getList(`resources`)
                            .pipe(
                                takeUntil(this.onDestroy$)
                            )
                            .subscribe((result: Resource[]) => {
                                if (this.currentFolderSlide && this.currentFolderSlide.id) {
                                    this.saveSlide$(this.defaultSlide, this.currentFolderSlide).subscribe();
                                } else {
                                    let saveStart;

                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i].type === 'compose' && result[i].name === this.currentSlide.general.name) {
                                            this.messageService.showErrorMessage('This name already exists.');
                                            saveStart = false;
                                            break;
                                        } else {
                                            saveStart = true;
                                        }
                                    }
                                    if (saveStart) {
                                        const dialogSaveSlide = this.dialog.open(ContentMovePopupComponent, {
                                            autoFocus: false,
                                            panelClass: 'contents-move-form-dialog',
                                        });
                                        dialogSaveSlide.afterClosed().subscribe(currentFolder => {
                                            if (!currentFolder) {
                                                return;
                                            }
                                            this.editorService.generatedPreview$
                                                .pipe(
                                                    first()
                                                )
                                                .subscribe(preview => {
                                                    if (preview) {
                                                        this.canvasImage = preview;
                                                        this.saveSlide$(currentFolder, this.defaultSlide).subscribe((savedSlide: any) => {
                                                            if (!savedSlide) {
                                                                const isNew = true;
                                                                this.slideDialogConfig.data.isNew = isNew;
                                                                const dialogRef = this.dialog.open(SlideEditDialogComponent, this.slideDialogConfig);
                                                                this.onCloseEditDialog(dialogRef, isNew);
                                                            }
                                                        });
                                                    }
                                                });
                                            this.editorService.generatePreview();
                                        });
                                    }
                                }
                            });
                    }
                    if (result === null) {
                        return observableThrowError(null);
                    }
                    if (result === false) {
                        return of(null);
                    }
                    return this.saveSlide$();
                })
            );
    }

    openEditDialog(): void {
        if (!this.currentSlide || !this.currentSlide.general.subtype) {
            return;
        }

        switch (this.currentSlide.general.subtype.toLowerCase()) {
            case 'slide':
                this.openSlideEditDialog();
                break;
            case 'hotspot':
                this.openHotspotEditDialog();
                break;
            case 'survey':
                this.openSurveyEditDialog();
                break;
        }
    }

    openPreviewDialog() {
        const slideType = (this.currentSlide.general.subtype || '').toLowerCase();
        if (['hotspot', 'survey'].includes(slideType)) {
            this.openHotspotPreviewDialog();
        } else {
            this.openSlidePreviewDialog();
        }
    }

    openSlidePreviewDialog() {
        this.dialog.open(SlidePreviewDialogComponent, {
            panelClass: 'editor-dialog',
            autoFocus: false,
            data: this.currentSlide,
        });
    }

    openHotspotPreviewDialog() {
        this.dialog.open(HotspotPreviewDialogComponent, {
            panelClass: 'editor-dialog',
            autoFocus: false,
            data: this.currentSlide,
        });
    }


    openSlideEditDialog(isNew: boolean = false): void {
        const confirmUnsavedChanges$ = isNew ? this.confirmUnsavedChanges() : of(null);
        confirmUnsavedChanges$.subscribe(
            () => {
                this.slideDialogConfig.data.isNew = isNew;
                if (!isNew) {
                    this.slideDialogConfig.data.slide = this.currentSlide;
                }
                const dialogRef = this.dialog.open(SlideEditDialogComponent, this.slideDialogConfig);
                this.onCloseEditDialog(dialogRef, isNew);
            },
            () => {
            }
        );
    }

    openHotspotEditDialog(isNew = false) {
        const confirmUnsavedChanges$ = isNew ? this.confirmUnsavedChanges() : of(null);
        confirmUnsavedChanges$.subscribe(
            () => {
                this.slideDialogConfig.data.isNew = isNew;
                if (!isNew) {
                    this.slideDialogConfig.data.slide = this.currentSlide;
                }
                const dialogRef = this.dialog.open(HotspotEditDialogComponent, this.slideDialogConfig);
                this.onCloseEditDialog(dialogRef, isNew);
            },
            () => {
            }
        );
    }

    openSurveyEditDialog(isNew = false) {
        const confirmUnsavedChanges$ = isNew ? this.confirmUnsavedChanges() : of(null);
        confirmUnsavedChanges$.subscribe(
            () => {
                this.slideDialogConfig.data.isNew = isNew;
                if (!isNew) {
                    this.slideDialogConfig.data.slide = this.currentSlide;
                }
                const dialogRef = this.dialog.open(SurveyEditDialogComponent, this.slideDialogConfig);
                this.onCloseEditDialog(dialogRef, isNew);
            },
            () => {
            }
        );
    }

    private onCloseEditDialog(dialogRef, isNew) {
        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }

            if (isNew) {
                this.currentFolderSlide = this.defaultSlide;
                this.editorService.resetEditor(result);
            } else {
                this.editorService.updateSlide(result);
                this.editorService.pushHistoryState();
            }
        });
    }

    private prepareActionsForSave() {
        const actions: any = {};

        this.objectList.forEach((object) => {
            if (
                object instanceof fabric.FacebookButton ||
                object instanceof fabric.TwitterButton ||
                object instanceof fabric.LinkedinButton
            ) {
                let buttonType = 'linkedin';
                buttonType = object instanceof fabric.FacebookButton ? 'facebook' : buttonType;
                buttonType = object instanceof fabric.TwitterButton ? 'twitter' : buttonType;

                const properties = {url: object.action.redirectUrl};

                switch (object.action.accessType) {
                    case 'post':
                        Object.assign(properties, {
                            text: object.action.post.text,
                            page: object.action.post.page,
                        });
                        break;
                    case 'like':
                        Object.assign(properties, {
                            page: object.action.like.page,
                        });
                        break;
                }

                actions[buttonType] = {
                    type: object.action.accessType,
                    properties,
                };
            }

            if (
                object instanceof fabric.FormGroup &&
                object.getObjects().some(formObject => formObject instanceof fabric.VoucherButton)
            ) {
                actions.voucher = {type: 'simple'};
            }

            if (object instanceof fabric.ConnectGroup) {
                actions.button = {type: object.connectionProperty};
            }
        });

        const slideSettings = this.currentSlide.general;
        const redirectType = slideSettings.redirectType;
        const redirectAttribute = redirectType === RedirectType.external ? 'url' : 'id';

        if (slideSettings.redirectEndpoint) {
            actions.redirect = {
                type: slideSettings.redirectType,
                properties: {
                    [redirectAttribute]: slideSettings.redirectEndpoint,
                },
            };
        }

        const feedBackForm = <fabric.FeedbackGroup>this.objectList.find(object => object instanceof fabric.FeedbackGroup);
        if (feedBackForm) {
            const ratings = <fabric.Rating[]>feedBackForm.getObjects().filter(object => object instanceof fabric.Rating);
            if (ratings.length) {
                const properties = {};
                ratings.forEach(rating => properties[`fb-${rating.id}`] = rating.text);

                actions.feedback = {
                    type: 'questions',
                    properties,
                };
            }
        }

        return actions;
    }

    private prepareResourceIdsForSave() {
        const resourceIds = this.objectList.reduce((ids: string[], object: fabric.Object) => {
            if (
                (object instanceof fabric.Image || object instanceof fabric.Video)
                && object.resourceId
                && !ids.includes(object.resourceId)
            ) {
                ids.push(object.resourceId);
            }

            return ids;
        }, []);

        return resourceIds;
    }

    getSavedMessage() {
        let translationKey;

        const subtype = (this.currentSlide.general.subtype || '').toLowerCase();
        switch (subtype) {
            case 'hotspot':
                translationKey = 'EDITOR.MESSAGES.HOTSPOT_SAVED';
                break;
            case 'survey':
                translationKey = 'EDITOR.MESSAGES.SURVEY_SAVED';
                break;
            default:
                translationKey = 'EDITOR.MESSAGES.SLIDE_SAVED';
        }

        return this.translateService.instant(translationKey);
    }

    saveSlide$(currentFolder?: any, currentSlide?: any) {
        const slide = this.currentSlide;
        const actions = this.prepareActionsForSave();
        const resourceIds = this.prepareResourceIdsForSave();

        return this.editorService
            .saveSlide(slide, actions, resourceIds, currentFolder, currentSlide, this.canvasImage)
            .pipe(
                switchMap(
                    response => {

                        this.currentFolderSlide = response;
                        const savedSlide = JSON.parse(response['content']);
                        savedSlide.general.resourceId = response['id'];
                        savedSlide.general.resourceVersion = response['version'];
                        this.editorService.updateSlide(savedSlide);

                        return this.messageService.showSuccessMessage(this.getSavedMessage());
                    }
                ),
                catchError((error) => (
                    this.messageService.showErrorMessage(error['message'])
                        .pipe(switchMap(() => observableThrowError(error)))
                ))
            );
    }

    private openSlideEdit(slide: any) {
        const slideFromOutside = JSON.parse(slide.content);
        this.currentSlide = new Slide(slideFromOutside);
        this.editorService.resetEditor(this.currentSlide);
    }

    openAddFileDialog(flag?) {

        const dialogRef = this.addFileDialog.open(ContentPopupComponent, {
            autoFocus: false,
            panelClass: 'editor-dialog',
            data: {filterExclude: {type: ['compose']}, flag},
        });

        dialogRef.afterClosed().subscribe(resource => {
            if (!resource) {
                return;
            }

            resource.forEach(resource => {
                if (!resource) {
                    return;
                }

                if (resource.type === 'compose') {
                    if (this.currentFolderSlide !== resource) {
                        this.currentFolderSlide = resource;
                    }
                    this.openSlideEdit(resource);
                }

                const resourceParentId = resource.folder_id;
                const resourceId = resource.id;
                const previewUrl = resource.preview || null;
                const resourceName = resource.name;

                if (resource.subtype === 'youtube') {
                    const youtubeId = fabric.util.parseYoutubeId(resource.url);

                    fabric.Youtube.fromPreview(youtubeId, (youtube: fabric.Youtube, error) => {
                        if (error) {
                            const message = this.translateService.instant('EDITOR.MESSAGES.ERROR_LOADING_VIDEO');
                            this.messageService.showErrorMessage(message);

                            return;
                        }
                        youtube.setOptions({title: 'Youtube', previewUrl: `https://img.youtube.com/vi/${youtubeId}/0.jpg`, resourceId, resourceName, resourceParentId});
                        this.editorService.addObject(youtube);
                    });

                    return;
                }

                if (!resource.subtype) {
                    const message = this.translateService.instant('EDITOR.MESSAGES.UNKNOWN_FILE_TYPE');
                    this.messageService.showErrorMessage(message);
                    return;
                }

                const resourceUrl = resource.preview;

                if (resource.subtype.includes('image')) {
                    fabric.util.loadImage(resourceUrl, (object) => {
                        const image = new fabric.Image(object, {});
                        image.setOptions({title: 'Image', previewUrl, resourceId, resourceName, resourceParentId});
                        this.editorService.addObject(image);
                    }, null, 'anonymous');
                }

                if (resource.subtype.includes('video')) {
                    fabric.Video.fromPreview(resourceUrl, (video) => {
                        video.setOptions({title: 'Video', src: resource.file.url, previewUrl, resourceId, resourceName, resourceParentId});
                        this.editorService.addObject(video);
                    });
                }
            });
        });
    }

    onAddMenuOpen() {
        this.editorTourService.startAddMenuTour();
    }

    onMenuClose() {
        this.editorTourService.startInitialTour();
    }
}

export const EditorComponentDeclarations = [
    EditorComponent,
    WorkspaceComponent,
    PropertiesComponentDeclarations,
    ObjectsComponentDeclarations,
    SlidePreviewDialogComponent,
    HotspotPreviewDialogComponent,
    SlideEditDialogComponent,
    HotspotEditDialogComponent,
    SurveyEditDialogComponent,
    RedirectResourceComponent,
];
