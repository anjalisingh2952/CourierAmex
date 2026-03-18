import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { AuthRoutingModule } from './auth.routing';
import { SharedModule } from '@app/@shared';

import * as containers from './containers';
import * as components from './components';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    AuthRoutingModule
  ],
  providers: [],
  declarations: [
    ...components.AUTH_COMPONENTS,
    ...containers.AUTH_CONTAINERS,
  ]
})
export class AuthModule { }
