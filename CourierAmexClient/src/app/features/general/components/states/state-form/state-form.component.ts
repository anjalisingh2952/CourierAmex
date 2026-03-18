import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CountryModel, StateModel } from '@app/features/general/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'state-form',
  templateUrl: './state-form.component.html',
  inputs: ['entity', 'countries'],
  outputs: ['onSave', 'onGoBack']
})
export class StateFormComponent {
  entity!: StateModel;
  countries: CountryModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  onSave = new EventEmitter<StateModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.States, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.States, PermissionActionEnum.Update);
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
