import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { DocumentPayTypeModel } from '../models/document-pay-type.model';
import { ConfigLoaderService, GenericService } from '@app/@core';
import { GenericResponse, PagedResponse, PaginationModel } from '@app/models';

@Injectable()
export class DocumentPayTypeService extends GenericService<DocumentPayTypeModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'DocumentPayType');
  }

  public override getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<DocumentPayTypeModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<DocumentPayTypeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  // public getByIdd$(companyId: number = 0): Observable<GenericResponse<DocumentPayTypeModel>> {
  //   const cid = companyId > 0 ? `&id=${companyId}` : '';
  //   return this.http.get<GenericResponse<DocumentPayTypeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?ps=${cid}`);
  // }



}
