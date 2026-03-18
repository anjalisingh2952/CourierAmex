import { Component, EventEmitter } from '@angular/core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { AreaModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'area-table',
  templateUrl: './area-table.component.html',
  inputs: ['entities', 'pagination'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class AreaTableComponent {
  entities: AreaModel[] = [];
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<AreaModel>();
  onDelete = new EventEmitter<AreaModel>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Areas, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editEntity(entity: AreaModel): void {
    this.onEdit.emit(entity);
  }

  deleteEntity(entity: AreaModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: AreaModel) {
    return value.id;
  }
}
