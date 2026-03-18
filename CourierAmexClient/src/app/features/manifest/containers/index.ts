import { MANIFESTS_CONTAINERS } from "./manifest";
import { AIRCLASSIFY_CONTAINERS } from "./air-classify";
import { PACKAGESCANNING_CONTAINERS } from "./package-scanning";
import { ROUTESHEET_CONTAINERS } from "./manage-route-sheet";
import { REOPENROADMAP_CONTAINERS } from "./reopen-roadmap";


export const MANIFEST_CONTAINERS = [
  MANIFESTS_CONTAINERS,
  AIRCLASSIFY_CONTAINERS,
  PACKAGESCANNING_CONTAINERS,
  ROUTESHEET_CONTAINERS,
  REOPENROADMAP_CONTAINERS
];

export * from './manifest';
export * from './air-classify';
export * from './package-scanning';
export * from './manage-route-sheet';
export * from './reopen-roadmap';
