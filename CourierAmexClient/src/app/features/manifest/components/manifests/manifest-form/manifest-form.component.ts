import { ElementRef, ChangeDetectorRef, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { GenericResponse, PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { Subject, takeUntil, finalize, BehaviorSubject, filter, } from 'rxjs';
import { ShippingWayTypeModel } from '@app/features/general';
import { ManifestModel, AddManifestPackageRequest } from '@app/models/manifest.model';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { PackageService } from '@app/features/package';
import { PackageItemDetail, PackageModel } from '@app/features/package/models';
import { TranslateService } from '@ngx-translate/core';
import { ManifestService } from '@app/features/manifest/services';

import { PrinterService } from '@app/@core/services/printer.service';
@Component({
  selector: 'manifest-form',
  templateUrl: './manifest-form.component.html',
  styleUrls: ['./manifest-form.component.scss'],
  inputs: ['entity', 'packagesList', 'companies', 'shippingWayTypes'],
  outputs: ['onSave', 'onCompanyChange', 'onUpdateShipType', 'onUpdateEntity', 'onGoBack'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManifestFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('form', { read: NgForm }) form!: NgForm;
  @ViewChild('dt') dataTable!: any;
  @ViewChild('tlprint', { static: false }) tlprint!: ElementRef<HTMLAnchorElement>;
  @ViewChild('tlprintFrame', { static: false }) tlprintFrame!: ElementRef<HTMLIFrameElement>;
  isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  pagination: PaginationModel = defaultPagination;

  entity!: ManifestModel;
  companies!: CompanyModel[];
  shippingWayTypes!: ShippingWayTypeModel[];
  packagesList!: PackageItemDetail[];
  isLoading: boolean = false;
  manifestId: any;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  //addManifestPackage!:AddManifestPackageRequest[];
  addManifestPackage: any = {};
  onSave = new EventEmitter<ManifestModel>();
  onCompanyChange = new EventEmitter<number | undefined>();
  onUpdateShipType = new EventEmitter<ManifestModel>();
  onUpdateEntity = new EventEmitter<ManifestModel>();
  onGoBack = new EventEmitter<void>();

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.key === "F12") || (event.key === "F2")) {
      this.handleSubmit(this.form);
    }
  }
  packageList: any[] = [];
  selectedPackageId: any[] = []; // Multiple selections
  selectedRow: number;
  selectedPackage: number = 0;
  searchValue: string = ""
  packageNumber: number | null = null;
  searchPackageNumber: any = ''
  username: string = this.credentailsService.credentials?.user.username || "";
  private destoy$ = new Subject<void>();
  columns: ColDef[] = [];
  rows: any[] = []
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    number: '',
    customerCode: '',
    customerName: '',
    origin: '',
    trackingNumber: '',
    description: '',
    weight: '',
    volumetricWeight: '',
    price: '',
    Kgs: '',
    Lbs: '',
    ClassifyMsg1: '',
    ClassifyMsg2: '',
    ClassifyMsg3: '',
    ClassifyMsg4: '',
    isEdit: false
  };
  private hasRun = false;
  loading: boolean = true;

  constructor(
    private translate: TranslateService,
    private loadingService: LoadingService,
    private credentailsService: CredentialsService,
    private toastrService: ToastrService,
    private messages: MessageService,
    private manifestService: ManifestService,
    private cd: ChangeDetectorRef,
    private printerService: PrinterService,
    private renderer: Renderer2

  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'Labels.Number',
      'PackageClassify.CustomerCode',
      'PackageClassify.CustomerName',
      'Labels.Origin',
      'Labels.TrackingNumber',
      'Labels.Description',
      'PackageClassify.Weight',
      'PackageClassify.VolumetricWeight',
      'Labels.Price',
      'Labels.Kgs',
      'Labels.Lbs',
      'Labels.ClassifyMsg1',
      'Labels.ClassifyMsg2',
      'Labels.ClassifyMsg3',
      'Labels.ClassifyMsg4',

    ])
      .subscribe(
        translations => {
          this.translations.number = translations['Labels.Number'];
          this.translations.customerCode = translations['PackageClassify.CustomerCode'];
          this.translations.customerName = translations['PackageClassify.CustomerName'];
          this.translations.origin = translations['Labels.Origin'];
          this.translations.trackingNumber = translations['Labels.TrackingNumber'];
          this.translations.description = translations['Labels.Description'];
          this.translations.weight = translations['PackageClassify.Weight'];
          this.translations.volumetricWeight = translations['PackageClassify.VolumetricWeight'];
          this.translations.price = translations['Labels.Price'];
          this.translations.Kgs = translations['Labels.Kgs'];
          this.translations.Lbs = translations['Labels.Lbs'];
          this.translations.ClassifyMsg1 = translations['Labels.ClassifyMsg1'];
          this.translations.ClassifyMsg2 = translations['Labels.ClassifyMsg2'];
          this.translations.ClassifyMsg3 = translations['Labels.ClassifyMsg3'];
          this.translations.ClassifyMsg4 = translations['Labels.ClassifyMsg4'];

        });
    this.loadingService.isLoading$
      .pipe(takeUntil(this.destoy$))
      .subscribe(val => this.isLoading = val);



  }

  ngOnInit(): void {
    console.log(this.entity, this.packagesList);
    this.setDefaultCompany();


  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewChecked", this.entity);
    this.form.valueChanges?.subscribe(values => {
      this.packageNumber = null;
    });
  }
  ngAfterViewChecked(): void {
    //this.getManifestPackage()
    setTimeout(() => {
      if (!this.hasRun && this.entity?.manifestNumber) {
        this.hasRun = true
        this.manifestId = this.entity.manifestNumber
        console.log("ngAfterViewInit", this.entity);
        this.getManifestPackage();
      }
    });
    if (this.form && this.entity.closed === 1) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].disable();
      });
    }
  }

  ngOnDestroy(): void {
    this.destoy$.next();
    this.destoy$.complete();
  }

  protected onStateChange(state: TableState) {
    this.state = { ...state };
    this.pagination = {
      ...this.pagination,
      c: state.searchTerm,
      pi: state.page,
      ps: state.pageSize,
      s: `${state.sortColumn} ${state.sortDirection}`
    };
    //this.getManifestPackage();
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

  updateShipType(form: NgForm): void {
    this.onUpdateShipType.emit(form.value);
  }

  updateEntity(form: NgForm): void {
    this.onUpdateEntity.emit(form.value);
  }

  companyChange(companyId: number | undefined): void {
    this.onCompanyChange.emit(companyId);
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser() && this.companies.length > 0) {
      const userCia = this.companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
      if (userCia) {
        this.companyChange(userCia.id);
      }
    }
  }

  getManifestPackage() {
    //console.log("getManifestPackage", this.entity,this.manifestId )
    this.loadingService.show();
    this.manifestService.getManifestPackage(this.manifestId).subscribe(res => {
      this.loading = false;
      this.loadingService.hide();
      this.packageList = res?.data ?? [];
      console.log("this.onManifestChange=========<<<", this.packageList);
      this.cd.detectChanges(); //  force UI update

    })
  }


  public OnPackageNumberChange(): void {

    console.log("packageNumber=>", this.packageNumber, this.entity);
    const hasTracking = !!this.entity.manifestNumber?.trim();
    const hasAddress = !!this.entity.address?.trim();
    const hasOpend = !!this.entity.closed;
    const selected = this.shippingWayTypes.find(c => c.id === this.entity.shippingWay);
    if (selected) {
      this.entity.shippingWayName = selected.name;
    }
    if (hasTracking) {
      if (hasAddress) {
        if (!hasOpend) {
          this.loadingService.show();
          this.addManifestPackage = {
            manifestId: this.entity.id!,
            manifestNumber: this.entity.manifestNumber || '',
            createdBy: this.username,
            type: String(this.entity.type),
            manifestStatusId: this.entity.status,
            trackingNumber: this.entity.manifestNumber || '',
            trackingAddress: this.entity.address || '',
            manifestShipmentType: this.entity.shipType ? 1 : 0,
            gateway: this.entity.shippingWayName || '',
            packageNumber: this.packageNumber
          };
          console.log("FE validation done", this.addManifestPackage)
          this.manifestService.AddManifestPackage(this.addManifestPackage).subscribe(res => {
            this.loadingService.hide();
            console.log("AddManifestPackage===Response======<<<", res);
            //response
            if (res.data?.response == 0) {
              this.getManifestPackage();
              Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');

            } else {
              Swal.fire(this.messages.getTranslate('Labels.Error'), res.data?.responseMessage, 'error');
            }

          })
        } else {
          this.toastrService.error(this.messages.getTranslate('ManifestDetails.isManiFestOpen'));
        }
      } else {
        this.toastrService.error(this.messages.getTranslate('ManifestDetails.AddressEmpty'));
      }
    } else {
      this.toastrService.error(this.messages.getTranslate('ManifestDetails.TrackingNumberEmpty'));

    }
  }
  scrollToPackage() {
    console.log("scrollToPackage", this.searchPackageNumber)
    const index = this.packageList.findIndex(p => p.packageNumber == this.searchPackageNumber);
    /* if (index >= 0 && this.dataTable?.scrollToVirtualIndex) {
       // Scroll to index if using virtual scroll
       console.log("scrollToVirtualIndex",index,this.dataTable?.scrollToVirtualIndex)
       this.dataTable.scrollToVirtualIndex(index);
     } else {*/
    setTimeout(() => {
      console.log("setTimeout", index)
      const row = document.querySelectorAll('tbody tr')[index] as HTMLElement;
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row?.classList.add('highlight-row');
      setTimeout(() => row?.classList.remove('highlight-row'), 12000);
    });
    /* }*/
  }

  protected deleteEntity(type: number): void {
    console.log("deleteEntity", this.selectedPackage, type, this.entity.manifestNumber)
    const hasOpend = !!this.entity.closed;
    let confirmationMsg = this.messages.getTranslate('ManifestDetails.DeleteAllPackages') + this.entity.manifestNumber;
    if (type == 1) {
      confirmationMsg = this.messages.getTranslate('ManifestDetails.DeletePackage') + this.selectedPackage;
    }
    if (!hasOpend) {
      if (this.selectedPackage <= 0 && type == 1) {
        this.toastrService.error("Kindly select a package before continuing.");
      } else if (type == 2 && this.entity.id <= 0) {
        this.toastrService.error("Manifest number can't be epmty");
      } else {
        Swal.fire({
          title: this.messages.getTranslate('Labels.DeleteTitle'),
          text: confirmationMsg,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: this.messages.getTranslate('Labels.Confirm'),
          cancelButtonText: this.messages.getTranslate('Labels.Cancel')
        })
          .then((response: SweetAlertResult) => {
            if (response.isConfirmed) {
              this.confirmDeletion(this.selectedPackage, type);
            }
          });
      }
    } else {
      this.toastrService.error(this.messages.getTranslate('ManifestDetails.isManiFestOpen'));
    }
  }

  private confirmDeletion(id: any, type: number): void {
    this.loadingService.show();
    /*
    "packageId": 1545563,
"manifestId": 2581061,
"initialStateId": 10,
"modifiedBy": "Admin",
"forceRemove": true
*/
    let manifestId = 0
    let packageId = 0
    if (type == 2) {
      manifestId = this.entity.id;
    } else {
      packageId = this.selectedPackage;
    }

    this.manifestService.unassignPackage({ packageId: packageId, manifestId: manifestId, initialStateId: 10, forceRemove: true, modifiedBy: this.username })
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadingService.hide();
            Swal.fire(this.messages.getTranslate('Labels.DeleteEntry'), this.messages.getTranslate('Labels.DeleteSuccessfully'), 'success');
            this.selectedPackage = 0;
            this.getManifestPackage();
          } else {
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
  onRowClick(row: any, i: number) {
    console.log(this.selectedPackageId);
    if (this.selectedPackageId.length <= 0) {
      this.selectedRow = i
      this.selectedPackage = row.packageNumber
      console.log('onRowClick row data:', this.selectedPackage, row, i);
    }
  }

  //getWebPrintJob(packageId:number, companyId: number,lableDimensions:string,docType:string)
  printFor4x3() {
    //debugger;

    if (!this.selectedPackage || this.selectedPackage === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Package Number is required.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.tlprint) {
      console.error('tlprint is undefined!');
      return;
    }

    const webPrintJobUrl = `https://localhost:5005/api/v1/Print/GenerateAmexThermalLabel?PackageNumber=${encodeURIComponent(this.selectedPackage)}`;
    console.log(webPrintJobUrl);

    if (this.isChrome) {
      this.tlprint.nativeElement.href = `tlprint:${webPrintJobUrl}`;

      const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      this.tlprint.nativeElement.dispatchEvent(event);
    } else {
      if (this.tlprintFrame) {
        this.renderer.setAttribute(this.tlprintFrame.nativeElement, 'src', `tlprint:${webPrintJobUrl}`);
      } else {
        console.error('tlprintFrame is undefined!');
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'EPSON Print job sent successfully.',
      confirmButtonText: 'OK'
    });
  }

  getWebPrintJob() {
    const packageId = this.selectedPackage;
    const companyId = 2;
    const labelDimensions = '4x3';
    const docType = 'General';

    const url = this.manifestService.getWebPrintJobUrl(packageId, companyId, labelDimensions, docType);
    const tlprintUrl = `tlprint:${url}`;

    console.log("Navigating to:", tlprintUrl);
    window.location.href = tlprintUrl;
  }
}