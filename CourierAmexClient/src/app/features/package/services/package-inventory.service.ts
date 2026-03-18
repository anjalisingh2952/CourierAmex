import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageEventModel, PackageModel, PackagePriceUpdate, RegisterBagPackagingRequest } from "../models";
import { PackageCategoryModel } from "../models";


@Injectable()
export class PackageInventoryService extends GenericService<PackageModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Inventory');
  }


  public storeInventory(companyId: number, storeId: number): Observable<GenericResponse<any>> {

    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/store-inventory?companyId=${companyId}&storeId=${storeId}`
    );
  }
  public getstore(companyId: number, storeId: number): Observable<GenericResponse<any>> {

    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1//${this.endpoint}/store-inventory?companyId=${companyId}&storeId=${storeId}`
    );
  }
  public addIventoryPackage(storeId:number,packageNumber:number,userName:string,customerName:string,date:string): Observable<GenericResponse<any>> {
    const body = { storeId,packageNumber,userName,customerName,date };

    return this.http.post<GenericResponse<any>>( `${this.config?.apiUrl}v1/${this.endpoint}/insert-inventory-package`,body );
  }
  public deleteInventoryPackage(storeId: number, packageNumber: number, deleteAll: number): Observable<GenericResponse<any>> {
    const body = { storeId, packageNumber, deleteAll };
    return this.http.post<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}/delete-inventory-package`,
    body
    );
    }
  public resendPackageNotification(packageNumber:number,documentType:string): Observable<GenericResponse<any>> {
    const body = { packageNumber, documentType };
    return this.http.post<GenericResponse<any>>( `${this.config?.apiUrl}v1/${this.endpoint}/resend-package-notification`,body );
  }
  public GetExcel_StoreInventoryReport(companyId: number, storeId: number): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetExcel_StoreInventoryReport?companyId=${companyId}&storeId=${storeId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
   
  }
  public GetPDF_StoreInventoryReport(companyId: number, storeId: number): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetPDF_StoreInventoryReport?companyId=${companyId}&storeId=${storeId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
   
  }
  ///Inventory/store-inventory?companyId=2&storeId=8
  //http://localhost:4200/api/v1/Cashier/Paged?ps=25&pi=1&s=name%20ASC&cid=2
}
