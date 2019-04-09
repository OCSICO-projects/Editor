import { BaseModel } from './base.model';

export class PlayListProperties extends BaseModel {
	filename?: string;
	id?: string;
	path?: string;
	directory?: string;
	url?: string;
	original_filename?: string;
	extension?: string;
	media_type?: string;
	size?: number;
	duration?: boolean;
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
}
