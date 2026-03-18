import { CLIENTCATEGORIES_CONTAINERS } from "./client-categories";
import { COMMODITIES_CONTAINERS } from "./commodities";
import { COMPANIES_CONTAINERS } from "./companies";
import { CUSTOMERPAYTYPE_CONTAINERS } from "./customer-pay-types";
import { DOCUMENTTYPE_CONTAINERS } from "./document-types";
import { LOCATIONS_CONTAINERS } from "./locations";
import { SUPPLIERS_CONTAINERS } from "./suppliers";
import { DOCUMENTPAYTYPE_CONTAINERS } from "./document-pay-types";
import { PAYMENTTYPE_CONTAINERS} from "./payment-types";


export const COMPANY_CONTAINERS = [
  ...CLIENTCATEGORIES_CONTAINERS,
  ...COMMODITIES_CONTAINERS,
  ...COMPANIES_CONTAINERS,
  ...CUSTOMERPAYTYPE_CONTAINERS,
  ...DOCUMENTTYPE_CONTAINERS,
  ...LOCATIONS_CONTAINERS,
  ...SUPPLIERS_CONTAINERS,
  ...DOCUMENTTYPE_CONTAINERS,
  ...DOCUMENTPAYTYPE_CONTAINERS,
  ...PAYMENTTYPE_CONTAINERS,
];

export * from './client-categories';
export * from './commodities';
export * from './companies';
export * from './customer-pay-types';
export * from './document-types';
export * from './locations';
export * from './suppliers';
export * from './document-pay-types';
export * from './payment-types';
