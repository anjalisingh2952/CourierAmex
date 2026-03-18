import { PACKAGES_CONTAINERS } from "./package";
import { PackageInventoryComponent } from "./package-inventory/package-inventory.component";
import { HasInvoiceMaintenanceComponent } from "./has-invoice-maintenance/has-invoice-maintenance.component";
import { PriceImageMaintenanceComponent } from "./price-image-maintenance/price-image-maintenance.component";
export const PACKAGE_CONTAINERS = [
  PACKAGES_CONTAINERS,
  PackageInventoryComponent,
  HasInvoiceMaintenanceComponent,
  PriceImageMaintenanceComponent
];

export * from './package';
export * from './package-inventory/package-inventory.component'
export * from './has-invoice-maintenance/has-invoice-maintenance.component'
export * from './price-image-maintenance/price-image-maintenance.component'