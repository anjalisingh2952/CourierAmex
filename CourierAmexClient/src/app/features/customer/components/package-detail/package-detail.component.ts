import { AfterViewChecked, ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subject, takeUntil, BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { GenericAction, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CommodityModel, CompanyModel, ProductModel } from '@app/features/company';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { PackageModel, PackageNotesModel } from '@app/features/package/models';
import { SearchCustomerComponent } from '@app/@shared';
import { CustomerModel } from '@app/features/customer';
import { PackageNoteComponent } from '@app/@shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { ManifestService } from '../../../manifest/services/manifest.service';

import { CustomerService } from '@app/features/customer/services';

@Component({
  selector: 'app-package-detail',
  templateUrl: './package-detail.component.html',
  styleUrl: './package-detail.component.scss',
  inputs: ['entity', 'companies', 'commodities', 'additionalInfo', 'isLocked'],
  outputs: ['onSave', 'onCompanyChange', 'onCommodityChange', 'onCustomerChange', 'onTrackingNumberChange', 'onWeightChange', 'onWidthChange', 'onHeightChange', 'onLongChange', 'onGoBack'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageDetailComponent implements OnInit, AfterViewChecked {
  noteData: PackageNotesModel;
  customerCode: string = '';
  courierNumber: string = '';
  selectedCompany: number;
  entity!: any;
  isLocked: boolean;
  companies!: CompanyModel[];
  commodities!: CommodityModel[];
  additionalInfo?: {
    countryName: string,
    weightUnit: number,
    isCommodityRequired: boolean
  };

  isLoading: boolean = false;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  customerSearch = {
    isValid: false,
    isInvalid: false,
    touched: false
  };

  private readonly _entities = new BehaviorSubject<PackageNotesModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  constructor(
    private loadingService: LoadingService,
    private credentailsService: CredentialsService,
    private messageService: MessageService,
    private modalService: NgbModal,
   // private manifestService: ManifestService,
    private customerService: CustomerService,


  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();

  }

  ngOnInit(): void {
    this.setDefaultCompany();
    console.log("ngOnInit", this.entity);
  }

  ngAfterViewChecked(): void {
  }
  setDefaultCompany() {
    this.companies$.subscribe(companies => {
      console.log("setDefaultCompany", this.credentailsService.credentials, companies.length);

      if (this.credentailsService.isGatewayUser()) {
        const userCia = this.credentailsService.credentials?.user.companyId;
        console.log("userCia", userCia);
        if (userCia) {
          this.selectedCompany = userCia;
        }
      }
    });
  }
  getCommodityDescription(data: CommodityModel): string {
    const code = data.code.length > 0 ? `${data.code} - ` : '';
    return `${code}${data.description}`;
  }
  //callParentClick(entity:any) {
  callParentClick(entity: PackageNotesModel): void {
    entity.id = 234342;
    entity.codigo = this.entity.customerCode;
    entity.compannia = this.entity.customerName;
    entity.courier = this.entity.trackingNumber;
    console.log("callParentClick", entity);
    this.openPackageNotesModal(entity, 'Editing');
  }

  openPackageNotesModal(noteData?: PackageNotesModel, openMode?: string) {
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;
    if (companyId == 0) {
      Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.CompanyNotSelectedError'), 'error');
      return;
    }
    let nombreCliente = '';
    console.log("this._entities", this._entities);

    if (this._entities.value.length == 1 && (this.entity.customerCode || this.courierNumber)) {
      const entity = this._entities.value[0];
      nombreCliente = entity.compannia ? entity.compannia : entity.nombreCompleto;
    }
    const modalRef = this.modalService.open(PackageNoteComponent, { size: 'xl' });
    modalRef.componentInstance.noteData = noteData ? { ...noteData } : { ...this.noteData }; // Envía datos si es necesario
    modalRef.componentInstance.openMode = 'Editing';
    modalRef.componentInstance.customerCode = this.entity.customerCode ? this.entity.customerCode : '';
    modalRef.componentInstance.courierNumber = this.courierNumber ? this.courierNumber : '';
    modalRef.componentInstance.nombreCliente = nombreCliente;
    modalRef.componentInstance.companyId = companyId;

    // modalRef.componentInstance.save.subscribe((data: PackageNotesModel) => {
    //   // Lógica para manejar los datos guardados
    //   // if(data.message.length > 0){
    //   //   this.save(data);
    //   // } 

    // });

    // modalRef.componentInstance.cancel.subscribe(() => {
    //   // Lógica para manejar la cancelación, si es necesario
    // });
  }
  getWebPrintJob(packageNumber: number) {
    const packageId = packageNumber
    const companyId = this.selectedCompany;
    const labelDimensions = '4x3';
    const docType = 'General';

    const url = this.customerService.getWebPrintJobUrl(packageId, companyId, labelDimensions, docType);
    const tlprintUrl = `tlprint:${url}`;

    console.log("Navigating to:", tlprintUrl);
    window.location.href = tlprintUrl;
  }

}
