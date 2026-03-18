import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import * as containers from './containers';
import * as component from './components';
import { SharedModule } from '@app/@shared';
import { NgChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InvoiceService } from '../invoice/services';
import { HomeService } from './services/home.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    NgChartsModule,
    NgxChartsModule
  ],
  providers: [HomeService, InvoiceService],
  declarations: [
    ...containers.HOME_CONTAINERS,
    ...containers.DASHBOARD_CONTAINERS,
    ...component.HOME_DASHBOARDS
  ]
})
export class HomeModule { }