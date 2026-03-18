import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';

import { AreaModel, ClientCategoryModel, CommodityModel, CompanyModel, CountryModel, CustomerModel, CustomerPayTypeModel, DocumentTypeModel, LocationModel, ModuleModel, PackageCategoryModel, PackageStatusModel, ShippingWayTypeModel, StateModel, SupplierModel, TemplateModel, ZoneModel } from '@app/features';
import { ConfigModel, GenericResponse, PagedResponse, PaginationModel, UserPermissionModel, ManifestModel, AirGuideModel } from '@app/models';
import { ConfigLoaderService } from './config-loader.service';

const CACHE_SIZE = 1;

@Injectable()
export class CommonService implements OnDestroy {
  private countriesCache$: Observable<CountryModel[]>;
  private companiesCache$: Observable<CompanyModel[]>;

  config?: ConfigModel;
  destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private configService: ConfigLoaderService,
  ) {
    this.configService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => this.config = config);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCompanies$(): Observable<CompanyModel[]> {
    if (!this.companiesCache$) {
      this.companiesCache$ = this.requestCompanies()
        .pipe(
          shareReplay(CACHE_SIZE)
        );
    }

    return this.companiesCache$;
  }

  getCountries$(): Observable<CountryModel[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.requestCountries()
        .pipe(
          shareReplay(CACHE_SIZE)
        );
    }

    return this.countriesCache$;
  }

  getStates$(countryId: number): Observable<StateModel[]> {
    return this.http.get<StateModel[]>(`${this.config?.apiUrl}v1/Common/States?id=${countryId}`);
  }

  getZones$(stateId: number): Observable<ZoneModel[]> {
    return this.http.get<ZoneModel[]>(`${this.config?.apiUrl}v1/Common/Zones?id=${stateId}`);
  }

  getAreas$(zoneId: number): Observable<AreaModel[]> {
    return this.http.get<AreaModel[]>(`${this.config?.apiUrl}v1/Common/Areas?id=${zoneId}`);
  }

  getSuppliers$(companyId: number): Observable<SupplierModel[]> {
    return this.http.get<SupplierModel[]>(`${this.config?.apiUrl}v1/Common/Suppliers?id=${companyId}`);
  }

  getLocations$(companyId: number, supplierId: number): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(`${this.config?.apiUrl}v1/Common/Locations?id=${companyId}&sid=${supplierId}`);
  }

  getDocumentTypes$(companyId: number): Observable<DocumentTypeModel[]> {
    return this.http.get<DocumentTypeModel[]>(`${this.config?.apiUrl}v1/Common/DocumentTypes?id=${companyId}`);
  }

  getCustomerPayTypes$(companyId: number): Observable<CustomerPayTypeModel[]> {
    return this.http.get<CustomerPayTypeModel[]>(`${this.config?.apiUrl}v1/Common/CustomerPayTypes?id=${companyId}`);
  }

  getCustomerCategories$(companyId: number): Observable<ClientCategoryModel[]> {
    return this.http.get<ClientCategoryModel[]>(`${this.config?.apiUrl}v1/Common/CustomerCategories?id=${companyId}`);
  }

  getShippingWayTypes$(shipType: number): Observable<ShippingWayTypeModel[]> {
    return this.http.get<ShippingWayTypeModel[]>(`${this.config?.apiUrl}v1/Common/ShippingWayTypes?id=${shipType}`);
  }

  getPackageStatus$(): Observable<PackageStatusModel[]> {
    return this.http.get<PackageStatusModel[]>(`${this.config?.apiUrl}v1/Common/PackageStatus`);
  }

  getCommodities$(companyId: number): Observable<CommodityModel[]> {
    return this.http.get<CommodityModel[]>(`${this.config?.apiUrl}v1/Common/Commodity?id=${companyId}`);
  }

  getPermissions$(): Observable<UserPermissionModel[]> {
    return this.http.get<UserPermissionModel[]>(`${this.config?.apiUrl}v1/Common/Permissions`);
  }

  validateUsername$(id: string, username: string): Observable<boolean> {
    const idParam = id.length > 0 ? `&id=${id}` : '';
    return this.http.get<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/Common/UsernameValidate?&username=${username}${idParam}`)
      .pipe(
        map((res: GenericResponse<boolean>) => { return (res?.success ?? false) })
      )
  }

  validateManifestNumber$(id: string, number: string): Observable<boolean> {
    const idParam = id.length > 0 ? `&id=${id}` : '';
    return this.http.get<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/Common/ManifestNumberValidate?&number=${number}${idParam}`)
      .pipe(
        map((res: GenericResponse<boolean>) => { return (res?.success ?? false) })
      )
  }

  getManifests$(pagination: PaginationModel, companyId: number = 0, showClosed: boolean, shipTypeId: number): Observable<PagedResponse<ManifestModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '&c=';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '&s=';
    const cid = companyId > 0 ? `&cid=${companyId}` : '&cid=0';
    const st = showClosed ? `&st=1` : '&st=0';
    const sti = `&sti=${shipTypeId}`;
    return this.http.get<PagedResponse<ManifestModel>>(`${this.config?.apiUrl}v1/Manifest/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${st}${sti}`);
  }

  getManifestsByPackageType$(companyId: string, State: number = 0, ManifestType: number, Type: string): Observable<any> {
    //debugger
    return this.http.get<any>(`${this.config?.apiUrl}v1/Manifest/GetManifestsByPackageType?companyId=${companyId}&State=${State}&ManifestType=${ManifestType}&Type=${Type}`);
  }

  getAirGuidesByManifest$(companyId: number = 0, manifestId: number = 0): Observable<AirGuideModel[]> { 
    return this.http.get<AirGuideModel[]>(`${this.config?.apiUrl}v1/AirGuide/Guides?mid=${manifestId}&cid=${companyId}`);
  }

  getPackagesByAirGuideManifestId$(companyId: number = 0, manifestId: number = 0, guideNumber = ''): Observable<PackageCategoryModel[]> {
    return this.http.get<PackageCategoryModel[]>(`${this.config?.apiUrl}v1/AirGuide/GetPackagesByAirGuideManifestId?mid=${manifestId}&gN=${guideNumber}&cId=${companyId}`);
  }
  getAirGuidesDetail$(AirGuideId: any , manifestId: number = 0): Observable<any> {
    
    return this.http.get<any>(`${this.config?.apiUrl}v1/Package/GetPackageDetailByManifestIdAndAirGuideId?airGuideId=${AirGuideId}&manifestId=${manifestId}`);
  }

  getShippingWayTypeList$(pagination: PaginationModel): Observable<PagedResponse<ShippingWayTypeModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    return this.http.get<PagedResponse<ShippingWayTypeModel>>(`${this.config?.apiUrl}v1/ShippingWayType/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}`);
  }

  validatePackageNumber$(id: number, number: number): Observable<boolean> {
    const idParam = id > 0 ? `&id=${id}` : '';
    return this.http.get<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/Common/PackageNumberValidate?&number=${number}${idParam}`)
      .pipe(
        map((res: GenericResponse<boolean>) => { return (res?.success ?? false) })
      )
  }

  validatePackageStatusCode$(id: string, code: string): Observable<boolean> {
    const idParam = id.length > 0 ? `&id=${id}` : `&id=0`;
    return this.http.get<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/Common/PackageStatusCodeValidate?&code=${code}${idParam}`)
      .pipe(
        map((res: GenericResponse<boolean>) => { return (res?.success ?? false) })
      )
  }

  validateCommodityCode$(id: number, companyId: number, code: string): Observable<boolean> {
    const idParam = id > 0 ? `&id=${id}` : '';
    const cid = companyId > 0 ? `&companyId=${companyId}` : '';
    return this.http.get<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/Common/CommodityCodeValidate?&code=${code}${idParam}${cid}`)
      .pipe(
        map((res: GenericResponse<boolean>) => { return (res?.success ?? false) })
      )
  }

  getCustomerByCode$(customerCode: string): Observable<GenericResponse<CustomerModel>> {
    return this.http.get<GenericResponse<CustomerModel>>(`${this.config?.apiUrl}v1/Customer/Code?&customerCode=${customerCode}`);
  }

  getCustomersPagedByCompany$(pagination: PaginationModel, companyId: number): Observable<PagedResponse<CustomerModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<CustomerModel>>(`${this.config?.apiUrl}v1/Customer/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  private requestCompanies(): Observable<CompanyModel[]> {
    return this.http.get<CompanyModel[]>(`${this.config?.apiUrl}v1/Common/Companies`);
  }

  private requestCountries(): Observable<CountryModel[]> {
    return this.http.get<CountryModel[]>(`${this.config?.apiUrl}v1/Common/Countries`);
  }

  getModulesByCompany$(companyId: number): Observable<ModuleModel[]> {
    return this.http.get<ModuleModel[]>(`${this.config?.apiUrl}v1/Module/?cid=${companyId}`);
  }

  getTemplatesByCompanyModule$(moduleId: string, companyId: number): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(`${this.config?.apiUrl}v1/Template/Module?mid=${moduleId}&cid=${companyId}`);
  }
}