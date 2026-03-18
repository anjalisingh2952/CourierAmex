import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { PackageStatusService } from '@app/features/general/services';
import { PackageStatusModel } from '@app/features/general/models';
import { CompanyModel } from '@app/features/company/models';

@Component({
  selector: 'company-package-status-list',
  templateUrl: './package-status-list.container.html'
})
export class PackageStatusListContainer implements OnInit, AfterViewInit {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;

  private readonly _entities = new BehaviorSubject<PackageStatusModel[]>([]);
  entities$ = this._entities.asObservable();

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
		page: 1,
		pageSize: PageOptionsDefault,
		searchTerm: '',
		sortColumn: 'code',
		sortDirection: 'ASC',
	};

  translations = {
    name: '',
    code: '',
    status: '',
    action: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageStatusService: PackageStatusService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackageStatus, PermissionActionEnum.Delete);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.PackageStatus, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.Name',
      'Labels.Code',
      'Labels.Status',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.code = translations['Labels.Code'];
          this.translations.name = translations['Labels.Name'];
          this.translations.status = translations['Labels.Status'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.performSearch();
  }

  ngAfterViewInit(): void {
    this.columns.push({field: 'code', label:  this.translations.code, sortable: true});
    this.columns.push({field: 'name', label: this.translations.name, sortable: true});
    this.columns.push({field: 'status', label: this.translations.status, sortable: true, contentTemplate: this.statusTemplate});
    this.columns.push({field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate});
    this.changeDetectorRef.detectChanges();
  }

  protected onStateChange(state: TableState){
    this.state = {...state};
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
    this.router.navigate(['general', 'package-status-details']);
  }

  protected editEntity(entity: PackageStatusModel): void {
    if (entity.id > 0) {
      this.router.navigate(['general', 'package-status-details'], { queryParams: { id: entity.id } });
    }
  }

  protected deleteEntity(entity: PackageStatusModel): void {
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

    this.packageStatusService.delete$(id)
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

    this.packageStatusService.getPaged$(this.pagination)
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
