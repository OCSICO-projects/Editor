import { BaseModel } from './base.model';

export class Folder extends BaseModel {
	type: string;
	name: string;
	version: string | null;
	preview_id?: string | null;
	parent_id: string | null;
	isSelected?: boolean;
	id?: string | null;
	children?: Folder[];
	icon?: string;
	folder_id?: string | null;
	isExpanded?: boolean;
	image?: string;
	selected?: boolean;
	subtype?: string;
	fileId?: string;
	title?: string;
	file?: any;
	url?: string | null;
	duration?: any;
	updated_at?: any;
	content?: any;


	constructor(src: Folder) {
		const defaultValues: any = {
			parent_id: src.parent_id,
			name: src.name,
			type: 'folder',
		};
		if (src.id && src.version) {
			defaultValues.id = src.id;
			defaultValues.version = src.version;
		}
		const props = Object.assign({}, defaultValues);
		super(props);
	}
}
