import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { ErrorRoutingModule } from './error.routing';
import * as errorComponents from './components';
import { SharedModule } from '@app/@shared';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    ErrorRoutingModule
  ],
  providers: [],
  declarations: [
    ...errorComponents.ERROR_COMPONENTS
  ]
})
export class ErrorModule { }
