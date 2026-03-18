import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ResetRequest } from '@app/models';

@Component({
  selector: 'auth-reset-form',
  templateUrl: './reset-form.component.html',
  outputs: ['onFormSubmit']
})
export class ResetFormComponent {
  request: ResetRequest = {
    password: '',
    confirm: '',
    userId: ''
  }
  onFormSubmit = new EventEmitter<ResetRequest>();

  get loginLink(): any {
    return { value: '/auth/login' };
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onFormSubmit.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
