import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageEventModel, PackageModel, PackagePriceUpdate, RegisterBagPackagingRequest } from "../models";
import { PackageCategoryModel } from "../models";


@Injectable()
export class HasInvoiceMaintenanceService extends GenericService<PackageModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Package');
  }


  public getPackagesByInvoiceStatus(companyId: number, searchBy: string): Observable<GenericResponse<any>> {
    const body = { companyId,searchBy };
    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetPackagesByInvoiceStatus`,body
    );
  }
  public UpdatePackageInvoiceStatus(companyId: number, hasInvoice: number,packageId:number): Observable<GenericResponse<any>> {
    const body = { companyId,hasInvoice,packageId };

    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/UpdatePackageInvoiceStatus`,body
    );
  }


}