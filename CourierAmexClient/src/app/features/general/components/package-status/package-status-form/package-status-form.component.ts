import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { PackageStatusModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'company-package-status-form',
  templateUrl: './package-status-form.component.html',
  inputs: ['entity', 'pagination'],
  outputs: ['onSave', 'onGoBack']
})
export class PackageStatusFormComponent {
  entity!: PackageStatusModel;

  pagination!: PaginationModel;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;

  onSave = new EventEmitter<PackageStatusModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackageStatus, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackageStatus, PermissionActionEnum.Update);
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
