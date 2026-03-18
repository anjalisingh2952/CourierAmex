import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from 'rxjs'; 

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageNotesModel } from "../models/package-notes.model";


@Injectable()
export class PackageNotesService extends GenericService<any> {
   
    constructor(
        configService : ConfigLoaderService,
        http: HttpClient
    ) {
        super(configService, http, 'PackageNotes');
    }
    public override getPaged$(pagination: PaginationModel, companyId: number = 0, customerCode?: string, courierNumber?: string ): Observable<PagedResponse<any>> {
        const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
        const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
        const cid = companyId > 0 ? `&cid=${companyId}` : '';
        const custCode = customerCode || "";
        const courNumber = courierNumber || "";
        return this.http.get<PagedResponse<PackageNotesModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}&codigoCliente=${custCode}&numeroCourier=${courNumber}`);
    }
}