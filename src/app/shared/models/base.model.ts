import { assign } from 'lodash';

export class BaseModel {
	constructor(src: object = {}) {
		assign(this, src);
	}
}
