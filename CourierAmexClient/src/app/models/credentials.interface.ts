import { UserSessionModel } from "./user-session.interface";

export interface Credentials {
  accessToken: string;
  refreshToken: string;
  user: UserSessionModel
}
