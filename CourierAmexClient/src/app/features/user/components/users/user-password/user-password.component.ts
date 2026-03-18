import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UserModel } from '@app/features/user/models';

@Component({
  selector: 'user-password-form',
  templateUrl: './user-password.component.html',
  inputs: ['entity'],
  outputs: ['onSubmit', 'onCancel']
})
export class UserPasswordFormComponent {
  entity!: UserModel;
  onSubmit = new EventEmitter<UserModel>();
  onCancel = new EventEmitter<void>();

  constructor(
    private activeModal: NgbActiveModal
  ) { }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      const entity = form.value;
      this.activeModal.close(entity);
    }
  }

  close(): void {
    this.activeModal.close();
  }
}
