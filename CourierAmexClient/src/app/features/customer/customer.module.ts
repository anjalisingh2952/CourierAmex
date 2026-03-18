import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';
import { PackageService } from '../package';

import { MultiSelectModule } from 'primeng/multiselect';
import { PrimeNGConfig } from 'primeng/api';  // Configuration module
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';  // Import ButtonModule
import { InputTextModule } from 'primeng/inputtext';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PackageNotesService } from '../package';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CustomerRoutingModule,
    ToastModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    NgxSkeletonLoaderModule,
    DropdownModule
  ],
  providers: [
    ...services.CUSTOMER_SERVICES,
    PackageService,
    PrimeNGConfig,
    PackageNotesService
  ],
  declarations: [
    ...containers.CUSTOMER_CONTAINERS,
    ...components.CUSTOMER_COMPONENTS
  ]
})
export class CustomerModule { }
