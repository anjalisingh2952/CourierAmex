import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigLoaderService, GenericService } from '@app/@core';
import { CustomerModel } from '../models';
import { PagedResponse, PaginationModel } from '@app/models';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerService extends GenericService<CustomerModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Customer');
  }

  public getPagedByCompany$(pagination: PaginationModel, companyId: number): Observable<PagedResponse<CustomerModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<CustomerModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public getCustomerByCode$(code:string):Observable<any>{
    return this.http.get<any>(`${this.config?.apiUrl}v1/Customer/GetCustomerByCode?code=${code}`);
  }
  public getPackages$(packageNumber:number):Observable<any>{
    return this.http.get<any>(`${this.config?.apiUrl}v1/Package/GetPackageForCustomerService?id=${packageNumber}`);
    //return this.http.get<any>(`http://localhost:5000/api/v1/Package/SearchPackage?packageNumber=${packageNumber}&customerAccount=${customerAccount}&courierNumber=${courierNumber}`);
  }
  public getWebPrintJobUrl(packageId: number, companyId: number, labelDimensions: string, docType: string): string {
    return `https://localhost:5005/api/v1/Print/GetWebPrintJob?PackageNumber=${encodeURIComponent(packageId)}&companyId=${encodeURIComponent(companyId)}&labelDimensions=${encodeURIComponent(labelDimensions)}&docType=${encodeURIComponent(docType)}`;
  }
  public GetAll_customers_enabled$(companyId:number):Observable<any>{
    return this.http.get<any>(`${this.config?.apiUrl}v1/${this.endpoint}/GetAll_customers_enabled?companyId=${companyId}`);
  }
   public clients_credit_search$(companyId:number,filter:string):Observable<any>{
    return this.http.get<any>(`${this.config?.apiUrl}v1/${this.endpoint}/clients_credit_search?companyId=${companyId}&filter=${filter}`);
  }
  public disable_credit$(companyId:number,customerCode:string):Observable<any>{
    return this.http.delete<any>(`${this.config?.apiUrl}v1/${this.endpoint}/disable_credit?companyId=${companyId}&customerCode=${customerCode}`);
  }
  public enable_credit$(companyId:number,customerCode:string):Observable<any>{
    const body={companyId,customerCode};
    return this.http.post<any>(`${this.config?.apiUrl}v1/${this.endpoint}/enable_credit`,body);
  }
  /*
  https://localhost:5005/api/v1/Customer/enable_credit
Method-    [HttpPost("enable_credit")]

Req body- {
"customerCode": "PNM2003",
"companyId": 2
}
  Package/GetPackageForCustomerService?id=227526' \
  http://localhost:5000/api/v1/Package/SearchPackage
  Endpoint for SerachPackage- http://localhost:5000/api/v1/Package/SearchPackage
parameters- packageNumber ,
courierNumber ,
customerAccount
*/
}
