import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { CustomerPayTypeModel } from '../models/customer-pay-type.model';
import { ConfigLoaderService, GenericService } from '@app/@core';
import { PagedResponse, PaginationModel } from '@app/models';

@Injectable()
export class CustomerPayTypeService extends GenericService<CustomerPayTypeModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'CustomerPayType');
  }

  public override getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<CustomerPayTypeModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<CustomerPayTypeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }
}
