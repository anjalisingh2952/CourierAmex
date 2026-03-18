import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ForgotRequest } from '@app/models';

@Component({
  selector: 'auth-forgot-form',
  templateUrl: './forgot-form.component.html',
  outputs: ['onFormSubmit']
})
export class ForgotFormComponent {
  request: ForgotRequest = {
    email: ''
  };
  onFormSubmit = new EventEmitter<ForgotRequest>();

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
