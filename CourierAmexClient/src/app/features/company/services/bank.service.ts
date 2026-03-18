import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, PagedResponse } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { BankModel } from "../models/bank.model";
import { BrandModel } from "../models/brand.model";

@Injectable()
export class BankService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Bank';

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

  public getByCompany$(companyId: number = 0): Observable<PagedResponse<BankModel>> {
    const cid = companyId > 0 ? `?cid=${companyId}` : '';
    return this.http.get<PagedResponse<BankModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/${cid}`);
  }

  public getBrandByCompany$(companyId: number = 0): Observable<PagedResponse<BrandModel>> {
    const cid = companyId > 0 ? `?cid=${companyId}` : '';
    return this.http.get<PagedResponse<BrandModel>>(`${this.config?.apiUrl}v1/${this.endpoint}/Brand/${cid}`);
  }
}
