import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CompanyModel, LocationModel } from '@app/features/company/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';
import { CountryModel } from '@app/features/general';

@Component({
  selector: 'location-form',
  templateUrl: './location-form.component.html',
  inputs: ['entity', 'companies', 'countries'],
  outputs: ['onSave', 'onCompanyChange', 'onGoBack']
})
export class LocationFormComponent implements OnInit {
  entity!: LocationModel;
  companies: CompanyModel[] = [];
  countries: CountryModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  onSave = new EventEmitter<LocationModel>();
  onCompanyChange = new EventEmitter<number | undefined>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Locations, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Locations, PermissionActionEnum.Update);
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
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
