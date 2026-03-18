import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { LocationModel } from "../models";
import { id } from "date-fns/locale";

@Injectable()
export class LocationService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Location';

  constructor(
    private configService: ConfigLoaderService,
    private http: HttpClient
  ) {
    this.configService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => this.config = config);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getByCompany$(companyId: number = 0, supplierId: number = 0): Observable<LocationModel[]> {
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    const sid = supplierId > 0 ? `&sid=${supplierId}` : '';
    return this.http.get<LocationModel[]>(`${this.config?.apiUrl}v1/${this.endpoint}/All/?${cid}${sid}`);
  }

  public getById$(id: number): Observable<GenericResponse<LocationModel>> {
    return this.http.get<GenericResponse<LocationModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, countryId: number = 0): Observable<PagedResponse<LocationModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = countryId > 0 ? `&cid=${countryId}` : '';
    return this.http.get<PagedResponse<LocationModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public create$(entity: LocationModel): Observable<GenericResponse<LocationModel>> {
    return this.http.post<GenericResponse<LocationModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<LocationModel>> {
    return this.http.delete<GenericResponse<LocationModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: LocationModel): Observable<GenericResponse<LocationModel>> {
    return this.http.put<GenericResponse<LocationModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
