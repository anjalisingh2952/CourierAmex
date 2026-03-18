import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ManifestRoutingModule } from './manifest.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';
import { AirClassifyComponent } from './containers/air-classify/air-classify.component';
import { AirClassifyFormComponent } from './components/air-classify/air-classify-form/air-classify-form.component';
import { PackageScanningComponent } from './containers/package-scanning/package-scanning.component';
import { PendingPackagesComponent } from './components/package-scanning/pending-packages.component';
import { AirClassifyPackagesComponent } from './components/air-classify/air-classify-packages/air-classify-packages.component';
import { GuideFormComponent } from './components/air-classify/guide-form/guide-form.component';
import { FormsModule } from '@angular/forms';
import { CreateRouteSheetComponent } from './components/manage-route-sheet/create-route-sheet/create-route-sheet.component';

import { MultiSelectModule } from 'primeng/multiselect';
import { PrimeNGConfig } from 'primeng/api';  // Configuration module
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';  // Import ButtonModule
import { InputTextModule } from 'primeng/inputtext';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ManifestRoutingModule,
    NgxSkeletonLoaderModule,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [
    ...services.MANIFEST_SERVICES,
    PrimeNGConfig
  ],
  declarations: [
    ...containers.MANIFEST_CONTAINERS,
    ...components.MANIFEST_COMPONENTS,
    AirClassifyComponent,
    AirClassifyFormComponent,
    PackageScanningComponent,
    PendingPackagesComponent,
    AirClassifyPackagesComponent,
    GuideFormComponent,
    CreateRouteSheetComponent
  ]
})
export class ManifestModule { }
