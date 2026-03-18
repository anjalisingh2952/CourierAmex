import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { Directive, Input } from "@angular/core";

import { CommonService } from "@app/@core";
import { debounceTime, map, of } from "rxjs";

@Directive({
  selector: "[commodityCodeValidator]",
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: CommodityCodeValidatorDirective,
    multi: true
  }]
})
export class CommodityCodeValidatorDirective implements Validator {
  @Input('params') params: any;

  constructor(
    private commonService: CommonService
  ) { }

  validate(c: AbstractControl): ValidationErrors | null {
    if (!c.valueChanges || !c.value) {
      return of(null);
    }
    
    const cia = +this.params['companyId'];
    if (cia === 0) {
      return of({ company: true });
    }
    
    return this.commonService.validateCommodityCode$(+this.params['id'], cia, c.value as string)
      .pipe(
        debounceTime(300),
        map((res) => {
          if (res) {
            return { duplicate: true };
          }
          return null;
        })
      );
  }
}
