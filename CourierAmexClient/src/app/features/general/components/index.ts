import { AREAS_COMPONENTS } from './areas';
import { CONTROLCODES_COMPONENTS } from './control-codes';
import { COUNTRY_COMPONENTS } from './countries';
import { PACKAGESTATUS_COMPONENTS } from "./package-status";
import { SHIPPINGWAYTYPES_COMPONENTS } from './shipping-way-types';
import { STATES_COMPONENTS } from './states';
import { ZONES_COMPONENTS } from './zones';

export const GENERAL_COMPONENTS = [
  ...AREAS_COMPONENTS,
  ...CONTROLCODES_COMPONENTS,
  ...COUNTRY_COMPONENTS,
  ...PACKAGESTATUS_COMPONENTS,
  ...SHIPPINGWAYTYPES_COMPONENTS,
  ...STATES_COMPONENTS,
  ...ZONES_COMPONENTS
];

export * from './areas';
export * from './control-codes';
export * from './countries';
export * from './package-status';
export * from './shipping-way-types';
export * from './states';
export * from './zones';
