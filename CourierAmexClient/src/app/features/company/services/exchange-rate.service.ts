import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";
import { ExchangeModel, ExchangeListModel } from '../models/exchange-rate.model';
import { ConfigModel, GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { ConfigLoaderService } from "@app/@core";

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'SystemSetting';
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

  public PostExchangeRate(entity: ExchangeModel): Observable<GenericResponse<ExchangeModel>> {
    var exchangeRateBody = {
      "companyId": entity.companyId,
      "sourceCurrencyCode": String(entity.currencyCode),
      "destinationCurrency": "DOLLARS",
      "saleRate": entity.saleRate,
      "purchaseRate": entity.purchaseRate,
      "date": entity.date
    };

    return this.http.post<GenericResponse<ExchangeModel>>(
      `${this.config?.apiUrl}v1/ExchangeRate/ExchangeRate`, exchangeRateBody);
  }
  public saveExchangeRate$(entity: ExchangeModel): Observable<GenericResponse<ExchangeModel>> {
    return this.http.post<GenericResponse<ExchangeModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/ExchangeRate`, entity);
  }

  public getUSDBuyRate(startDate: Date, endDate: Date): Observable<PagedResponse<ExchangeModel>> {
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
    return this.http.get<PagedResponse<ExchangeModel>>(`https://localhost:5005/api/v1/ExchangeRate/USDBuyRate?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`);
  }

  public getUSDSaleRate(startDate: Date, endDate: Date): Observable<PagedResponse<ExchangeModel>> {
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
    return this.http.get<PagedResponse<ExchangeModel>>(`https://localhost:5005/api/v1/ExchangeRate/USDSaleRate?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`);
  }
  public getExchangeRate(companyId:any,date?:string): Observable<PagedResponse<any>> {
    return this.http.get<PagedResponse<any>>(`${this.config?.apiUrl}v1/ExchangeRate/ExchangeRateHistory?companyId=${companyId}&date=${date}`);
  }
}
