import { AREAS_CONTAINERS } from "./areas";
import { CONTROLCODES_CONTAINERS } from "./control-codes";
import { COUNTRY_CONTAINERS } from "./countries";
import { PACKAGESTATUS_CONTAINERS } from "./package-status";
import { SHIPPINGWAYTYPE_CONTAINERS } from "./shipping-way-types";
import { STATE_CONTAINERS } from "./states";
import { ZONE_CONTAINERS } from "./zones";

export const GENERAL_CONTAINERS = [
  ...AREAS_CONTAINERS,
  ...CONTROLCODES_CONTAINERS,
  ...COUNTRY_CONTAINERS,
  ...PACKAGESTATUS_CONTAINERS,
  ...SHIPPINGWAYTYPE_CONTAINERS,
  ...STATE_CONTAINERS,
  ...ZONE_CONTAINERS,
];

export * from './areas';
export * from './control-codes';
export * from './countries';
export * from './package-status';
export * from './shipping-way-types';
export * from './states';
export * from './zones';
