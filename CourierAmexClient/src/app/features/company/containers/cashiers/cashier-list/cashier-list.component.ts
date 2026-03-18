import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { CashierModel } from '@app/features/company/models/cashier.model';
import { PageOptionsDefault, PaginationModel, defaultPagination } from '@app/models/pagination.interface';
import { CountryModel } from '@app/features/general/models/country.model';
import { Router } from '@angular/router';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyService } from '@app/features/company/services';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { CompanyModel } from '@app/features/company/models';
import { ClientCashierService } from '@app/features/company/services/client-cashier.service';

@Component({
  selector: 'app-cashier-list',
  templateUrl: './cashier-list.component.html'
})
export class CashierListComponent implements OnInit, AfterViewInit {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCountry: CountryModel | undefined = undefined;
  selectedCompany: CompanyModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  private readonly _entities = new BehaviorSubject<CashierModel[]>([]);
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
    sortColumn: 'name',
    sortDirection: 'ASC',
  };

  translations = {
    name: '',
    companyName: '',
    printerName: '',
    ipAddress: '',
    portNumber: '',
    status: '',
    action: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private cashierService: ClientCashierService,
    private companyService: CompanyService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Delete);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.Name',
      'ClientCategories.CompanyName',
      'Labels.Status',
      'Labels.Actions',
      'ClientCashierDetails.PortNumber',
      'ClientCashierDetails.IPAddress',
      'Labels.PrinterName'])
      .subscribe(
        translations => {
          this.translations.name = translations['Labels.Name'];
          this.translations.companyName = translations['ClientCategories.CompanyName'];
          this.translations.status = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
          this.translations.portNumber = translations['ClientCashierDetails.PortNumber'];
          this.translations.ipAddress = translations['ClientCashierDetails.IPAddress'];
          this.translations.printerName = translations['Labels.PrinterName'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    if (this.showCompanies) {
      this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    }
    this.columns.push({ field: 'name', label: this.translations.name, sortable: true });
    this.columns.push({ field: 'printerName', label: this.translations.printerName });
    this.columns.push({ field: 'ipAddress', label: this.translations.ipAddress, sortable: true });
    this.columns.push({ field: 'portNumber', label: this.translations.portNumber });
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

  protected addNew(): void {
    this.router.navigate(['company', 'cashier-details']);
  }

  protected editEntity(entity: CashierModel): void {
    if (entity.id > 0) {
      this.router.navigate(['company', 'cashier-details'], { queryParams: { id: entity.id } });
    }
  }

  protected deleteEntity(entity: CashierModel): void {
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

  protected selectEntity(entity: CompanyModel | undefined): void {
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

    this.cashierService.delete$(id)
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
        next: (res: any) => {
          if (res?.success) {
            Swal.fire(this.messageService.getTranslate('Labels.DeleteEntry'), this.messageService.getTranslate('Labels.DeleteSuccessfully'), 'success');
          } else {
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error: any) => {
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

    this.cashierService.getPaged$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res: any) => {
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error: any) => {
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

    this.companyService.getActive$()
      .pipe(
        filter((res) => !!res && !!res.success && !!res.data && res.data.length > 0),
        finalize(() => {
          this.setDefaultCompany();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res.data ?? []);
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
          this.selectEntity(userCia);
          return;
        }
      }
    }
    this.performSearch();
  }
}
