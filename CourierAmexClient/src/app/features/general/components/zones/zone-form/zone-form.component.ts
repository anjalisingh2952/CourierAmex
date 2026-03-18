import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CountryModel, StateModel, ZoneModel } from '@app/features/general/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'zone-form',
  templateUrl: './zone-form.component.html',
  inputs: ['entity', 'countries', 'states'],
  outputs: ['onSave', 'onGoBack', 'onLoadStates']
})
export class ZoneFormComponent {
  entity!: ZoneModel;
  countries: CountryModel[] = [];
  states: StateModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  onSave = new EventEmitter<ZoneModel>();
  onGoBack = new EventEmitter<void>();
  onLoadStates = new EventEmitter<number | undefined>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Update);
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }

  loadStates(countryId: number | undefined): void {
    this.onLoadStates.emit(countryId);
  }
}
