import { Component, EventEmitter } from '@angular/core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { RoleModel } from '@app/features/user/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'settings-role-table',
  templateUrl: './role-table.component.html',
  inputs: ['roles', 'pagination', 'showCompanies'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class RoleTableComponent {
  roles: RoleModel[] = [];
  showCompanies: boolean = false;
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<RoleModel>();
  onDelete = new EventEmitter<RoleModel>();

  constructor(
    private credentailsService: CredentialsService
  ) { 
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Roles, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editItem(entity: RoleModel): void {
    this.onEdit.emit(entity);
  }

  deleteItem(entity: RoleModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: RoleModel) {
    return value.id;
  }
}
