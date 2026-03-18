import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CommodityModel, CompanyModel } from '@app/features/company/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'commodity-form',
  templateUrl: './commodity-form.component.html',
  inputs: ['entity', 'companies'],
  outputs: ['onSave', 'onCompanyChange', 'onGoBack']
})
export class CommodityFormComponent implements OnInit {
  entity!: CommodityModel;
  companies: CompanyModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  onSave = new EventEmitter<CommodityModel>();
  onCompanyChange = new EventEmitter<number>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Commodities, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Commodities, PermissionActionEnum.Update);
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

  companyChange(companyId: number): void {
    this.onCompanyChange.emit(companyId);
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      const data = form.value;
      if (this.entity.id > 0) {
        data.code = this.entity.code;
      }
      this.onSave.emit(data);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
