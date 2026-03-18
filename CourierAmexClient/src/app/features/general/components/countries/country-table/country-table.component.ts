import { Component, EventEmitter } from '@angular/core';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CountryModel } from '@app/features/general/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'country-table',
  templateUrl: './country-table.component.html',
  inputs: ['entities', 'pagination'],
  outputs: ['onSortBy', 'onEdit', 'onDelete']
})
export class CountryTableComponent {
  entities: CountryModel[] = [];
  pagination?: PaginationModel;
  hasDelete: boolean = false;
  onSortBy = new EventEmitter<string>();
  onEdit = new EventEmitter<CountryModel>();
  onDelete = new EventEmitter<CountryModel>();

  constructor(
    private credentailsService: CredentialsService
  ) { 
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Countries, PermissionActionEnum.Delete);
  }

  sortBy(column: string): void {
    this.onSortBy.emit(column);
  }

  editEntity(entity: CountryModel): void {
    this.onEdit.emit(entity);
  }

  deleteEntity(entity: CountryModel): void {
    this.onDelete.emit(entity);
  }

  trackById(index: number, value: CountryModel) {
    return value.id;
  }
}
