import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as errorComponents from './components';

export const ERROR_ROUTES: Routes = [
  {
    path: 'unauthorized',
    component: errorComponents.Error401Component
  },
  {
    path: 'notfound',
    component: errorComponents.Error404Component
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/error/notfound',
  }
];

@NgModule({
  imports: [RouterModule.forChild(ERROR_ROUTES)],
  exports: [RouterModule],
})
export class ErrorRoutingModule { }
