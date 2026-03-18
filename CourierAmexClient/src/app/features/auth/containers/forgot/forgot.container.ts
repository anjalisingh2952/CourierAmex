import { Component, OnDestroy } from '@angular/core';

import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService, LoadingService, MessageService } from '@app/@core';
import appSettings from '@app/@theme/app-settings';
import { ForgotRequest } from '@app/models';

@Component({
  selector: 'app-auth-forgot',
  templateUrl: './forgot.container.html',
})
export class ForgotContainer implements OnDestroy {
  appSettings = appSettings;

  constructor(
    private authService: AuthService,
    private loading: LoadingService,
    private messages: MessageService
  ) {
    this.appSettings.appEmpty = true;
  }

  ngOnDestroy(): void {
    this.appSettings.appEmpty = false;
  }

  formSubmit(request: ForgotRequest): void {
    this.loading.show();

    this.authService.forgot(request)
      .pipe(
        finalize(() => {
          this.loading.hide();
        })
      ).subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire({ icon: 'info', title: this.messages.getTranslate('Labels.Information'), text: this.messages.getTranslate('Labels.ForgotEmailSent') });
          } else {
            Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InvalidEmail') });
          }
        },
        error: (e) => {
          console.error(e);
          Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InternalError') });
        }
      });
  }
}
