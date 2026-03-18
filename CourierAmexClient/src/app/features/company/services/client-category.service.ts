import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { ClientCategoryModel } from "../models";

@Injectable()
export class ClientCategoryService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'ClientCategory';

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

  public getById$(id: number): Observable<GenericResponse<ClientCategoryModel>> {
    return this.http.get<GenericResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<ClientCategoryModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public create$(entity: ClientCategoryModel): Observable<GenericResponse<ClientCategoryModel>> {
    return this.http.post<GenericResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<ClientCategoryModel>> {
    return this.http.delete<GenericResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: ClientCategoryModel): Observable<GenericResponse<ClientCategoryModel>> {
    return this.http.put<GenericResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }
}
