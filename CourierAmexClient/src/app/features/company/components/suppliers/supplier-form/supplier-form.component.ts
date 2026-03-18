import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CompanyModel, LocationModel, SupplierModel } from '@app/features/company/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'supplier-form',
  templateUrl: './supplier-form.component.html',
  inputs: ['entity', 'companies', 'locations'],
  outputs: ['onSave', 'onCompanyChange', 'onGoBack']
})
export class SupplierFormComponent {
  entity!: SupplierModel;
  companies!: CompanyModel[];
  locations!: LocationModel[];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  onSave = new EventEmitter<SupplierModel>();
  onCompanyChange = new EventEmitter<number | undefined>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Suppliers, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Suppliers, PermissionActionEnum.Update);
  }

  ngOnInit(): void {
    const ciaId = this.credentailsService.credentials?.user.companyId ?? 0;
    if (!this.showCompanies && ciaId > 0) {
      this.companyChange(ciaId);
    }
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  companyChange(companyId: number | undefined): void {
    this.onCompanyChange.emit(companyId);
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      let entity = form.value;
      if (entity.locations) {
        let locations = Object.keys(entity.locations)
          .map(idx => {
            return { id: entity.locations[idx].id, name: entity.locations[idx].name, companyId: entity.locations[idx].companyId, countryId: entity.locations[idx].countryId, isSelected: entity.locations[idx].isSelected }
          });

        entity.locations = locations.filter(x => x.isSelected);
      }

      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
