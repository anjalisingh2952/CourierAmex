import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ControlCodeModel } from '../../../models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'control-code-form',
  templateUrl: './control-code-form.component.html',
  inputs: ['entities'],
  outputs: ['onSubmit']
})
export class ControlCodeFormComponent {
  hasUpdate: boolean = false;
  entities: ControlCodeModel[] = [];
  onSubmit = new EventEmitter<ControlCodeModel[]>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.ControlCodes, PermissionActionEnum.Update);
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      const settings = Object.keys(form.value).map(set => {
        return form.value[set];
      });

      this.onSubmit.emit(settings);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
