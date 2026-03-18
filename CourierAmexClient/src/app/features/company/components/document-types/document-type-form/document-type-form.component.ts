import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CompanyModel, DocumentTypeModel } from '@app/features/company';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'document-type-form',
  templateUrl: './document-type-form.component.html',
  inputs: ['entity', 'companies'],
  outputs: ['onSave', 'onGoBack', 'onCompanyChange']
})
export class DocumentTypeFormComponent implements OnInit {
  entity!: DocumentTypeModel;
  companies: CompanyModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  onSave = new EventEmitter<DocumentTypeModel>();
  onCompanyChange = new EventEmitter<number>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Update);
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
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
