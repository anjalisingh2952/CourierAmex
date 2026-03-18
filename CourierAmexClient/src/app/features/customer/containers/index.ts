import { CUSTOMERS_CONTAINERS } from "./customers";
import { CustomerServiceComponent } from "./customer-service/customer-service.component"; 
import { EnabledCreditComponent } from "./enabled-credit/enabled-credit.component";
export const CUSTOMER_CONTAINERS = [
  ...CUSTOMERS_CONTAINERS,
  CustomerServiceComponent,
  EnabledCreditComponent
];

export * from './customers';
export * from './customer-service/customer-service.component';
export * from './enabled-credit/enabled-credit.component';