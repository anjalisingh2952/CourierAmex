import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ConfigLoaderService, GenericService } from '@app/@core';
import { PagedResponse, PaginationModel } from '@app/models';
import { RoleModel } from '../models';

@Injectable()
export class RoleService extends GenericService<RoleModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Role');
  }

  public override getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<RoleModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<RoleModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }
}
