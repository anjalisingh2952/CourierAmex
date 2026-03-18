import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CustomerService } from '@app/features/customer/services';
import { CustomerModel } from '@app/features/customer/models';
import { TranslateService } from '@ngx-translate/core';
import { CompanyModel } from '@app/features/company';

@Component({
  selector: 'customer-list',
  templateUrl: './customer-list.container.html'
})
export class CustomerListContainer implements OnInit, AfterViewInit {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("shippingTemplate") shippingTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;
  showsCompanies: boolean = false;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<CustomerModel[]>([]);
  entities$ = this._entities.asObservable();

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'fullName',
    sortDirection: 'ASC',
  };

  translations = {
    documentId: '',
    code: '',
    fullName: '',
    email: '',
    billableEmail: '',
    address: '',
    companyName: '',
    shipType: '',
    status: '',
    action: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private customerService: CustomerService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
  ) {
    this.showsCompanies = !this.credentailsService.isGatewayUser();

    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Customers, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Customers, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;

    this.translate.get(['Customers.DocumentId',
      'Customers.Code',
      'Customers.FullName',
      'Customers.Email',
      'Customers.BillableEmail',
      'Customers.Address',
      'Customers.CompanyName',
      'Customers.ShipType',
      'Labels.Status',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.documentId = translations['Customers.DocumentId'];
          this.translations.code = translations['Customers.Code'];
          this.translations.fullName = translations['Customers.FullName'];
          this.translations.email = translations['Customers.Email'];
          this.translations.billableEmail = translations['Customers.BillableEmail'];
          this.translations.address = translations['Customers.Address'];
          this.translations.companyName = translations['Customers.CompanyName'];
          this.translations.shipType = translations['Customers.ShipType'];
          this.translations.status = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'documentId', label: this.translations.documentId, sortable: true });
    this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'email', label: this.translations.email, sortable: true });
    this.columns.push({ field: 'billableEmail', label: this.translations.billableEmail, sortable: true });
    this.columns.push({ field: 'address', label: this.translations.address, sortable: true });
    this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    this.columns.push({ field: 'shipType', label: this.translations.shipType, sortable: false, contentTemplate: this.shippingTemplate });
    this.columns.push({ field: 'status', label: this.translations.status, sortable: true, contentTemplate: this.statusTemplate });
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

  addNew(): void {
    this.router.navigate(['customer', 'details']);
  }

  editItem(entity: CustomerModel): void {
    if (entity.id > 0) {
      this.router.navigate(['customer', 'details'], { queryParams: { id: entity.id } });
    }
  }

  deleteItem(entity: CustomerModel): void {
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

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.customerService.delete$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.pagination = {
            ...this.pagination,
            pi: 1
          }
          this.performSearch();
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

    this.customerService.getPagedByCompany$(this.pagination, companyId)
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

    this.commonService.getCompanies$()
      .pipe(
        filter((res) => res && res.length > 0),
        finalize(() => {
          this.loading.hide();
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
}
