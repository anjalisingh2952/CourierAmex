import { Component, OnDestroy } from '@angular/core';

import appSettings from '@app/@theme/app-settings';

@Component({
  selector: 'app-error-401',
  templateUrl: './error-401.component.html',
})
export class Error401Component implements OnDestroy {
  appSettings = appSettings;

  constructor() {
    this.appSettings.appEmpty = true;
  }

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
  }
}
