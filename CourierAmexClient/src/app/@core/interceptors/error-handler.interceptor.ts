import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { NgZone } from '@angular/core';

import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthService } from '@app/@core/services';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private zone: NgZone
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(catchError(err => {
        if ([401, 403].indexOf(err.status) !== -1) {
          this.authService.logout();
          this.zone.runOutsideAngular(() => {
            location.reload();
          });
        }

        throw err;
      }));
  }
}
