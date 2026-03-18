import { CLIENTCATEGORIES_COMPONENTS } from "./client-categories";
import { COMMODITIES_COMPONENTS } from "./commodities";
import { COMPANIES_COMPONENTS } from "./companies";
import { CUSTOMERPAYTYPES_COMPONENTS } from './customer-pay-types';
import { DOCUMENTTYPES_COMPONENTS } from './document-types';
import { LOCATIONS_COMPONENTS } from "./locations";
import { SUPPLIERS_COMPONENTS } from "./suppliers";
import { PAYMENTTYPE_COMPONENTS} from "./payment-types"

export const COMPANY_COMPONENTS = [
  ...CLIENTCATEGORIES_COMPONENTS,
  ...COMMODITIES_COMPONENTS,
  ...COMPANIES_COMPONENTS,
  ...CUSTOMERPAYTYPES_COMPONENTS,
  ...DOCUMENTTYPES_COMPONENTS,
  ...LOCATIONS_COMPONENTS,
  ...SUPPLIERS_COMPONENTS,
  ...PAYMENTTYPE_COMPONENTS
];

export * from './client-categories';
export * from './commodities';
export * from './companies';
export * from './customer-pay-types';
export * from './document-types';
export * from './locations';
export * from './suppliers';
export * from './payment-types';
