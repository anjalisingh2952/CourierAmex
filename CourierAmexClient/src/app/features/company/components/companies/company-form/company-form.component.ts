import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CompanyModel } from '@app/features/company/models';
import { CountryModel } from '@app/features/general';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'company-company-form',
  templateUrl: './company-form.component.html',
  inputs: ['entity', 'countries'],
  outputs: ['onSave', 'onGoBack']
})
export class CompanyFormComponent {
  entity!: CompanyModel;
  countries!: CountryModel[];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  onSave = new EventEmitter<CompanyModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Companies, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Companies, PermissionActionEnum.Update);
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
