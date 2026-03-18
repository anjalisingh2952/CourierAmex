import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { UserService } from '@app/features/user/services';
import { UserModel } from '@app/features/user/models';
import { sortType } from '@app/@shared';

@Component({
  selector: 'settings-user-list',
  templateUrl: './user-list.container.html'
})
export class UserListContainer implements OnInit {
  pagination: PaginationModel = defaultPagination;
  hasAdd: boolean = false;
  private readonly _users = new BehaviorSubject<UserModel[]>([]);
  users$ = this._users.asObservable();

  constructor(
    private router: Router,
    private loading: LoadingService,
    private userService: UserService,
    private messageService: MessageService,
    private credentailsService: CredentialsService
  ) { 
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Users, PermissionActionEnum.Delete);
  }

  ngOnInit(): void {
    this.performSearch();
  }

  addNew(): void {
    this.router.navigate(['user', 'details']);
  }

  onKeywordSearch(criteria: string): void {
    this.pagination = { ...this.pagination, c: criteria, pi: 1 };
    this.performSearch();
  }

  onPagerChange(entity: PaginationModel): void {
    this.pagination = { ...entity };
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

  editItem(entity: UserModel): void {
    if (entity.id.length > 0) {
      this.router.navigate(['user', 'details'], { queryParams: { id: entity.id } });
    }
  }

  deleteItem(entity: UserModel): void {
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

    this.userService.delete$(id)
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
    this._users.next([]);

    this.userService.getPaged$(this.pagination)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._users.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private updatePagination(): void {
    const entities = this._users.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }
}
