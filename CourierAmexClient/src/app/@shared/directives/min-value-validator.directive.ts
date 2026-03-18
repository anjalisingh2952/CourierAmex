import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";
import { Directive, Input } from "@angular/core";

export function minValueValidator(min: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = parseInt(control.value || 0);
    const minValue = parseInt(min);
    return !isNaN(value) && value < minValue ?
      { min: true } : null;
  }
}

@Directive({
  selector: "[minValueValidator][ngModel]",
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MinValueValidatorDirective,
    multi: true
  }]
})
export class MinValueValidatorDirective implements Validator {
  @Input() minValueValidator: string = '';

  validate(c: AbstractControl): ValidationErrors | null {
    return minValueValidator(this.minValueValidator)(c);
  }
}
