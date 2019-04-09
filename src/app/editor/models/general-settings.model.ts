import fabric from '@app/editor/fabric';
import { BaseModel } from '@app/shared/models/base.model';
import { CanvasTemplates } from '@app/editor/models/canvas-templates.model';

export enum RedirectType {
	external = 'external',
	internal = 'internal',
}

export class General extends BaseModel {
	type: 'compose';
	subtype: 'slide' | 'hotspot' | 'survey';
	name: string;
	duration: string;
	ssid: string; // hotspot and survey
	redirectType: RedirectType;
	redirectEndpoint: string;
	trackingLink: string; // survey
	templateId: CanvasTemplates;
	showTemplate: boolean;
	showGrid: boolean;
	gridSize: number;
	folderId: string | null;
	playerVersion: number;
	resourceId: string | null;
	resourceVersion: number;

	constructor(src: object = {}) {
		const defaultValues = {
			id: null,
			type: 'compose',
			subtype: 'slide',
			name: '',
			folderId: null,
			duration: '',
			ssid: '',
			redirectType: RedirectType.external,
			redirectEndpoint: '',
			playerVersion: fabric.settings.version,
			resourceId: null,
			resourceVersion: 0,
			trackingLink: '',
			templateId: CanvasTemplates.cell,
			showTemplate: false,
			showGrid: false,
			gridSize: 20,
		};

		const props = Object.assign({}, defaultValues, src);

		super(props);
	}
}
