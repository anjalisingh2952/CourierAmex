import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService, LoadingService, MessageService } from '@app/@core';
import appSettings from '@app/@theme/app-settings';
import { LoginRequest } from '@app/models';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.container.html',
})
export class LoginContainer implements OnDestroy {
  appSettings = appSettings;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loading: LoadingService,
    private messages: MessageService
  ) {
    this.appSettings.appEmpty = true;
  }

  ngOnDestroy(): void {
    this.appSettings.appEmpty = false;
  }

  formSubmit(request: LoginRequest): void {
    this.loading.show();
    let redirect = false;

    this.authService.login(request)
      .pipe(
        finalize(() => {
          this.loading.hide();
          if (redirect) {
            this.gotoDashboard();
          }
        })
      ).subscribe({
        next: (res) => {
          if (res?.accessToken) {
            redirect = true;
          } else {
            Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InvalidLogin') });
          }
        },
        error: (e) => {
          let msg = this.messages.getTranslate('Labels.InvalidLogin');
          if (e && e.status === 403) {
            msg = this.messages.getTranslate('Labels.InternalError');
          }
          Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: msg });
        }
      });
  }

  private gotoDashboard(): void {
    this.router.navigate(["home", "dashboard"], { replaceUrl: true });
  }
}
