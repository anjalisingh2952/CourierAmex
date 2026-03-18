import { AreaService } from "./area.service";
import { ControlCodeService } from "./control-code.service";
import { CountryService } from "./country.service";
import { PackageStatusService } from './package-status.service';
import { ShippingWayTypeService } from "./shipping-way-type.service";
import { StateService } from "./state.service";
import { ZoneService } from "./zone.service";

export const GENERAL_SERVICES = [
  AreaService,
  ControlCodeService,
  CountryService,
  PackageStatusService,
  ShippingWayTypeService,
  StateService,
  ZoneService,
];

export * from './area.service';
export * from './control-code.service';
export * from './country.service';
export * from './package-status.service';
export * from './shipping-way-type.service';
export * from './state.service';
export * from './zone.service';
