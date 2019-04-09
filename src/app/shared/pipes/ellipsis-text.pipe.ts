import { Pipe, PipeTransform } from '@angular/core';

const nameMaxLength = 25;

@Pipe({ name: 'ellipsisText' })
export class EllipsisTextPipe implements PipeTransform {
	transform(value: string, maxLength: number): string {
		if (!maxLength) {
			maxLength = nameMaxLength;
		}
		return value && (value.length > maxLength) ? `${value.substring(0, maxLength - 1)} ...` : value;
	}
}
