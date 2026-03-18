import { ForgotContainer } from "./forgot/forgot.container";
import { LoginContainer } from "./login/login.container";
import { ResetContainer } from "./reset/reset.container";

export const AUTH_CONTAINERS = [
  ForgotContainer,
  LoginContainer,
  ResetContainer
];

export * from './forgot/forgot.container';
export * from './login/login.container';
export * from './reset/reset.container';

