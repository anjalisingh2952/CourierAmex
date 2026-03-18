import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { PackageService } from '@app/features/package/services';
import { CompanyModel } from '@app/features/company/models';
import { PackageModel } from '@app/features/package/models';
import { PackageStatusModel } from '@app/features/general';

@Component({
  selector: 'packages-package-list',
  templateUrl: './package-list.container.html'
})
export class PackageListContainer implements OnInit {
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

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
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
    trackingNumber: '',
    courierName: '',
    origin: '',
    packageStateName: '',
    action: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private packageService: PackageService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();

    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Delete);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.Number',
      'Packages.CustomerCode',
      'Packages.CustomerName',
      'Packages.TrackingNumber',
      'Packages.CourierName',
      'Packages.Origin',
      'Labels.Status',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.number = translations['Labels.Number'];
          this.translations.customerCode = translations['Packages.CustomerCode'];
          this.translations.customerName = translations['Packages.CustomerName'];
          this.translations.trackingNumber = translations['Packages.TrackingNumber'];
          this.translations.courierName = translations['Packages.CourierName'];
          this.translations.origin = translations['Packages.Origin'];
          this.translations.packageStateName = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'number', label: this.translations.number, sortable: true });
    this.columns.push({ field: 'customerCode', label: this.translations.customerCode, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'trackingNumber', label: this.translations.trackingNumber, sortable: true });
    this.columns.push({ field: 'courierName', label: this.translations.courierName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'packageStateName', label: this.translations.packageStateName, sortable: true });
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

  protected addNew(): void {
    this.router.navigate(['package', 'details']);
  }

  protected editEntity(entity: PackageModel): void {
    if (entity.id > 0) {
      this.router.navigate(['package', 'details'], { queryParams: { id: entity.number } });
    }
  }

  protected deleteEntity(entity: PackageModel): void {
    Swal.fire({
      title: this.messageService.getTranslate('Labels.DeleteTitle'),
      text: this.messageService.getTranslate('Labels.DeleteMessage'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.messageService.getTranslate('Labels.Confirm'),
      cancelButtonText: this.messageService.getTranslate('Labels.Cancel')
    })
      .then((response: SweetAlertResult) => {
        if (response.isConfirmed) {
          this.confirmDeletion(entity.id);
        }
      });
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

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.packageService.delete$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.onStateChange({
            searchTerm: this.state?.searchTerm || '',
            page: 1,
            pageSize: this.state?.pageSize || defaultPagination.ps,
            sortColumn: this.state?.sortColumn,
            sortDirection: this.state.sortDirection
          });
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire(this.messageService.getTranslate('Labels.DeleteEntry'), this.messageService.getTranslate('Labels.DeleteSuccessfully'), 'success');
          } else {
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    const statusId = this.selectedStatus !== undefined ? this.selectedStatus.id : 0;

    this.packageService.getPaged$(this.pagination, companyId, statusId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
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

  private loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);

    forkJoin({
      companies: this.commonService.getCompanies$(),
      packageStatus: this.commonService.getPackageStatus$()
    }).pipe(
        finalize(() => {
          this.loading.hide();
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
}
