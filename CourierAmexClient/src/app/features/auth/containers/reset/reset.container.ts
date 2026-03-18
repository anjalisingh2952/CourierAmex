import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { GenericResponse, ResetRequest, UserSessionModel } from '@app/models';
import { AuthService, LoadingService, MessageService } from '@app/@core';
import appSettings from '@app/@theme/app-settings';

@Component({
  selector: 'app-auth-reset',
  templateUrl: './reset.container.html',
})
export class ResetContainer implements OnInit, OnDestroy {
  appSettings = appSettings;
  user!: UserSessionModel;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loading: LoadingService,
    private messages: MessageService
  ) {
    this.appSettings.appEmpty = true;
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        const key = params['key'] ?? '';
        this.getUserByKey(key);
      });
  }

  ngOnDestroy(): void {
    this.appSettings.appEmpty = false;
  }

  formSubmit(request: ResetRequest): void {
    let redirect = false;
    this.loading.show();
    request.userId = this.user.id;

    this.authService.reset(request)
      .pipe(
        finalize(() => {
          this.loading.hide();
          if (redirect) {
            this.router.navigate(['auth'], { replaceUrl: true });
          }
        })
      ).subscribe({
        next: (res: GenericResponse<boolean>) => {
          if (res?.success) {
            Swal.fire({ icon: 'info', title: this.messages.getTranslate('Labels.PasswordChangeTitle'), text: this.messages.getTranslate('Labels.PasswordChangeSuccessfully') });
            redirect = true;
          } else {
            Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InernalError') });
          }
        },
        error: (e: any) => {
          console.error(e);
          Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InernalError') });
        }
      });
  }

  private getUserByKey(key: string): void {
    if (key?.length > 0) {
      this.loading.show();

      this.authService.getUserByKey(key)
        .pipe(
          finalize(() => {
            this.loading.hide();
          })
        )
        .subscribe((res) => {
          if (!!res && !!res.success && !!res.data?.id) {
            this.user = res.data;
          } else {
            this.showError();
          }
        });
    } else {
      this.showError();
    }
  }

  private showError(): void {
    Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InernalError') }).then(() => {
      this.router.navigate(['auth'], { replaceUrl: true });
    });
  }
}
