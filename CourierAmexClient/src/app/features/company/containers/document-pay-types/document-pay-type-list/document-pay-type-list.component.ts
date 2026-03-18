import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CompanyModel, DocumentPayTypeModel } from '@app/features/company/models';
import { DocumentPayTypeService } from '@app/features/company/services';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-document-pay-type-list',
  templateUrl: './document-pay-type-list.component.html'
})
export class DocumentPayTypeListContainer {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  
  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<DocumentPayTypeModel[]>([]);
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
    sortColumn: 'Name',
    sortDirection: 'ASC',
  };

  translations = {
    name: '',
    companyName: '',
    paymentType: '',
    currency: '',
    bankComission: '',
    vatWithholding: '',
    incomeWithholding: '',
    status: '',
    action: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private documentPayTypeService: DocumentPayTypeService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.DocumentPayTypes, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.DocumentPayTypes, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.Name',
      'DocumentPayTypes.CompanyName',
      'DocumentPayTypes.PaymentType',
      'DocumentPayTypes.Currency',
      'DocumentPayTypes.BankComission',
      'DocumentPayTypes.VATWithholding',
      'DocumentPayTypes.IncomeWithholding',
      'Labels.Status',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.name = translations['Labels.Name'];
          this.translations.companyName = translations['DocumentPayTypes.CompanyName'];
          this.translations.paymentType = translations['DocumentPayTypes.PaymentType'];
          this.translations.currency = translations['DocumentPayTypes.Currency'];
          this.translations.bankComission = translations['DocumentPayTypes.BankComission'];
          this.translations.vatWithholding = translations['DocumentPayTypes.VATWithholding'];
          this.translations.incomeWithholding = translations['DocumentPayTypes.IncomeWithholding'];
          this.translations.status = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
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
    this.columns.push({ field: 'paymentType', label: this.translations.paymentType, sortable: true });
    this.columns.push({ field: 'currency', label: this.translations.currency, sortable: true });
    this.columns.push({ field: 'bankComission', label: this.translations.bankComission, sortable: false, type: '2decimals' });
    this.columns.push({ field: 'vatWithholding', label: this.translations.vatWithholding, sortable: false, type: '2decimals'  });
    this.columns.push({ field: 'incomeWithholding', label: this.translations.incomeWithholding, sortable: false, type: '2decimals'  });
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
    this.router.navigate(['company', 'document-pay-type-details']);
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

  protected deleteEntity(entity: DocumentPayTypeModel): void {
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

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.documentPayTypeService.delete$(id)
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

  protected editEntity(entity: DocumentPayTypeModel): void {
    if (entity.id > 0) {
      this.router.navigate(['company', 'document-pay-type-details'], { queryParams: { id: entity.id } });
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

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;

    this.documentPayTypeService.getPaged$({...this.pagination, pi: (this.pagination.pi)}, companyId)
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
  
}
