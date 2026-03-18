import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from "@angular/core";

import { BehaviorSubject, filter, finalize } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import Swal from "sweetalert2";

import { PageOptionsDefault, PaginationModel, defaultPagination } from "@app/models";
import { ColDef, TableState } from "../tabular-data/tabular-data.component";
import { CommonService, LoadingService, MessageService } from "@app/@core";
import { CustomerModel } from "@app/features";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'search-customer-dialog',
  templateUrl: './search-customer-dialog.component.html',
  inputs: ['companyId']
})
export class SearchCustomerDialogComponent implements AfterViewInit, OnInit {
  pagination: PaginationModel = defaultPagination;
  companyId: number = 0;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'fullName',
    sortDirection: 'ASC',
    selectable: true
  };

  translations = {
    documentId: '',
    code: '',
    fullName: '',
    email: ''
  };

  private readonly _entities = new BehaviorSubject<CustomerModel[]>([]);
  entities$ = this._entities.asObservable();

  constructor(
    private loading: LoadingService,
    private activeModal: NgbActiveModal,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;

    this.translate.get(['Customers.DocumentId',
      'Customers.Code',
      'Customers.FullName',
      'Customers.Email',
      'Customers.BillableEmail'
    ])
      .subscribe(
        translations => {
          this.translations.documentId = translations['Customers.DocumentId'];
          this.translations.code = translations['Customers.Code'];
          this.translations.fullName = translations['Customers.FullName'];
          this.translations.email = translations['Customers.Email'];
        });
  }

  ngOnInit(): void {
    this.performSearch();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'documentId', label: this.translations.documentId, sortable: true });
    this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'email', label: this.translations.email, sortable: true });
    this.changeDetectorRef.detectChanges();
  }

  onSelect(row: any): void {
    this.activeModal.close(row);
  }

  close(): void {
    this.activeModal.close(undefined);
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

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);

    this.commonService.getCustomersPagedByCompany$(this.pagination, this.companyId)
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
