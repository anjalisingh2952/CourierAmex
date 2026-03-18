import { Component, EventEmitter } from '@angular/core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { StateModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'state-table',
  templateUrl: './state-table.component.html',
  inputs: ['entities', 'pagination'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class StateTableComponent {
  entities: StateModel[] = [];
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<StateModel>();
  onDelete = new EventEmitter<StateModel>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.States, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editEntity(entity: StateModel): void {
    this.onEdit.emit(entity);
  }

  deleteEntity(entity: StateModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: StateModel) {
    return value.id;
  }
}
