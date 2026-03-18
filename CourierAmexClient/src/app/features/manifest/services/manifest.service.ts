import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { lastValueFrom, Observable } from "rxjs";

import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService, GenericService } from "@app/@core";
import { BagInfo, CountManifestScanner, ManifestModel, ManifestScanner, PackageReassign, PendingPackages, RouteInsertModel, ScanLog, ScannedPackageInfo } from "@app/models/manifest.model";
import { ManifestPreAlert } from "@app/features/package/models/PreStudy-PreAlert.model";
import { PackageItem_PreviousReport } from "@app/features/package/models/package-item.model";

@Injectable()
export class ManifestService extends GenericService<ManifestModel> {
  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Manifest');
  }


  public override getPaged$(pagination: PaginationModel, companyId: number = 0, showClosed: boolean = false, shipTypeId: number = -1): Observable<PagedResponse<ManifestModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '&c=';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '&s=';
    const cid = companyId > 0 ? `&cid=${companyId}` : '&cid=0';
    const st = showClosed ? `&st=1` : '&st=0';
    const sti = `&sti=${shipTypeId}`;
    return this.http.get<PagedResponse<ManifestModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${st}${sti}`);
  }

  public getModel$(pagination: PaginationModel, companyId: number = 0, showClosed: boolean = false): Observable<ManifestModel[]> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const st = showClosed ? `&st=1` : '';
    return this.http.get<ManifestModel[]>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${st}`);
  }

  public open$(id: string | number): Observable<GenericResponse<ManifestModel>> {
    return this.http.patch<GenericResponse<ManifestModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Open?id=${id}`, null);
  }

  public GetManifestScanner(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<ManifestScanner>> {
    //debugger;
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<ManifestScanner>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetManifestScanner?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public GetManifestScannerAll(companyId: number = 0): Observable<PagedResponse<ManifestScanner>> {
    //debugger;
    const ps = 0;
    const pi = 1;
    const c = '';
    const s = '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<ManifestScanner>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetManifestScanner?ps=${ps}&pi=${pi}${c}${s}${cid}`);
  }

  public GetPendingPackages(pagination: PaginationModel, ManifestNumber: string): Observable<PagedResponse<PendingPackages>> {
    //debugger;
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = ManifestNumber != '' ? `&mn=${ManifestNumber}` : '';
    return this.http.get<PagedResponse<PendingPackages>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetPendingPackages?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public GetCountManifestScanner(ManifestNumber: string): Observable<GenericResponse<CountManifestScanner>> {
    return this.http.get<GenericResponse<CountManifestScanner>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetCountManifestScanner?mn=${ManifestNumber}`
    );
  }

  public GetFilterRouteSheet(manifestId: string, zoneCode: string, status: number, pageSize: number = 10, pageIndex: number = 1, filter: string = ''
  ): Observable<any> {
    return this.http.get<any>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetFilterRouteSheet?manifestId=${manifestId}&zoneCode=${zoneCode}&status=${status}
      &PageSize=${pageSize}&PageIndex=${pageIndex}&Filter=${filter}`
    );
  }


  public GetScannedPackage(packageNumber: string, manifestNumber: string): Observable<GenericResponse<ScannedPackageInfo>> {
    return this.http.get<GenericResponse<ScannedPackageInfo>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetScannedPackage?packageNumber=${packageNumber}&&manifestNumber=${manifestNumber}`
    );
  }

  public GetRouteSheetDetail(routeSheetId?: number, status?: number, companyId?: string, pageSize?: number, pageIndex?: number, filter?: string): Observable<any> {
    return this.http.get<any>(
      `${this.config?.apiUrl}v1/${this.endpoint}/RouteSheetDetail?routeSheetId=${routeSheetId}&&status=${status}&&companyId=${companyId}&page=${pageSize}&index=${pageIndex}&filter=${filter}`
    );
  }

  public GetPackageByRouteReport(routeSheetId?: number): Observable<any> {
    return this.http.get<any>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetPackageByRouteReport?routeSheetId=${routeSheetId}`
    );
  }

  public GetValidatePackageRoute(packageNumber?: number, roadMapId?: number): Observable<any> {
    return this.http.get<any>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetValidatePackageRoute?packageNumber=${packageNumber}&&roadMapId=${roadMapId}`
    );
  }

  public DeletePackageFromRouteMap(packageId?: number[], roadMapId?: number): Observable<any> {
    const body = { packageId, roadMapId };

    return this.http.delete<any>(`${this.config?.apiUrl}v1/${this.endpoint}/DeletePackageFromRouteMap`, { body });
  }

  insertRoute(routeData: RouteInsertModel): Observable<{ routeId: number }> {
    return this.http.post<{ routeId: number }>(`${this.config?.apiUrl}v1/${this.endpoint}/InsertRoute`, routeData);
  }

  public CreateScanLog(entity: ScanLog): Observable<GenericResponse<ScanLog>> {
    return this.http.post<GenericResponse<ScanLog>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/CreateScanLog`,
      entity
    );
  }

  public PackageScanUpdate(entity: any): Observable<GenericResponse<number>> {
    return this.http.put<GenericResponse<number>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/PackageScanUpdate`,
      entity
    );
  }

  public PackageReassignUpdate(entity: PackageReassign): Observable<GenericResponse<number>> {
    return this.http.put<GenericResponse<number>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/PackageReassignUpdate`,
      entity
    );
  }

  public UpdateRoadMapStatus(entity: any): Observable<GenericResponse<number>> {
    return this.http.post<GenericResponse<number>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/UpdateRoadMapStatus`,
      entity
    );
  }

  public GetBagInfo(bag: string): Observable<GenericResponse<BagInfo>> {
    return this.http.get<GenericResponse<BagInfo>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetBagInfo?bag=${bag}`
    );
  }

  public GetManifestId(packageNumber: string): Observable<GenericResponse<number>> {
    return this.http.get<GenericResponse<number>>(
      `${this.config?.apiUrl}v1/${this.endpoint}/GetManifestIdByPackageNumber?_packagenumber=${packageNumber}`
    );
  }

  public GetMasterGuide(ManifestId: any): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(`${this.config?.apiUrl}v1/AirGuide/GetMasterGuide?mId=${ManifestId}`);
  }

  public CreateOrUpdateMasterGuide(entity: any): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<ScanLog>>(`${this.config?.apiUrl}v1/AirGuide/CreateOrUpdateMasterGuide`, entity);
  }

  public CreateOrUpdateChildGuide(entity: any): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<ScanLog>>(`${this.config?.apiUrl}v1/AirGuide/CreateOrUpdateChildGuide`, entity);
  }

  public DeleteAirGuide(id: number, masterId: number, userId: string): Observable<GenericResponse<any>> {
    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/AirGuide/DeleteAirGuide`, null, { params: { Id: id, masterId: masterId, userId: userId } }
    );
  }

  public AssignManifestPackageToGuide(packageNumberList: number[], manifestId: number, childGuide: string, userId: string): Observable<GenericResponse<any>> {
    let params: { [key: string]: any } = {
      manifestId: manifestId,
      childGuide: childGuide,
      user: userId,
    };

    packageNumberList.forEach((num, index) => {
      params[`packageNumberList[${index}]`] = num;
    });

    return this.http.post<GenericResponse<any>>(
      `${this.config?.apiUrl}v1/AirGuide/AssignManifestPackageToGuide`,
      null,
      { params }
    );
  }

  public GetGuideDetailById(guideId: any): Observable<GenericResponse<number>> {
    return this.http.get<GenericResponse<number>>(`${this.config?.apiUrl}v1/AirGuide/GetGuideById?guideId=${guideId}`);
  }

  public GetDeliveryTypes(): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetDeliveryTypes`);
  }

  public GetManifestPreAlert(manifestNumber: string, companyId: number): Observable<PagedResponse<ManifestPreAlert>> {
    return this.http.get<PagedResponse<ManifestPreAlert>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetManifestPreAlert?manifestNumber=${manifestNumber}&companyId=${companyId}`);
  }

  public GetExcel_ManifestPreAlert(manifestNumber: string, companyId: number): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetExcel_ManifestPreAlert?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public GetExcel_ManifestReport(manifestNumber: string, companyId: number): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetExcel_ManifestReport?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public GetExcel_ManifestReportObservation(manifestNumber: string, companyId: number): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetExcel_ManifestReportObservation?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public GetRoadMapsReport(roadMapId: number, companyId: number): Observable<PagedResponse<any>> {
    return this.http.get<PagedResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}/GetRoadMapsReport?roadMapId=${roadMapId}&companyId=${companyId}`);
  }

  public PrepareRoadMapReport(roadMapId: number, companyId: number): Observable<any> {
    return this.http.get(
      `${this.config?.apiUrl}v1/${this.endpoint}/PrepareRoadMapReport?roadMapId=${roadMapId}&companyId=${companyId}`,
      { responseType: 'json' }
    );
  }
  public getManifestPackage(manifestId: any): Observable<any> {
    //manifestId = "330-29285804";
    return this.http.get(
      `${this.config?.apiUrl}v1/Package/ManifestPackage?manifestNumber=${manifestId}`);
  }

  public AddManifestPackage(entity: any): Observable<any> {
    //Endpoint : api/v1/Manifest/AddManifestPackage
    return this.http.post(
      `${this.config?.apiUrl}v1/Manifest/AddManifestPackage`, entity);
  }

  public InsertNotification(entity: any): Observable<any> {
    return this.http.post(
      `${this.config?.apiUrl}v1/Manifest/InsertNotification`, entity);
  }


  public unassignPackage(entity: any): Observable<any> {
    //Endpoint : a/Package/unassign-package'
    return this.http.post(
      `${this.config?.apiUrl}v1/Package/unassign-package`, entity);
  }
  //int PackageNumber , [FromQuery] int companyId, [FromQuery] string lableDimensions, [FromQuery] string docType
  // SERVICE - clean and pure
  public getWebPrintJobUrl(packageId: number, companyId: number, labelDimensions: string, docType: string): string {
    return `${this.config?.apiUrl}/v1/Print/GetWebPrintJob?PackageNumber=${encodeURIComponent(packageId)}&companyId=${encodeURIComponent(companyId)}&labelDimensions=${encodeURIComponent(labelDimensions)}&docType=${encodeURIComponent(docType)}`;
  }

  public BulkSendPackageNotification(entity: any): Observable<any> {
    return this.http.post(`${this.config?.apiUrl}v1/Inventory/bulk-send-package-notification`, entity);
  }
}
