import { AbstractControl, ValidatorFn } from '@angular/forms';

export function requiredStringValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const valid = control.value.toString().trim().length > 0;
        return valid ? null : { 'requiredString': { value: control.value } };
    };
}
