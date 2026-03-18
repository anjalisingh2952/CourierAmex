import { CUSTOMERS_COMPONENTS } from './customers';
import { PackageDetailComponent } from './package-detail/package-detail.component';
export const CUSTOMER_COMPONENTS = [
  ...CUSTOMERS_COMPONENTS,
  PackageDetailComponent,
];

export * from './customers';
export * from './package-detail/package-detail.component'
