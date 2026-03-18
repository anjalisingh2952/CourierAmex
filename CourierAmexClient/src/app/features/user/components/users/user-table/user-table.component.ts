import { Component, EventEmitter } from '@angular/core';
import { CredentialsService } from '@app/@core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { UserModel } from '@app/features/user/models';

@Component({
  selector: 'settings-user-table',
  templateUrl: './user-table.component.html',
  inputs: ['users', 'pagination'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class UserTableComponent {
  users: UserModel[] = [];
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<UserModel>();
  onDelete = new EventEmitter<UserModel>();

  constructor(
    private credentailsService: CredentialsService
  ) { 
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Users, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editItem(entity: UserModel): void {
    this.onEdit.emit(entity);
  }

  deleteItem(entity: UserModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: UserModel) {
    return value.id;
  }
}
