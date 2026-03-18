import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

import { Observable, Subject, takeUntil } from 'rxjs';

import { CurrencyModel } from '../models/currency.model';
import { ConfigLoaderService } from '@app/@core';
import { ConfigModel, PagedResponse } from '@app/models';

@Injectable()
export class CurrencyService implements OnDestroy {
    private config?: ConfigModel;
    private destroy$ = new Subject<void>();
    endpoint = 'Currency';
    
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

  public getByCompany$(companyId: number = 0): Observable<PagedResponse<CurrencyModel>> {
    const cid = companyId > 0 ? `?cid=${companyId}` : '';

    return this.http.get<PagedResponse<CurrencyModel>>(`${this.config?.apiUrl}v1/${this.endpoint}${cid}`);
  }


}
