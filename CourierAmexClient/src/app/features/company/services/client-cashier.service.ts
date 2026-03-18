import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";
import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { CashierModel, ClientCategoryModel, UserByPointOfSaleModel } from "../models";

@Injectable()
export class ClientCashierService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Cashier';

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

  public getById$(id: number): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<ClientCategoryModel>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    const cid = companyId > 0 ? `&cid=${companyId}` : '';
    return this.http.get<PagedResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
  }

  public create$(entity: CashierModel): Observable<GenericResponse<CashierModel>> {
    return this.http.post<GenericResponse<CashierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: number): Observable<GenericResponse<CashierModel>> {
    return this.http.delete<GenericResponse<CashierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: CashierModel): Observable<GenericResponse<CashierModel>> {
    return this.http.put<GenericResponse<CashierModel>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public getUserByPointOfSale(companyId: number, pointOfSaleId: number): Observable<UserByPointOfSaleModel[]> {
    return this.http.get<UserByPointOfSaleModel[]>(
      `${this.config?.apiUrl}v1/${this.endpoint}/UserByPointOfSaleId?companyId=${companyId}&pointOfSaleId=${pointOfSaleId}`
    );
  }

  public insertUserToCashier(userList: any): Observable<any> {
    return this.http.post<any>(
      `${this.config?.apiUrl}v1/${this.endpoint}/InsertUserToCashier`,
      userList
    );
  }
}
