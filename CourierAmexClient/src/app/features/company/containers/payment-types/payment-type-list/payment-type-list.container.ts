import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import Swal, {SweetAlertResult} from "sweetalert2";

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from "@app/models";
import { ColDef, TableState } from "@app/@shared/components/tabular-data/tabular-data.component";
import { CommonService, CredentialsService, LoadingService, MessageService } from "@app/@core";
import { CompanyModel, PaymentTypeModel, PaymentTypeService } from "@app/features/company";

@Component({
    selector: 'payment-type-list',
    templateUrl: './payment-type-list.container.html'
})
export class PaymentTypeListContainer implements OnInit, AfterViewInit {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<PaymentTypeModel[]>([]);
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
    discount: '',
    status: '',
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
    private paymentTypeService: PaymentTypeService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PaymentTypes, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.PaymentTypes, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.Name',
      // 'PaymentTypes.CompanyName',
      'Labels.Status',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.name = translations['Labels.Name'];
          // this.translations.companyName = translations['PaymentTypes.CompanyName'];
          this.translations.status = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    if (this.showCompanies) {
      // this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    }
    this.columns.push({ field: 'name', label: this.translations.name, sortable: true });
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
    this.router.navigate(['company', 'payment-type-details']);
  }

  protected editEntity(entity: PaymentTypeModel): void {
    if (entity.id > 0) {
      this.router.navigate(['company', 'payment-type-details'], { queryParams: { id: entity.id } });
    }
  }

  protected deleteEntity(entity: PaymentTypeModel): void {
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

    this.paymentTypeService.delete$(id)
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

    this.paymentTypeService.getPaged$(this.pagination, companyId)
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