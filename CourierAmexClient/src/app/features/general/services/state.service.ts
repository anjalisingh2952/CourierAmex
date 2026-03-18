import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { StateModel } from "../models";

@Injectable()
export class StateService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'State';

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

  public getById$(id: number): Observable<GenericResponse<StateModel>> {
    return this.http.get<GenericResponse<StateModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, countryId: number = 0): Observable<PagedResponse<StateModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = countryId > 0 ? `&cid=${countryId}` : '';
    return this.http.get<PagedResponse<StateModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public create$(entity: StateModel): Observable<GenericResponse<StateModel>> {
    return this.http.post<GenericResponse<StateModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<StateModel>> {
    return this.http.delete<GenericResponse<StateModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: StateModel): Observable<GenericResponse<StateModel>> {
    return this.http.put<GenericResponse<StateModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
