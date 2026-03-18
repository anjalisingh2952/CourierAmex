import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ChangePasswordModel } from '@app/features/user/models';

@Component({
  selector: 'user-profile-security',
  templateUrl: './profile-security.component.html',
  inputs: ['isLoading', 'entity'],
  outputs: ['onFormSubmit']
})
export class UserProfileSecurityComponent {
  isLoading: boolean = false;
  entity?: ChangePasswordModel;

  onFormSubmit = new EventEmitter<ChangePasswordModel>();

  constructor(
  ) { }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onFormSubmit.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }

}

