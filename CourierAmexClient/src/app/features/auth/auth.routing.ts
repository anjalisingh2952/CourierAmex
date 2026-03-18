import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as containers from './containers';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: containers.LoginContainer
  },
  {
    path: 'forgot',
    component: containers.ForgotContainer
  },
  {
    path: 'reset',
    component: containers.ResetContainer
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/auth/login',
  }
];

@NgModule({
  imports: [RouterModule.forChild(AUTH_ROUTES)],
  exports: [RouterModule],
})
export class AuthRoutingModule { }
