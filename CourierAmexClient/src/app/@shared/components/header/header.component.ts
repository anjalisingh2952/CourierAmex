import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, CredentialsService } from '@app/@core';
import appSettings from '@app/@theme/app-settings';

@Component({
  selector: 'shared-header',
  templateUrl: './header.component.html',
  inputs: ['appSidebarTwo'],
  outputs: ['appSidebarEndToggled', 'appSidebarMobileToggled', 'appSidebarEndMobileToggled']
})
export class HeaderComponent implements OnInit {
  appSidebarTwo: any;
  appSidebarEndToggled = new EventEmitter<boolean>();
  appSidebarMobileToggled = new EventEmitter<boolean>();
  appSidebarEndMobileToggled = new EventEmitter<boolean>();
  appSettings = appSettings;
  userName: string = '';

  constructor(
    private router: Router,
    private authorize: AuthService,
    private credentialsService: CredentialsService,
  ) { }

  ngOnInit(): void {
    const user = this.credentialsService.credentials?.user;
    if (user && user.id.length > 0) {
      this.userName = `${user.name} ${user.lastname}`;
    }
  }

  toggleAppSidebarMobile(): void {
    this.appSidebarMobileToggled.emit(true);
  }

  toggleAppSidebarEnd(): void {
    this.appSidebarEndToggled.emit(true);
  }

  toggleAppSidebarEndMobile(): void {
    this.appSidebarEndMobileToggled.emit(true);
  }

  toggleAppTopMenuMobile(): void {
    this.appSettings.appTopMenuMobileToggled = !this.appSettings.appTopMenuMobileToggled;
  }

  logout(): void {
    this.authorize.logout()
      .subscribe(() => this.gotoHome());
  }

  profile(): void {
    this.router.navigate(['user', 'profile'], { replaceUrl: true });
  }

  private gotoHome(): void {
    this.router.navigate(['auth'], { replaceUrl: true });
  }
}
