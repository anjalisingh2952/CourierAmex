import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { UserRoutingModule } from './user.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgxSkeletonLoaderModule,
    UserRoutingModule
  ],
  providers: [
    ...services.USER_SERVICES
  ],
  declarations: [
    ...containers.USER_CONTAINERS,
    ...components.USER_COMPONENTS
  ]
})
export class UserModule { }
