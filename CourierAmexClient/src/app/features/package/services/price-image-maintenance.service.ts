import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageEventModel, PackageModel, PackagePriceUpdate, RegisterBagPackagingRequest } from "../models";
import { PackageCategoryModel } from "../models";


@Injectable()
export class PriceImageMaintenanceService extends GenericService<PackageModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Package');
  }


  public GetPendingBillingPackages(companyId: number): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetPendingBillingPackages?companyId=${companyId}`
    );
  }
  public UpdatePackageCommodityAndPrice(commodityId: number,price:number, modifiedBy: string,packageNumber:number): Observable<GenericResponse<any>> {
    const body = { commodityId,price,modifiedBy,packageNumber };
    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/UpdatePackageCommodityAndPrice`,body
    );
  }
  public GetActiveCommodities(companyId: number): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetActiveCommodities?companyId=${companyId}`
    );
  }
  public GetAttachmentUrlByCompanyId(companyId: number): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/Company/GetAttachmentUrlByCompanyId?companyId=${companyId}`
    );
  }


}
