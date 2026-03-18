import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';
import { CashierListComponent } from './containers/cashiers/cashier-list/cashier-list.component';
import { CashierDetailsComponent } from './containers/cashiers/cashier-details/cashier-details.component';
import { DocumentPayTypeListContainer } from './containers/document-pay-types/document-pay-type-list/document-pay-type-list.component';
import { DocumentPayTypeDetailsContainer } from './containers/document-pay-types/document-pay-type-details/document-pay-type-details.component';
import { DocumentPayTypeFormComponent } from './components/document-pay-types/document-pay-type-form/document-pay-type-form.component';
import { CashierFormComponent } from './components/cashier-form/cashier-form.component';
import { CashierUsersComponent } from './components/cashier-users/cashier-users.component';
import {ExchangeRateListComponent } from './containers/exchange-rate/exchange-rate-list/exchange-rate-list.component'
import { ExchangeRateFormsComponent } from './components/exchange-rate-forms/exchange-rate-forms.component';


import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button'; 
import { CashierPaymentComponent } from './components/cashier-payment/cashier-payment.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CompanyRoutingModule,
    TableModule,
    ButtonModule
  ],
  providers: [
    ...services.COMPANY_SERVICES
  ],
  declarations: [
    ...containers.COMPANY_CONTAINERS,
    ...components.COMPANY_COMPONENTS,
    CashierListComponent,
    CashierDetailsComponent,
    DocumentPayTypeListContainer,
    DocumentPayTypeDetailsContainer,
    DocumentPayTypeFormComponent,
    CashierFormComponent,
    CashierUsersComponent,
    CashierPaymentComponent,
    ExchangeRateListComponent,
    ExchangeRateFormsComponent
  ]
})
export class CompanyModule { }
