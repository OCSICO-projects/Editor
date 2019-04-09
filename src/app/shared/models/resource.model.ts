import { BaseModel } from './base.model';
import { PlayListProperties } from './play-list-properties.model';

export class Resource extends BaseModel {
	id?: string | null;
	folder_id: string | null;
	file?: PlayListProperties;
	preview_id?: string | null;
	preview?: string | null;
	version: string | null;
	name: string;
	type: string;
	subtype?: string;
	content?: any;
	created_at?: {
		date: string | null;
		timezone_type: number;
		timezone: string | null;
	};
	updated_at?: {
		date: string | null;
		timezone_type: number;
		timezone: string | null;
	};
	fileId?: string | null;
	parent_id: string | null;
	icon?: string;
	url?: string | null;
	image?: string;
	selected?: boolean;
	title?: string;
	lastModifiedDate?: string;
	children?: any;
	path?: any;
	compat?: any;
	duration?: any;
	resourceId?: string;
	transition?: string;
	isDurationEditable?: boolean;
}
