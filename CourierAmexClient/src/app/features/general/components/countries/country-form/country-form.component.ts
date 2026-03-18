import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CountryModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'country-form',
  templateUrl: './country-form.component.html',
  inputs: ['entity', 'pagination'],
  outputs: ['onSave', 'onGoBack']
})
export class CountryFormComponent {
  entity!: CountryModel;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  onSave = new EventEmitter<CountryModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Countries, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Countries, PermissionActionEnum.Update);
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
