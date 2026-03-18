import { AuthService } from "./auth.service";
import { BreadcrumbService } from "./breadcrumb.service";
import { CommonService } from "./common.service";
import { CredentialsService } from "./credentials.service";
import { LoadingService } from "./loading.service";
import { MessageService } from "./message.service";

export const CORE_SERVICES = [
  AuthService,
  BreadcrumbService,
  CommonService,
  CredentialsService,
  LoadingService,
  MessageService
];

export * from './auth.service';
export * from './breadcrumb.service';
export * from './common.service';
export * from './config-loader.service';
export * from './credentials.service';
export * from './generic.service';
export * from './loading.service';
export * from './message.service';
