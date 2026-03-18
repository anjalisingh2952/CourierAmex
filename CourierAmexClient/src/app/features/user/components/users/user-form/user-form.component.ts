import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { UserPasswordFormComponent } from '../user-password/user-password.component';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { CountryModel, StateModel } from '@app/features/general';
import { RoleModel, UserModel } from '@app/features/user/models';
import { CredentialsService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { EMAIL_REGEX } from '@app/@shared';

@Component({
  selector: 'settings-user-form',
  templateUrl: './user-form.component.html',
  inputs: ['entity', 'roles', 'countries', 'states', 'companies'],
  outputs: ['onSave', 'onLoadStates', 'onResetPassword', 'onCreatePassword', 'onUpdateUser', 'onGoBack']
})
export class UserFormComponent {
  entity!: UserModel;
  roles!: RoleModel[];
  countries!: CountryModel[];
  states!: StateModel[];
  companies!: CompanyModel[];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  EMAIL_REGEX = EMAIL_REGEX;
  onSave = new EventEmitter<UserModel>();
  onLoadStates = new EventEmitter<number | undefined>();
  onResetPassword = new EventEmitter<string>();
  onCreatePassword = new EventEmitter<UserModel>();
  onUpdateUser = new EventEmitter<UserModel>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private config: NgbModalConfig,
    private messages: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.config.backdrop = 'static';
    this.config.keyboard = false;
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Users, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Users, PermissionActionEnum.Update);
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      let entity = form.value;

      if (entity.dateOfBirthValue?.length > 0) {
        const ticks = new Date(entity.dateOfBirthValue).getTime();
        if (ticks > 0) {
          entity.dateOfBirth = +ticks;
        }
      }
      if (entity.roles) {
        let roles = Object.keys(entity.roles)
          .map(idx => {
            return { id: entity.roles[idx].id, name: entity.roles[idx].name, companyId: entity.roles[idx].companyId, isSelected: entity.roles[idx].isSelected }
          });

        entity.roles = roles.filter(x => x.isSelected);
      }

      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }

  loadStates(countryId: number | undefined): void {
    this.onLoadStates.emit(countryId);
  }

  resetPassword(): void {
    if (this.entity.email.length === 0) {
      Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('UserDetails.UserWithNoEmail') });
      return;
    }
    this.onResetPassword.emit(this.entity.email);
  }

  createPassword(): void {
    const modalRef = this.modalService.open(UserPasswordFormComponent);
    modalRef.componentInstance.entity = this.entity;

    modalRef.result
      .catch(reason => {
        console.error(reason);
      })
      .then((entity: UserModel) => {
        if (entity) {
          this.onCreatePassword.emit(entity);
        }
      });
  }

  updateUser(form: NgForm): void {
    let entity = form.value;
    this.onUpdateUser.emit(entity);
  }
}
