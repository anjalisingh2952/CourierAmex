import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { PackageLogNotesService } from '@app/features/package/services/package-lognotes.service';
import { PackageLogNotesModel } from '@app/features/package/models/package-lognotes.model';

@Component({
  selector: 'app-packagelognotes-list',
  templateUrl: './package-lognotes-list.component.html'
})
export class PackageLogNotesComponent implements OnInit, AfterViewInit { 
  customerCode: string = '';
  packageNumber: number;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'createdAt',
    sortDirection: 'DESC',
  };

  translations = {
    companyName: '',
    Number: '',
    Codigo: '',
    CustomerName: '',
    Message: '',
    LogType: '',
    createdAt: '',
    Courier:'',
    user: ''
  };

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<PackageLogNotesModel[]>([]);
  entities$ = this._entities.asObservable();

  constructor(
    private router: Router,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private packageLogNotesService: PackageLogNotesService,
  ) {
    //this.showCompanies = !this.credentailsService.isGatewayUser();
    //this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Commodities, PermissionActionEnum.Add);
    //this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Commodities, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.CompanyName',
      'PackageLogNotes.Number',
      'PackageLogNotes.Courier',
      'PackageLogNotes.Codigo',
      'PackageLogNotes.CustomerName',
      'PackageLogNotes.Courier',
      'PackageLogNotes.Message',
      'PackageLogNotes.User',
      'PackageLogNotes.LogType',
      'PackageLogNotes.CreatedAt',
      'Sidebar.User'])
      .subscribe(
        translations => {
          //this.translations.companyName = translations['Labels.CompanyName'];
          this.translations.Number = translations['PackageLogNotes.Number'];  
          this.translations.Courier = translations['PackageLogNotes.Courier']; 
          this.translations.Codigo = translations['PackageLogNotes.Codigo']; 
          this.translations.CustomerName = translations['PackageLogNotes.CustomerName']; 
          this.translations.Message = translations['PackageLogNotes.Message'];
          this.translations.LogType = translations['PackageLogNotes.LogType'];
          this.translations.createdAt = translations['PackageLogNotes.CreatedAt'];
          this.translations.user = translations['Sidebar.User'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    if (this.showCompanies) {
      this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    }
    this.columns.push({ field: 'logType', label: this.translations.LogType, sortable: true });
    this.columns.push({ field: 'createdAt', label: this.translations.createdAt, sortable: true, type: 'date' });
    this.columns.push({ field: 'user', label: this.translations.user, sortable: true });
    this.columns.push({ field: 'number', label: this.translations.Number, sortable: true });
    this.columns.push({ field: 'codigo', label: this.translations.Codigo, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.CustomerName, sortable: true });
    this.columns.push({ field: 'courier', label: this.translations.Courier, sortable: false });
    this.columns.push({ field: 'message', label: this.translations.Message, sortable: false });
    this.changeDetectorRef.detectChanges();
  }

  onCustomerCodeChange(newCodigo: string) {
    /* this.customerCode = newCodigo;
    this.onStateChange(this.state);  */
  }

  onPackageNumberChange(newPackageNumber: string) {
    /* this.packageNumber = newPackageNumber;
    this.onStateChange(this.state);  */
  }

  onSearch(): void {
    this.onStateChange(this.state); 
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

  private performSearch(): void { 
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;

    this.packageLogNotesService.getPaged$(this.pagination, companyId, this.customerCode, this.packageNumber)
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
          this.setDefaultCompany();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res ?? []);
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
