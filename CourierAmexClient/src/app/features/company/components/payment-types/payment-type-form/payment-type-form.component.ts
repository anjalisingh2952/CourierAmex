import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CompanyModel, PaymentTypeModel } from '@app/features/company';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'payment-type-form', 
  templateUrl: './payment-type-form.component.html',
  inputs: ['entity', 'companies'],
  outputs: ['onSave', 'onGoBack', 'onCompanyChange'] 
})
export class PaymentTypeFormComponent implements OnInit { 
    entity!: PaymentTypeModel;
    companies: CompanyModel[] = [];
    hasAdd: boolean = false;
    hasUpdate: boolean = false;
    showCompanies: boolean = false;
    onSave = new EventEmitter<PaymentTypeModel>();
    onCompanyChange = new EventEmitter<number>();
    onGoBack = new EventEmitter<void>();

    constructor(private credentialsService: CredentialsService

    ){
        this.showCompanies = !this.credentialsService.isGatewayUser();
        this.hasAdd = this.credentialsService.hasPermission(PermissionsEnum.PaymentTypes, PermissionActionEnum.Add);
        this.hasUpdate = this.credentialsService.hasPermission(PermissionsEnum.PaymentTypes, PermissionActionEnum.Update);
    }

    ngOnInit(): void {
        const ciaId = this.credentialsService.credentials?.user.companyId ?? 0;
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
          this.onSave.emit(form.value);
        } else {
          form.form.markAllAsTouched();
        }
      }  
}