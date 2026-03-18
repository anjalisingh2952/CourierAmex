import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { map, Observable, of, Subject, takeUntil } from "rxjs";

import { ConfigModel, Credentials, ForgotRequest, GenericResponse, LoginRequest, ResetRequest, UserSessionModel } from "@app/models";
import { ConfigLoaderService } from "./config-loader.service";
import { CredentialsService } from "./credentials.service";

@Injectable()
export class AuthService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private configService: ConfigLoaderService,
    private credentialsService: CredentialsService,
    private http: HttpClient
  ) {
    this.configService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => this.config = config);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(context: LoginRequest): Observable<Credentials | undefined> {
    const request = { email: context.email, password: context.password };
    return this.http.post<GenericResponse<Credentials>>(`${this.config?.apiUrl}authenticate/login`, request)
      .pipe(
        map((response: GenericResponse<Credentials>) => {
          if (response?.success && response?.data) {
            this.credentialsService.setCredentials(
              { accessToken: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user }
            );

            return this.credentialsService.credentials;
          } else {
            return undefined;
          }
        })
      );
  }

  forgot(context: ForgotRequest): Observable<GenericResponse<boolean>> {
    const request = { email: context.email };
    return this.http.post<GenericResponse<boolean>>(`${this.config?.apiUrl}authenticate/forgot`, request);
  }

  getUserByKey(key: string): Observable<GenericResponse<UserSessionModel>> {
    return this.http.get<GenericResponse<UserSessionModel>>(`${this.config?.apiUrl}authenticate/reset/${key}`);
  }

  reset(context: ResetRequest): Observable<GenericResponse<boolean>> {
    const request = { userId: context.userId, password: context.password };
    return this.http.put<GenericResponse<boolean>>(`${this.config?.apiUrl}authenticate/reset`, request);
  }

  logout(): Observable<boolean> {
    this.credentialsService.setCredentials();
    return of(true);
  }
}
