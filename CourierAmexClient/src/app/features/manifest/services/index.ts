import { PackageService } from '@app/features/package';
import { ManifestService } from './manifest.service';
import { CustomerService } from '@app/features/customer';
import { AreaService, ZoneService } from '@app/features/general';
import { ReportsService } from '@app/features/reports/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '@app/features/payment/services';

export const MANIFEST_SERVICES = [
  ManifestService,
  PackageService,
  CustomerService,
  ZoneService,
  ReportsService,
  NgbActiveModal,
  AreaService,
  PaymentService
];

export * from './manifest.service';
