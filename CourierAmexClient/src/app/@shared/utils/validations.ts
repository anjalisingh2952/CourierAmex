import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export default class Validation {

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

  static greatherThan(value: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control?.value === null) { return { 'greatherThan': true }; }
      if (isNaN(control.value)) { return { 'greatherThan': true }; }

      const ctrlValue = parseFloat(control.value || 0);
      return (ctrlValue > value) ? null : { 'greatherThan': true };
    }
  }
}
