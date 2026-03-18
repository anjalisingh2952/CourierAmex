import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { PackageEventModel, PackageModel, PackagePriceUpdate, RegisterBagPackagingRequest } from "../models";
import { PackageCategoryModel } from "../models";


@Injectable()
export class PackageService extends GenericService<PackageModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Package');
  }

  public override getPaged$(pagination: PaginationModel, companyId: number = 0, statusId: number = 0): Observable<PagedResponse<PackageModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const sid = statusId > 0 ? `&sid=${statusId}` : '';
    return this.http.get<PagedResponse<PackageModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${sid}`);
  }

  public getPagedByManifest$(pagination: PaginationModel, companyId: number = 0, manifestId: number = 0): Observable<PagedResponse<any>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const mid = manifestId > 0 ? `&mid=${manifestId}` : '';

    return this.http.get<PagedResponse<PackageCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/PagedByManifest?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${mid}`);
  }

  public getPagedPriceByManifest$(pagination: PaginationModel, companyId: number = 0, manifestId: number = 0): Observable<PagedResponse<any>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const mid = manifestId > 0 ? `&mid=${manifestId}` : '';

    return this.http.get<PagedResponse<PackageCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/PagedPriceByManifest?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${mid}`);
  }

  public getByManifestAirGuide$(companyId: number = 0, manifestId: number = 0, airGuide: string = ""): Observable<PagedResponse<PackageCategoryModel>> {
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const mid = manifestId > 0 ? `&mid=${manifestId}` : '';
    const guide = airGuide == '' ? `&airGuide=${airGuide}` : '';

    return this.http.get<PagedResponse<PackageCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetByManifestAirGuide?${cid}${mid}${guide}`);
  }

  public getEventsPaged$(pagination: PaginationModel, companyId: number = 0, statusId: number = 0): Observable<PagedResponse<PackageEventModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<PackageEventModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/EventsPaged?ps=${pagination.ps}&pi=${(pagination.pi - 1)}${c}${s}${cid}`);
  }

  public CategoryUpdate$(entity: any): Observable<GenericResponse<PackageCategoryModel>> {
    return this.http.put<GenericResponse<PackageCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/CategoryUpdate`, entity);
  }

  public PackagePriceUpdate$(entity: any): Observable<GenericResponse<any>> {
    return this.http.put<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}/PackagePriceUpdateBulk`, entity);
  }

  public PackagePriceUpdateByNumber$(entity: PackagePriceUpdate): Observable<GenericResponse<string>> {
    return this.http.put<GenericResponse<string>>(`${this.config?.apiUrl}v1/${this.endpoint}/PackagePriceUpdate`, entity);
  }

  public classifyPackage(entity: any): Observable<GenericResponse<PackageModel>> {
    return this.http.post<GenericResponse<PackageModel>>(`${this.config?.apiUrl}v1/Package/ClassifyPackage`, entity);
  }

  public getPackageDetailByManifestId(manifestId: number): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(`${this.config?.apiUrl}v1/Package/GetPackageDetailByManifestId`, manifestId);
  }

  public create(entity: any): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public update(entity: any): Observable<GenericResponse<any>> {
    return this.http.put<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public getAirGuideByManifestId(manifestId: any) {
    return this.http.get<GenericResponse<any>>(`${this.config?.apiUrl}v1/AirGuide/GetAirGuideByManifestId`, manifestId);
  }

  public getAirGuideListByManifestIdAndCompanyId(manifestId: any) {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/Package/GetAirGuideManifest?manifestId=${manifestId}`
    );
  }

  public GetPackagedPackagesForAirGuides(airGuideId: any, manifestId: any, isPack: any) {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/Package/GetPackagedPackages?airGuideId=${airGuideId}&manifestId=${manifestId}&packed=${isPack}`
    );
  }

  public GetPackedPackagesForAirGuides(categorySelect: any, airGuideId: any, manifestId: any, isPack: any, pallet: any) {
    const url = pallet
      ? `${this.config?.apiUrl}v1/Package/GetPackedPackages?category=${categorySelect}&airGuideId=${airGuideId}&manifestId=${manifestId}&packed=${isPack}&pallet=${pallet}`
      : `${this.config?.apiUrl}v1/Package/GetPackedPackages?category=${categorySelect}&airGuideId=${airGuideId}&manifestId=${manifestId}&packed=${isPack}`;

    return this.http.get<GenericResponse<any>>(url);
  }

  public RegisterBagPackaging(request: RegisterBagPackagingRequest): Observable<GenericResponse<any[]>> {
    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/Package/RegisterBagPackaging`, request);
  }

  public GetNextReferenceAsync(packagingType: any, length: any) {
    return this.http.get<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/Package/GetNextReferenceAsync?packagingType=${packagingType}&length=${length}`
    );
  }

  public PackPackage(packageNumber: any, bagNumber: any, palet: any, manifestNumber: any, packageSubType: any, user: any, packageType: any) {
    debugger
    const url = packageType === 'consolidated' ? `${this.config?.apiUrl}v1/Package/PackPackageGuide?packageNumber=${packageNumber}&bagNumber=${bagNumber}&palet=${palet}&manifestNumber=${manifestNumber}&packageSubType=${packageSubType}&user=${user}&packageType=${packageType}`
      : `${this.config?.apiUrl}v1/Package/PackPackage?packageNumber=${packageNumber}&bagNumber=${bagNumber}&palet=${palet}&manifestNumber=${manifestNumber}&packageSubType=${packageSubType}&user=${user}&packageType=${packageType}`;

    return this.http.get<GenericResponse<any>>(url);
  }

  public GetByPackageNumber(companyId: number = 0, packageNumber: number = 0): Observable<GenericResponse<PackageModel>> {
    return this.http.get<GenericResponse<PackageModel>>(
      `${this.config?.apiUrl}v1/Package/GetByPackageNumber?cid=${companyId}&pn=${packageNumber}`
    );
  }

  public UnpackPackage(packageNumber: number, isConsolidated: boolean): Observable<GenericResponse<any>> {

    var url = isConsolidated ? `${this.config?.apiUrl}v1/Package/UnpackPackageConsolidated` : `${this.config?.apiUrl}v1/Package/UnpackPackage`;

    return this.http.post<GenericResponse<any>>(url, packageNumber);
  }
}
