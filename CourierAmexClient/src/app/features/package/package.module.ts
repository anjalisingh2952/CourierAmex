import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PackageRoutingModule } from './package.routing';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import * as components from './components';
import * as services from './services';
import { EventListComponent } from './containers/events/event-list/event-list.component';
import { PackageCategoryComponent } from './containers/package-category/package-category.component';
import { PackageCategoryListComponent } from './components/packages-category/package-category-list/package-category-list.component';
import { PackageCategoryFormComponent } from './components/packages-category/package-category-form/package-category-form.component';
import { PackageClassifyComponent } from './containers/package-classify/package-classify.component';
import { ClassifyFormComponent } from './components/packages-classify/classify-form/classify-form.component';
import { PackageListComponent } from './components/packages-classify/package-list/package-list.component';
import { PackageLogNotesComponent} from './containers/package-lognotes/package-lognotes-list/package-lognotes-list.component';
import { PackageNotesListContainer} from './containers/package-notes/package-notes-list/package-notes-list.container';
import { PackageNotesModalComponent } from './components/packages-notes/package-notes-modal.component';
import { PackingPackagesListComponent } from './components/packing-packages/packing-packages-list/packing-packages-list.component';
import { PackingPackagesFormComponent } from './components/packing-packages/packing-packages-form/packing-packages-form.component';
import { PackingPackagesComponent } from './containers/packing-packages/packing-packages.component';
import { PackingPackagesSectionSelectionComponent } from './components/packing-packages/packing-packages-section-selection/packing-packages-section-selection.component';
import { PackingPackagesPackagesListComponent } from './components/packing-packages/packing-packages-packages-list/packing-packages-packages-list.component';
import { AssignPricesComponent } from './containers/assign-prices/assign-prices.component';
import { AssignPricesFormComponent } from './components/assign-prices-form/assign-prices-form.component';
import { PreStudyComponent } from './containers/pre-study/pre-study.component';
import { PackagePrestudyAdditemComponent } from './components/package-prestudy-additem/package-prestudy-additem.component';
import { PackageListDetailComponent } from './components/packing-packages/package-list-detail/package-list-detail.component';
import { PreStudyFormComponent } from './components/pre-study-form/pre-study-form.component';
import { ModifyPreStudyComponent } from './components/modify-pre-study/modify-pre-study.component';
import { PrealertPreStudyComponent } from './components/prealert-pre-study/prealert-pre-study.component';
import { TabViewModule } from 'primeng/tabview';
import { ClientCashierService } from '../company/services/client-cashier.service';
import { PackageInventoryService } from './services/package-inventory.service';
import { PrimeNGConfig } from 'primeng/api';  // Configuration module
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';  // Import ButtonModule
import { InputTextModule } from 'primeng/inputtext';
import { TabMenuModule } from 'primeng/tabmenu';
import { ManifestService } from '../manifest/services/manifest.service';
import { CommodityService } from '../../features/company/services/commodity.service';
import { DropdownModule } from 'primeng/dropdown'; 
import { PriceImageMaintenancModalComponent } from './components/price-image-maintenanc-modal/price-image-maintenanc-modal.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PackageRoutingModule,
    NgxSkeletonLoaderModule,
    TabViewModule,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TabMenuModule,
    DropdownModule
  ],
  providers: [
    ...services.PACKAGE_SERVICES,
    ClientCashierService,
    PrimeNGConfig,
    PackageInventoryService,
    ManifestService,
    CommodityService
  ],
  declarations: [
    ...containers.PACKAGE_CONTAINERS,
    ...components.PACKAGE_COMPONENTS,
    EventListComponent,
    PackageCategoryComponent,
    PackageCategoryListComponent,
    PackageCategoryFormComponent,
    PackageClassifyComponent,
    ClassifyFormComponent,
    PackageListComponent,
    PackageLogNotesComponent,
    PackageNotesListContainer,
    PackageNotesModalComponent,
    PackingPackagesComponent,
    PackingPackagesListComponent,
    PackingPackagesFormComponent,
    PackingPackagesSectionSelectionComponent,
    PackingPackagesPackagesListComponent,
    AssignPricesComponent,
    AssignPricesFormComponent,
    PreStudyComponent,
    PackagePrestudyAdditemComponent,
    PackageListDetailComponent,
    PreStudyComponent,
    PreStudyFormComponent,
    ModifyPreStudyComponent,
    PrealertPreStudyComponent,
    PriceImageMaintenancModalComponent
  ]
})
export class PackageModule { }
