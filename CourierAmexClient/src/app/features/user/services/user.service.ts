import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ConfigLoaderService, GenericService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { ChangePasswordModel, UserModel } from '../models';

@Injectable()
export class UserService extends GenericService<UserModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'User');
  }

  createPassword$(id: string, password: string): Observable<GenericResponse<boolean>> {
    const data = {
      userId: id,
      password: password
    }
    return this.http.patch<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/User/Password`, data);
  }

  changePassword$(entity: ChangePasswordModel): Observable<GenericResponse<boolean>> {
    return this.http.patch<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/User/ChangePassword`, entity);
  }
}
