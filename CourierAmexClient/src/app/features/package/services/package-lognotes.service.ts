import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from 'rxjs'; 

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
// import { PackageModel } from "../models";
import { PackageLogNotesModel } from "../models/package-lognotes.model";

//import { PackageCategoryComponent } from "../containers/package-category/package-category.component";

@Injectable()
export class PackageLogNotesService extends GenericService<PackageLogNotesModel> {
   
    constructor(
        configService : ConfigLoaderService,
        http: HttpClient
    ) {
        super(configService, http, 'PackageLogNotes');
    }
    public override getPaged$(pagination: PaginationModel, companyId: number = 0, customerCode?: string, packageNumber?: number ): Observable<PagedResponse<PackageLogNotesModel>> {
        const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
        const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
        const cid = companyId > 0 ? `&cid=${companyId}` : '';
        const custCode = customerCode || "";
        const pckgNumber = packageNumber || 0;
        return this.http.get<PagedResponse<PackageLogNotesModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}&codigoCliente=${custCode}&numeroPckg=${pckgNumber}`);
    }
}