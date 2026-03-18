import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { CountryModel } from "../models";

@Injectable()
export class CountryService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Country';

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

  public getById$(id: number): Observable<GenericResponse<CountryModel>> {
    return this.http.get<GenericResponse<CountryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel): Observable<PagedResponse<CountryModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    return this.http.get<PagedResponse<CountryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}`);
  }

  public create$(entity: CountryModel): Observable<GenericResponse<CountryModel>> {
    return this.http.post<GenericResponse<CountryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<CountryModel>> {
    return this.http.delete<GenericResponse<CountryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: CountryModel): Observable<GenericResponse<CountryModel>> {
    return this.http.put<GenericResponse<CountryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
