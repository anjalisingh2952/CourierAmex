import { Component, EventEmitter, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CredentialsService } from '@app/@core';
import { ModuleModel, TemplateModel } from '@app/features';
import { CompanyModel, CurrencyModel, DocumentPayTypeModel, BankModel, BrandModel, PaymentTypeModel } from '@app/features/company';

import { PermissionActionEnum, PermissionsEnum } from '@app/models';

@Component({
  selector: 'document-pay-type-form',
  templateUrl: './document-pay-type-form.component.html',
  inputs: ['companies', 'currencies', 'banks', 'brands', 'paymentTypes', 'modules', 'templates'],
  outputs: ['onSave', 'onGoBack', 'onCompanyChange', 'onPaymentTypeChange', 'onModuleChange']
})
export class DocumentPayTypeFormComponent {
  document!: DocumentPayTypeModel;
  companies: CompanyModel[] = [];
  currencies: CurrencyModel[] = [];
  banks: BankModel[] = [];
  brands: BrandModel[] = [];
  paymentTypes: PaymentTypeModel[] = [];
  modules: ModuleModel[] = [];
  templates: TemplateModel[] = [];

  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  showBanks: boolean = false;
  showAccounting: boolean = false;
  disabledFields: boolean = true;

  onSave = new EventEmitter<DocumentPayTypeModel>();
  onCompanyChange = new EventEmitter<number>();
  onGoBack = new EventEmitter<void>();
  onPaymentTypeChange = new EventEmitter<number>();
  onModuleChange = new EventEmitter<string>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Update);
  }

  @Input() set entity(input: DocumentPayTypeModel) {
    this.document = input;
    this.showHideAccounting(input.companyId || 0);
    this.showHideBanks(input.payTypeId || 0);

    if (input.id == 0)
      this.disabledFields = false;
    else
      this.disabledFields = true;

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

  showHideAccounting(companyId: number): void {
    if (companyId == 2)
      this.showAccounting = true;
    else
      this.showAccounting = false;
  }

  companyChange(companyId: number): void {
    this.onCompanyChange.emit(companyId);
    this.showHideAccounting(companyId);
    this.showHideBanks(0);
  }

  showHideBanks(paymentTypeId: number): void {
    if (paymentTypeId == 3 || paymentTypeId == 14) // Tarjeta y Web Site de CR
      this.showBanks = true;
    else
      this.showBanks = false;
  }

  paymentTypeChange(paymentTypeId: number): void {
    this.onPaymentTypeChange.emit(paymentTypeId);
    this.showHideBanks(paymentTypeId);
  }

  moduleChange(moduleId: string): void {
    this.onModuleChange.emit(moduleId);
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onSave.emit(Object.assign(this.document,form.value));
    } else {
      form.form.markAllAsTouched();
    }
  }

}
