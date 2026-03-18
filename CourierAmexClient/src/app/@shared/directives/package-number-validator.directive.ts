import { AbstractControl, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { Directive, Input } from "@angular/core";

import { Observable, catchError, map, of, switchMap, timer } from "rxjs";

import { CommonService } from "@app/@core";

export function packageNumberValidator(id: string, commonService: CommonService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (isNaN(+id) || isNaN(+control.value)) return of(null);
    return timer(100)
      .pipe(
        switchMap(() => commonService.validatePackageNumber$(+id, +control.value)),
        map((res) => res ? ({ exists: true }) : null),
        catchError(() => of(null))
      );
  }
}

@Directive({
  selector: "[packageNumberValidator][ngModel]",
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: PackageNumberValidatorDirective,
    multi: true
  }]
})
export class PackageNumberValidatorDirective implements Validator {
  @Input() packageNumberValidator: string = '';

  constructor(
    private commonService: CommonService
  ) { }

  validate(c: AbstractControl): ValidationErrors | null {
    if (!c.valueChanges || !c.value) {
      return null;
    }
    return packageNumberValidator(this.packageNumberValidator, this.commonService)(c);
  }
}
