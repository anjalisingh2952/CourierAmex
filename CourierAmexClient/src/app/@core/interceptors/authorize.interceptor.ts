import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CredentialsService } from '../services';

@Injectable()
export class AuthorizeInterceptor implements HttpInterceptor {

  constructor(
    private credentialsService: CredentialsService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.credentialsService.isAuthenticated()) {
      const token = (this.credentialsService.credentials?.accessToken || '');
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}