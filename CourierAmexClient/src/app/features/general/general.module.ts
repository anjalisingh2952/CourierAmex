import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    GeneralRoutingModule
  ],
  providers: [
    ...services.GENERAL_SERVICES
  ],
  declarations: [
    ...components.GENERAL_COMPONENTS,
    ...containers.GENERAL_CONTAINERS
  ]
})
export class GeneralModule { }
