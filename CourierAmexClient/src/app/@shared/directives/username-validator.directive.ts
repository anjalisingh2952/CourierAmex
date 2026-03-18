import { AbstractControl, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { Directive, Input } from "@angular/core";
import { Observable, map } from "rxjs";

import { CommonService } from "@app/@core";

export function usernameValidator(id: string, commonService: CommonService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return commonService.validateUsername$(id, control.value)
      .pipe(
        map((result: boolean) =>
          result ? { usernameExists: true } : null
        )
      );
  }
}

@Directive({
  selector: "[usernameValidator][ngModel]",
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: UsernameValidatorDirective,
    multi: true
  }]
})
export class UsernameValidatorDirective implements Validator {
  @Input() usernameValidator: string = '';

  constructor(
    private commonService: CommonService
  ) { }

  validate(c: AbstractControl): ValidationErrors | null {
    if (!c.valueChanges || !c.value) {
      return null;
    }
    return usernameValidator(this.usernameValidator, this.commonService)(c);
  }
}
