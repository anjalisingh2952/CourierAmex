import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from 'rxjs';

import { PaymentTypeModel } from "../models/payment-type.model";
import { ConfigLoaderService, GenericService } from "@app/@core";
import { PagedResponse, PaginationModel } from "@app/models";

@Injectable()
export class PaymentTypeService extends GenericService<PaymentTypeModel> {
   
    constructor(
        configService : ConfigLoaderService,
        http: HttpClient
    ) {
        super(configService, http, 'PaymentType');
    }
    public override getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<PaymentTypeModel>> {
        const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
        const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
        const cid = companyId > 0 ? `&cid=${companyId}` : '';
        return this.http.get<PagedResponse<PaymentTypeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
    }
}
