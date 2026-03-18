import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DocumentTypeModel } from '../models/document-type.model';
import { ConfigLoaderService, GenericService } from '@app/@core';
import { PagedResponse, PaginationModel } from '@app/models';
import { Observable } from 'rxjs';

@Injectable()
export class DocumentTypeService extends GenericService<DocumentTypeModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'DocumentType');
  }

  public override getPaged$(pagination: PaginationModel, countryId: number = 0): Observable<PagedResponse<DocumentTypeModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = countryId > 0 ? `&cid=${countryId}` : '';
    return this.http.get<PagedResponse<DocumentTypeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

}
