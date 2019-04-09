import { BaseModel } from './base.model';
import { ConfigType } from '@app/constants/config-type';

export class Message extends BaseModel {
	title: string;
	subTitle: string;
	message: string;
	type: string;
	shouldBeTranslated: boolean;

	constructor(src: object = {}) {
		const defaultValues = {
			title: '',
			subTitle: '',
			message: '',
			type: ConfigType.typeSuccess,
			shouldBeTranslated: false
		};

		const props = Object.assign({}, defaultValues, src);
		super(props);
	}
}
