import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CountryModel, StateModel, AreaModel, ZoneModel } from '@app/features/general/models';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'area-form',
  templateUrl: './area-form.component.html',
  inputs: ['entity', 'countries', 'states', 'zones'],
  outputs: ['onSave', 'onGoBack', 'onLoadStates', 'onLoadZones']
})
export class AreaFormComponent {
  entity!: AreaModel;
  countries: CountryModel[] = [];
  states: StateModel[] = [];
  zones: ZoneModel[] = [];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  onSave = new EventEmitter<AreaModel>();
  onGoBack = new EventEmitter<void>();
  onLoadStates = new EventEmitter<number | undefined>();
  onLoadZones = new EventEmitter<number | undefined>();

  constructor(
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Areas, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Areas, PermissionActionEnum.Update);
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

  loadZones(stateId: number | undefined): void {
    this.onLoadZones.emit(stateId);
  }
}
