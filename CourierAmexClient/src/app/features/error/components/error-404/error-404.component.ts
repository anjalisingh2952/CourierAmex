import { Component, OnDestroy } from '@angular/core';

import appSettings from '@app/@theme/app-settings';

@Component({
  selector: 'app-error-404',
  templateUrl: './error-404.component.html',
})
export class Error404Component implements OnDestroy {
  appSettings = appSettings;

  constructor() {
    this.appSettings.appEmpty = true;
  }

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
  }

}