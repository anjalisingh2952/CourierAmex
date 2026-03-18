import { inject, AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { of ,Observable, map, BehaviorSubject, filter, finalize, forkJoin } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CustomerService } from '@app/features/customer/services';
import { CustomerModel } from '@app/features/customer/models';
import { TranslateService } from '@ngx-translate/core';
import { CompanyModel,ProductModel } from '@app/features/company';

import { PackageService } from '@app/features/package/services';
import { PackageModel, newPackageModel } from '@app/features/package/models';
import { PackageStatusModel,CountryModel } from '@app/features/general';
import { PackageNotesService } from '@app/features/package/services/package-notes.service';
import { PackageNotesModel, newPackageNotes } from '@app/features/package/models/package-notes.model';
//import { WEIGHT_LBS, getCourierByTracking } from '@app/@shared';
//import { PackageNoteComponent } from '@app/@shared';
@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.component.html',
  styleUrl: './customer-service.component.scss'
})
export class CustomerServiceComponent {
  selectedCompany: CompanyModel | undefined = undefined;
  showsCompanies: boolean = false;
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  pagination: PaginationModel = defaultPagination;
  selectedStatus: PackageStatusModel | undefined = undefined;

  private readonly _entities = new BehaviorSubject<CustomerModel[]>([]);
  entities$ = this._entities.asObservable();
  private readonly _packageStatus = new BehaviorSubject<PackageStatusModel[]>([]);
  packageStatus$ = this._packageStatus.asObservable();

  private readonly _entitiesPack = new BehaviorSubject<PackageModel[]>([]);
  entitiesPack$ = this._entitiesPack.asObservable();
  readonly packdetailentity$: Observable<PackageModel>;


  private readonly _noteentities = new BehaviorSubject<PackageNotesModel[]>([]);
  noteEntities$ = this._noteentities.asObservable();

  collapsCustomer: boolean = true;
  closeCustomer: boolean = true;
  resetCustomer: boolean = false;
  expandCustomer: boolean = false;

  collapsPackage: boolean = true;
  closePackage: boolean = true;
  expandPackage: boolean = false;
  expandPackageDetail: boolean = false
  collapsPackageDetail: boolean = true;
  searchPackage: string = ''
  customerSearch: string = ''
  selectedPackageId: string = ''
  loading: boolean = true;
  customer: any[] = [];
  selectedRow: number
  selectedPackage: any
  packageDetails: any = "";
  totalRows:number=0;
  customerCode: string = '';
  courierNumber: string = '';

  columns: ColDef[] = [];

  packcolumns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'fullName',
    sortDirection: 'ASC',
    selectable: true,
  };
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private customerService: CustomerService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private packageService: PackageService,
    private packageNotesService: PackageNotesService,
    private modalService: NgbModal

  ) {

    this.showsCompanies = !this.credentailsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
  }
  ngOnInit(): void {
    this.loadAttributes();
    this.packloadAttributes();
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  protected selectCompany(entity: CompanyModel | undefined): void {
    this.selectedCompany = entity;
  }
  protected selectStatus(entity: PackageStatusModel | undefined): void {
    this.selectedStatus = entity;
  }

  resetCustmer() {
    this.customerSearch = "";
  }
  resetPackage() {
    this.searchPackage = "";
    this.packageDetails = ""
  }
  performSearch(): void {
    this.loadingService.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.c = this.customerSearch;
    this.pagination.pi = 1;
    this.pagination.ps = 5000;
    this.pagination.s = 'fullName ASC';
    this._entities.next([]);
   console.log("this.pagination", this.pagination)
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    console.log("companyId", companyId)
    this.customerService.getPagedByCompany$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.loading = false;

          //this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.customer = res?.data;
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;

        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
  private loadAttributes(): void {
    this.loadingService.show();
    this._companies.next([]);

    this.commonService.getCompanies$()
      .pipe(
        filter((res) => res && res.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.loading = false;

          this.setDefaultCompany();
        })
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res ?? []);
          this.selectCompany(res[0]);
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      const cias = this._companies.value;
      if (cias && cias.length > 0) {
        const userCia = cias.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectCompany(userCia);
          return;
        }
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  }

  packperformSearch(): void {
    this.totalRows=0;
    this.loadingService.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.c = this.searchPackage;
    this.pagination.pi = 1;
    this.pagination.ps = 5000;
    this.pagination.s = 'date DESC';
    this._entitiesPack.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    const statusId = this.selectedStatus !== undefined ? this.selectedStatus.id : 0;

    this.packageService.getPaged$(this.pagination, companyId, statusId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.loading = false;
          this.packageDetails = ''
          this.selectedRow = 0;
          //this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entitiesPack.next(res?.data);
          this.pagination.ti = res?.totalRows;
          this.totalRows=res?.totalRows;

        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
  private packloadAttributes(): void {
    this.loadingService.show();
    this._companies.next([]);

    forkJoin({
      companies: this.commonService.getCompanies$(),
      packageStatus: this.commonService.getPackageStatus$()
    }).pipe(
      finalize(() => {
        this.loadingService.hide();
        this.setDefaultCompany();
      })
    )
      .subscribe({
        next: (res) => {
          if (res.companies && res.companies.length > 0) {
            this._companies.next(res.companies ?? []);
            this.selectCompany(res.companies[0]);
          }
          if (res.packageStatus && res.packageStatus.length > 0) {
            this._packageStatus.next(res.packageStatus);
            this.selectStatus(res.packageStatus[0]);
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
  onRowClick(row: any, i: number) {
    console.log(this.selectedPackageId);
    if (this.selectedPackageId.length <= 0) {
      this.selectedRow = i
      this.selectedPackage = row.id
      this.getPackageDetails(this.selectedPackage);
      console.log('onRowClick row data:', this.selectedPackage, row, i);
    }
  }
  onCustomerRowClick(row: any, i: number) {
    console.log(this.selectedPackageId);
    if (this.selectedPackageId.length <= 0) {
      this.selectedRow = i
      this.searchPackage = row.code
      //this.getPackageDetails(this.selectedPackage);
      this.packperformSearch();
      console.log('onRowClick row data:', this.selectedPackage, row, i);
    }
  }
  getPackageDetails(packageId: number) {
    console.log("getPackageDetails", packageId)
    this.loadingService.show();//getPackages
    //this.packageService.getById$(packageId)
    this.customerService.getPackages$(packageId)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadingService.hide();
            this.packageDetails = res?.data;
            console.log("this.packageDetails", this.packageDetails)
          } else {

          }
        },
        error: (error) => {
          console.error(error);
          this.loadingService.hide();

        }
      });
  }

}