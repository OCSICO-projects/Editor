import { BaseModel } from '@app/shared/models/base.model';
import { General } from '@app/editor/models/general-settings.model';

import { merge } from 'lodash';

export class Slide extends BaseModel {
	general: General;
	backgroundColor: string;
	objects: any[]; // Text, Shapes, Images and other canvas objects

	constructor(src: object = {}) {
		const generalProps = src['general'] || {};
		const generalObj = new General(generalProps);
		const defaultValues = {
			general: generalObj,
			backgroundColor: '#ffffff',
			objects: [],
		};
		const props = merge({}, defaultValues, src);
		super(props);
	}
}
