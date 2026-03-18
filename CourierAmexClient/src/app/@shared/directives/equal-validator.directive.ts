import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";

export function equalValidator(equalValidator: string): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const controlToCompare = c.root.get(equalValidator);
    if (controlToCompare && controlToCompare.value === c.value) return null;
    return { "notEqual": true }
  }
}

@Directive({
  selector: "[equalValidator][ngModel]",
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: EqualValidatorDirective,
    multi: true
  }]
})
export class EqualValidatorDirective implements Validator {
  @Input() equalValidator: string = '';

  validate(c: AbstractControl): ValidationErrors | null {
    return this.equalValidator ? equalValidator(this.equalValidator)(c) : { "notEqual": true };
  }
}
