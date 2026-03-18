import { AbstractControl, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { Directive, Input } from "@angular/core";
import { Observable, map } from "rxjs";

import { CommonService } from "@app/@core";

export function manifestNumberValidator(id: string, commonService: CommonService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return commonService.validateManifestNumber$(id, control.value)
      .pipe(
        map((result: boolean) =>
          result ? { exists: true } : null
        )
      );
  }
}

@Directive({
  selector: "[manifestNumberValidator][ngModel]",
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: ManifestNumberValidatorDirective,
    multi: true
  }]
})
export class ManifestNumberValidatorDirective implements Validator {
  @Input() manifestNumberValidator: string = '';

  constructor(
    private commonService: CommonService
  ) { }

  validate(c: AbstractControl): ValidationErrors | null {
    if (!c.valueChanges || !c.value) {
      return null;
    }
    return manifestNumberValidator(this.manifestNumberValidator, this.commonService)(c);
  }
}
