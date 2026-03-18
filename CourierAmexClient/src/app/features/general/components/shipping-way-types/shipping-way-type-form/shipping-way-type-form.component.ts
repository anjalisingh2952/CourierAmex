import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ShippingWayTypeModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'shipping-way-type-form',
  templateUrl: './shipping-way-type-form.component.html',
  inputs: ['entity', 'pagination'],
  outputs: ['onSave', 'onGoBack']
})
export class ShippingWayTypeFormComponent {
  entity!: ShippingWayTypeModel;

  pagination!: PaginationModel;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;

  onSave = new EventEmitter<ShippingWayTypeModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.ShippingWayTypes, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.ShippingWayTypes, PermissionActionEnum.Update);
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
