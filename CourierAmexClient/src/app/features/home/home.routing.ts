import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { isAuthenticatedActivateChild } from '@app/@core';
import * as containers from './containers';

export const HOME_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: `Dashboard` },
    component: containers.DashboardContainer
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/home/dashboard',
  }
];

@NgModule({
  imports: [RouterModule.forChild(HOME_ROUTES)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
