import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

import { NgbModalModule, NgbModule, NgbNavModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { TranslateModule } from "@ngx-translate/core";

import { TabularDataComponent } from './components/tabular-data/tabular-data.component';
import { EntityListComponent } from './components/entity-list/entity-list.component';
import { EntityTreeViewComponent } from './components/app-entity-treeview/app-entity-treeview.component';
import * as components from './components';
import * as directives from './directives';

const ngbootstrap = [
  NgbModule,
  NgbModalModule,
  NgbNavModule,
  NgbTypeaheadModule
];

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    TranslateModule,
    NgxSkeletonLoaderModule,
    ...ngbootstrap,
  ],
  declarations: [
    ...components.SHARED_COMPONENTS,
    ...directives.SHARED_DIRECTIVES,
    TabularDataComponent,
    EntityListComponent,
    EntityTreeViewComponent
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ...ngbootstrap,
    ...components.SHARED_COMPONENTS,
    ...directives.SHARED_DIRECTIVES,
    TabularDataComponent,
    EntityListComponent,
    EntityTreeViewComponent
  ]
})

export class SharedModule { }
