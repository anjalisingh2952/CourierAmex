import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./features/auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'company',
        loadChildren: () =>
          import('./features/company/company.module').then(m => m.CompanyModule),
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./features/customer/customer.module').then(m => m.CustomerModule),
      },
      {
        path: 'error',
        loadChildren: () =>
          import('./features/error/error.module').then(m => m.ErrorModule),
      },
      {
        path: 'general',
        loadChildren: () =>
          import('./features/general/general.module').then(m => m.GeneralModule),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./features/home/home.module').then(m => m.HomeModule),
      },
      {
        path: 'manifest',
        loadChildren: () =>
          import('./features/manifest/manifest.module').then(m => m.ManifestModule),
      },
      {
        path: 'invoice',
        loadChildren: () =>
          import('./features/invoice/invoice.module').then(m => m.InvoiceModule),
      },
      {
        path: 'package',
        loadChildren: () =>
          import('./features/package/package.module').then(m => m.PackageModule),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./features/user/user.module').then(m => m.UserModule),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('./features/payment/payment.module').then(m => m.PaymentModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then(m => m.ReportsModule),
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/home/dashboard',
      },
      {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
          import('./features/error/error.module').then(m => m.ErrorModule),
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
