import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';
import { CompanyModel, RoleModel } from '@app/features';

@Component({
  selector: 'settings-role-form',
  templateUrl: './role-form.component.html',
  inputs: ['role', 'companies', 'showCompanies'],
  outputs: ['onSave', 'onGoBack']
})
export class RoleFormComponent {
  role!: RoleModel;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  companies: CompanyModel[] = [];
  showCompanies: boolean = false;
  onSave = new EventEmitter<RoleModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Roles, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Roles, PermissionActionEnum.Update);
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      let perms = Object.keys(form.value.rolePermissions).map(perm => {
        return form.value.rolePermissions[perm];
      });
      form.value.rolePermissions = perms;
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
