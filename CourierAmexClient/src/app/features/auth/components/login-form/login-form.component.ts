import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginRequest } from '@app/models';

@Component({
  selector: 'auth-login-form',
  templateUrl: './login-form.component.html',
  outputs: ['onFormSubmit']
})
export class LoginFormComponent {
  request: LoginRequest = {
    email: '',
    password: ''
  };
  onFormSubmit = new EventEmitter<LoginRequest>();

  get forgotLink(): any {
    return { value: '/auth/forgot' };
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onFormSubmit.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
