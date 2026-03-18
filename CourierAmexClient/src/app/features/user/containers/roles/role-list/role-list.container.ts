import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, filter, finalize, takeUntil } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { OperationTypeEnum, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { RoleService } from '@app/features/user/services';
import { RoleModel } from '@app/features/user/models';
import { CompanyModel } from '@app/features/company';
import { Router } from '@angular/router';
import { sortType } from '@app/@shared';

@Component({
  selector: 'settings-role-list',
  templateUrl: './role-list.container.html'
})
export class RoleListContainer implements OnInit, OnDestroy {
  selectedCompany: CompanyModel | undefined = undefined;
  pagination: PaginationModel = defaultPagination;
  hasAdd: boolean = false;
  showCompanies: boolean = false;

  private readonly _roles = new BehaviorSubject<RoleModel[]>([]);
  roles$ = this._roles.asObservable();

  readonly companies$: Observable<CompanyModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loading: LoadingService,
    private roleService: RoleService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Roles, PermissionActionEnum.Delete);

    this.companies$ = this.commonService.getCompanies$();
  }

  ngOnInit(): void {
    this.companies$
      .pipe(
        filter(res => res && res.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(companies => {
        this.checkUser(companies);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNew(): void {
    this.router.navigate(['user', 'role-details']);
  }

  onKeywordSearch(criteria: string): void {
    this.pagination = { ...this.pagination, c: criteria, pi: 1 };
    this.performSearch();
  }

  onPagerChange(entity: PaginationModel): void {
    this.pagination = { ...entity };
    this.performSearch();
  }

  selectCompany(c: CompanyModel | undefined): void {
    this.selectedCompany = c;
    this.pagination.pi = 1;
    this.performSearch();
  }

  sortBy(column: string): void {
    const { s } = this.pagination;

    this.pagination = {
      ...this.pagination,
      s: `${column} ${sortType(s ?? '')}`
    };

    this.performSearch();
  }

  editItem(entity: RoleModel): void {
    if (entity.id.length > 0) {
      this.router.navigate(['user', 'role-details'], { queryParams: { id: entity.id } });
    }
  }

  deleteItem(entity: RoleModel): void {
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

  private confirmDeletion(id: string): void {
    this.loading.show();

    this.roleService.delete$(id)
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
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    this._roles.next([]);

    this.roleService.getPaged$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._roles.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private updatePagination(): void {
    const entities = this._roles.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }

  private checkUser(companies: CompanyModel[]): void {
    const user = this.credentailsService.credentials?.user;
    if (user?.operationType === OperationTypeEnum.Gateway) {
      const cia = companies.find(c => c.id === user.companyId);
      if (cia) {
        this.selectedCompany = cia;
      }
    } else {
      this.showCompanies = true;
    }

    this.performSearch();
  }
}
