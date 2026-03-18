import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { ClientCategoryModel, CompanyModel, CustomerPayTypeModel, DocumentTypeModel, LocationModel, SupplierModel } from '@app/features/company';
import { AreaModel, CountryModel, StateModel, ZoneModel } from '@app/features/general';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService, MessageService } from '@app/@core';
import { CustomerModel } from '@app/features/customer/models';
import { EMAIL_REGEX } from '@app/@shared';

@Component({
  selector: 'customer-form',
  templateUrl: './customer-form.component.html',
  inputs: ['entity', 'companies', 'countries', 'states', 'zones', 'areas', 'suppliers', 'locations', 'documentTypes', 'customerPayTypes', 'customerCategories'],
  outputs: ['onSave', 'onCompanyChange', 'onLoadZones', 'onLoadAreas', 'onLoadLocations', 'onUpdateCustomer', 'onGoBack']
})
export class CustomerFormComponent implements OnInit {
  EMAIL_REGEX = EMAIL_REGEX;
  entity!: CustomerModel;

  companies!: CompanyModel[];
  countries!: CountryModel[];
  states!: StateModel[];
  zones!: ZoneModel[];
  areas!: AreaModel[];
  suppliers!: SupplierModel[];
  locations!: LocationModel[];
  documentTypes!: DocumentTypeModel[];
  customerPayTypes!: CustomerPayTypeModel[];
  customerCategories!: ClientCategoryModel[];
  documentMask: string = '';

  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;

  onSave = new EventEmitter<CustomerModel>();
  onCompanyChange = new EventEmitter<{ id: number, countryId: number }>();
  onLoadZones = new EventEmitter<number | undefined>();
  onLoadAreas = new EventEmitter<number | undefined>();
  onLoadLocations = new EventEmitter<number | undefined>();
  onUpdateCustomer = new EventEmitter<CustomerModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private credentailsService: CredentialsService,
    private toastrService: ToastrService,
    private messages: MessageService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Customers, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Customers, PermissionActionEnum.Update);
  }

  ngOnInit(): void {
    this.setDefaultCompany();
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  handleSubmit(form: NgForm): void {
    if (form.valid && this.validate(form)) {
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }

  validate(form: NgForm): boolean {
    const customer = form.value as CustomerModel;
    let errors = '';
    let isValid = true;

    if (!customer.shipByAir && !customer.shipBySea) {
      errors += errors.length > 0 ? "<br/>" : "";
      errors += this.messages.getTranslate('CustomerDetails.SelectShipType')
      isValid = false;
    }

    if (errors.length > 0) {
      this.toastrService.warning(errors);
    }

    return isValid;
  }

  companyChange(companyId: number | undefined): void {
    const company = this.companies.find(x => x.id === companyId);
    if (company) {
      this.onCompanyChange.emit({ id: companyId ?? -1, countryId: company.countryId ?? -1 });
    } else {
      this.onCompanyChange.emit({ id: companyId ?? -1, countryId: -1 });
    }
  }

  loadZones(stateId: number | undefined): void {
    this.onLoadZones.emit(stateId);
  }

  loadAreas(zoneId: number | undefined): void {
    this.onLoadAreas.emit(zoneId);
  }

  loadLocations(supplierId: number | undefined): void {
    this.onLoadLocations.emit(supplierId);
  }

  updateLocation(locationId: number | undefined, form: NgForm): void {
    let entity = form.value;
    entity.locationId = locationId;
    this.onUpdateCustomer.emit(entity);
  }

  updateDocumentType(docTypeId: number | undefined, form: NgForm): void {
    let entity = form.value;
    entity.documentTypeId = docTypeId;
    this.onUpdateCustomer.emit(entity);
    this.setMask(entity.documentTypeId);
  }

  updateCustomer(form: NgForm): void {
    let entity = form.value;
    this.onUpdateCustomer.emit(entity);
  }

  selectSupplier(e: any): void {
    this.onLoadLocations.emit(+e.target.value);
  }

  setMask(id: number): void {
    const docType = this.documentTypes.find(x => x.id === id);
    if (docType) {
      this.documentMask = docType.mask ?? '';
    }
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser() && this.companies.length > 0) {
      const userCia = this.companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
      if (userCia) {
        this.companyChange(userCia.id);
      }
    }
  }
}
