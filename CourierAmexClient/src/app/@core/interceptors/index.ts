import { AuthorizeInterceptor } from "./authorize.interceptor";
import { ErrorHandlerInterceptor } from "./error-handler.interceptor";

export const CORE_INTERCEPTOS = [
  AuthorizeInterceptor,
  ErrorHandlerInterceptor
];

export * from './authorize.interceptor';
export * from './error-handler.interceptor';

