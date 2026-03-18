import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageItem_PreviousReport, PackageItemModel } from "../models/package-item.model";


@Injectable()
export class PackageItemService extends GenericService<PackageItemModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'PackageItem');
  }

  public getById(id: number = 0): Observable<GenericResponse<PackageItemModel>> {
    const _id = id > 0 ? `&id=${id}` : '';
    return this.http.get<GenericResponse<PackageItemModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?${_id}`);
  }

  public override getPaged$(pagination: PaginationModel, pnumber: number = 0): Observable<PagedResponse<PackageItemModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const p_number = pnumber > 0 ? `&pn=${pnumber}` : '';
    return this.http.get<PagedResponse<PackageItemModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${p_number}`);
  }

  public create(entity: any): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public update(entity: any): Observable<GenericResponse<any>> {
    return this.http.put<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete(id: number = 0): Observable<GenericResponse<any>> {
    const _id = id > 0 ? `&id=${id}` : '';
    return this.http.delete<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}${_id}`);
  }

  public getPagedPackageItems_PreviousReport(pagination: PaginationModel, manifestNumber: string, packageNumber: string, companyId: number): Observable<PagedResponse<PackageItem_PreviousReport>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const _manifestNumber = manifestNumber != '' ? `&manifestNumber=${manifestNumber}` : `&manifestNumber=''`;
    const _packageNumber = packageNumber != '' ? `&packageNumbers=${packageNumber}` : `&packageNumbers=''`;
    const _companyId = companyId > 0 ? `&companyId=${companyId}` : '&companyId=0';
    return this.http.get<PagedResponse<PackageItem_PreviousReport>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetPackageItems-PreStudy?manifestNumber=${manifestNumber}&packageNumbers=${packageNumber}&companyid=${companyId}`);
    //ps=${pagination.ps}&pi=${pagination.pi}${c}${s}&
  }

  public getExcel_PackageItems_PreviousReport(manifestNumber: string, packageNumber: string, companyId: number): Observable<Blob> {
    const _manifestNumber = manifestNumber != '' ? `&manifestNumber=${manifestNumber}` : `&manifestNumber=''`;
    const _packageNumber = packageNumber != '' ? `&packageNumbers=${packageNumber}` : `&packageNumbers=''`;
    const _companyId = companyId > 0 ? `&companyId=${companyId}` : '&companyId=0';
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetExcel-PackageItems-PreStudy?manifestNumber=${manifestNumber}&packageNumbers=${packageNumber}&companyid=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public updateBillingDetails(entity: PackageItem_PreviousReport): Observable<GenericResponse<number>> {
    return this.http.put<GenericResponse<number>>(`${this.config?.apiUrl}v1/${this.endpoint}/UpdateBillingDetails`, entity);
  }
}