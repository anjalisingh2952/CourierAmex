import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { SupplierModel } from "../models";

@Injectable()
export class SupplierService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Supplier';

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

  public getByCountry$(countryId: number = 0): Observable<GenericResponse<SupplierModel[]>> {
    const cid = countryId > 0 ? `?cid=${countryId}` : '';
    return this.http.get<GenericResponse<SupplierModel[]>>(`${this.config?.apiUrl}v1/${this.endpoint}/All/${cid}`);
  }

  public getById$(id: number): Observable<GenericResponse<SupplierModel>> {
    return this.http.get<GenericResponse<SupplierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, countryId: number = 0): Observable<PagedResponse<SupplierModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = countryId > 0 ? `&cid=${countryId}` : '';
    return this.http.get<PagedResponse<SupplierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public create$(entity: SupplierModel): Observable<GenericResponse<SupplierModel>> {
    return this.http.post<GenericResponse<SupplierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<SupplierModel>> {
    return this.http.delete<GenericResponse<SupplierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: SupplierModel): Observable<GenericResponse<SupplierModel>> {
    return this.http.put<GenericResponse<SupplierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
