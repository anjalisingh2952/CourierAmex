import { Component, OnDestroy } from '@angular/core';

import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { ChangePasswordModel, newChangePasswordModel } from '@app/features/user/models';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { UserService } from '@app/features/user/services';
import appSettings from '@app/@theme/app-settings';
import { TabModel } from '@app/models';
import { ActivatedRoute } from '@angular/router';

const tabs: TabModel[] = [
  // {
  //   name: 'about',
  //   displayName: 'UserProfile.About'
  // },
  {
    name: 'security',
    displayName: 'UserProfile.Security'
  }
]

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.container.html'
})
export class UserProfileContainer implements OnDestroy {
  appSettings = appSettings;
  isLoading: boolean = false;
  tabs: TabModel[] = tabs;
  tab: TabModel = tabs[0];
  entity: ChangePasswordModel = newChangePasswordModel;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private loading: LoadingService,
    private messages: MessageService,
    private userService: UserService,
    private credentials: CredentialsService
  ) {
    this.initEntity();

    this.loading.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => this.isLoading = val);

    setTimeout(() => {
      this.appSettings.appContentClass = "p-0";
    }, 10);

    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((qp) => {
      const qptab = qp['tab'];
      if (qptab?.length > 0) {
        this.selectTab(qptab);
      }
    });
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.appSettings.appContentClass = "";
    }, 10);
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(tab: TabModel): void {
    this.tab = tab;
  }

  changePassword(entity: ChangePasswordModel): void {
    this.loading.show();

    this.userService.changePassword$(entity)
      .pipe(finalize(() => {
        this.loading.hide();
        this.initEntity();
      }))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.updateSession();
            Swal.fire(this.messages.getTranslate('UserProfile.PasswordChangedTitle'), this.messages.getTranslate('UserProfile.PasswordChanged'), 'success');
          } else {
            Swal.fire(this.messages.getTranslate('UserProfile.PasswordChangedTitle'), this.messages.getTranslate('UserProfile.InvalidInformation'), 'warning');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        },
      });
  }

  private initEntity(): void {
    this.entity = newChangePasswordModel;
    this.entity.id = this.credentials.credentials?.user.id;
  }

  private updateSession(): void {
    let creds = Object.assign({}, this.credentials.credentials);
    if (creds.user) {
      creds.user.changePassword = false;

      this.credentials.setCredentials(creds);
    }
  }

  private selectTab(tabName: string): void {
    const tab = this.tabs.find(t => t.name === tabName);
    if (tab) {
      this.tab = tab;
    }
  }
}
