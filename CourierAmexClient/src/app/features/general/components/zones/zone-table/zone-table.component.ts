import { Component, EventEmitter } from '@angular/core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ZoneModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'zone-table',
  templateUrl: './zone-table.component.html',
  inputs: ['entities', 'pagination'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class ZoneTableComponent {
  entities: ZoneModel[] = [];
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<ZoneModel>();
  onDelete = new EventEmitter<ZoneModel>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editEntity(entity: ZoneModel): void {
    this.onEdit.emit(entity);
  }

  deleteEntity(entity: ZoneModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: ZoneModel) {
    return value.id;
  }
}
