import { ClientCashierService } from './client-cashier.service';
import { ClientCategoryService } from './client-category.service';
import { CommodityService } from './commodity.service';
import { CompanyService } from './company.service';
import { CustomerPayTypeService } from "./customer-pay-type.service";
import { DocumentTypeService } from "./document-type.service";
import { LocationService } from './location.service';
import { ProductService } from './product.service';
import { SupplierService } from './supplier.service';
import { DocumentPayTypeService } from "./document-pay-type.service";
import { CurrencyService } from "./currency.service";
import { BankService } from "./bank.service";
import { PaymentTypeService } from './payment-type.service';
import { PaymentService } from '@app/features/payment/services';
import { UserService } from '@app/features/user';

export const COMPANY_SERVICES = [
  ClientCashierService,
  ClientCategoryService,
  CommodityService,
  CompanyService,
  CustomerPayTypeService,
  DocumentTypeService,
  LocationService,
  ProductService,
  SupplierService,
  DocumentPayTypeService,
  CurrencyService,  
  BankService, 
  PaymentTypeService,
  PaymentService,
  UserService
];

export * from './client-cashier.service';
export * from './client-category.service';
export * from './commodity.service';
export * from './company.service';
export * from './customer-pay-type.service';
export * from './document-type.service';
export * from './location.service';
export * from './product.service';
export * from './supplier.service';
export * from './document-pay-type.service';
export * from './currency.service';
export * from './bank.service';
export * from './payment-type.service';
