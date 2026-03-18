import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CompanyModel } from '@app/features/company';
import { CustomerService } from '@app/features/customer';
import { PackageStatusModel } from '@app/features/general';
import { PackageModel, PackageService } from '@app/features/package';
import { defaultPagination, PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, finalize, forkJoin, take } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { InvoiceService } from '../../services';

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html'
})
export class InvoiceHistoryComponent {

  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;
  selectedStatus: PackageStatusModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _packageStatus = new BehaviorSubject<PackageStatusModel[]>([]);
  packageStatus$ = this._packageStatus.asObservable();

  private readonly _entities = new BehaviorSubject<PackageModel[]>([]);
  entities$ = this._entities.asObservable();
  showCompanies: boolean = false;
  selectedCustomer: any[] = [];
  columns: ColDef[] = [];
  rows: any[] = [];
  InvoiceCraditsDetail: any;
  balanceLocal: any;
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    companyName: '',
    code: '',
    fullName: '',
    action: ''
  };

  constructor(
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private customerService: CustomerService,
    private invoiceService: InvoiceService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;

    this.translate.get([
      'InvoiceHistory.CustomerCode',
      'InvoiceHistory.CustomerName',
      'InvoiceHistory.Company',
      'Labels.Actions'
    ]).subscribe(translations => {
      this.translations.code = translations['InvoiceHistory.CustomerCode'];
      this.translations.fullName = translations['InvoiceHistory.CustomerName'];
      this.translations.companyName = translations['InvoiceHistory.Company'];
      this.translations.action = translations['Labels.Actions'];
    });

    this.loadAttributes();

    if (this.credentailsService.isGatewayUser()) {
      setTimeout(() => {
        this.setDefaultCompany();
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.changeDetectorRef.detectChanges();
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
    this.performSearch();
  }

  protected selectCompany(entity: CompanyModel | undefined): void {

    this.selectedCompany = entity;

    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  protected selectStatus(entity: PackageStatusModel | undefined): void {
    this.selectedStatus = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;

    var companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;

    if(this.credentailsService.isGatewayUser()){
      companyId = this.credentailsService.credentials?.user.companyId??0;
    }
    this.customerService.getPagedByCompany$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.updatePagination();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res: any) => {

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
    this.loading.show();
    this._companies.next([]);

    forkJoin({
      companies: this.commonService.getCompanies$(),
      packageStatus: this.commonService.getPackageStatus$()
    })
      .subscribe({
        next: (res) => {
          if (res.companies && res.companies.length > 0) {
            this._companies.next(res.companies ?? []);
            this.selectCompany(res.companies[0]);
            this.changeDetectorRef.detectChanges();
            this._companies.pipe(take(1)).subscribe(() => {
              this.setDefaultCompany();
            });
          }
          if (res.packageStatus && res.packageStatus.length > 0) {
            this._packageStatus.next(res.packageStatus);
            this.selectStatus(res.packageStatus[0]);
          }

          this.loading.hide();
        },
        error: (error) => {
          console.error(error);
          this.loading.hide();
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
          this.changeDetectorRef.detectChanges();
          return;
        }
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  }

  viewDetail(param: any) {
    debugger
    param.companyId = this.selectedCompany?.id;
    this.selectedCustomer = param;
    this.invoiceService.InvoicesPendingByCustomer(param.code).subscribe({
      next: (response) => {
        this.InvoiceCraditsDetail = response.data;
        this.balanceLocal = 0; 
        response.data.forEach((element: any) => {
          this.balanceLocal += element.localBalance;
        });
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
      },
      complete: () => {
        console.log('Request completed successfully');
      }
    });
  }

  private updatePagination(): void {
    const entities = this._entities.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }
}