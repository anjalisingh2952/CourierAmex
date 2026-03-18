import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { ZoneModel } from "../models";

@Injectable()
export class ZoneService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Zone';

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

  public getById$(id: number): Observable<GenericResponse<ZoneModel>> {
    return this.http.get<GenericResponse<ZoneModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, countryId: number = 0, stateId: number = 0): Observable<PagedResponse<ZoneModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = countryId > 0 ? `&cid=${countryId}` : '';
    const sid = stateId > 0 ? `&sid=${stateId}` : '';
    return this.http.get<PagedResponse<ZoneModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}${sid}`);
  }

  public create$(entity: ZoneModel): Observable<GenericResponse<ZoneModel>> {
    return this.http.post<GenericResponse<ZoneModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<ZoneModel>> {
    return this.http.delete<GenericResponse<ZoneModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: ZoneModel): Observable<GenericResponse<ZoneModel>> {
    return this.http.put<GenericResponse<ZoneModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
