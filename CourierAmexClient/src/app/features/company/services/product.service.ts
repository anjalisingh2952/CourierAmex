import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, filter, map, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { ProductModel } from "../models";

@Injectable()
export class ProductService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();
  endpoint = 'Product';

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

  public getByCompany$(companyId: number = 0): Observable<ProductModel[]> {
    const cid = companyId > 0 ? `?cid=${companyId}` : '';
    return this.http.get<ProductModel[]>(`${this.config?.apiUrl}v1/${this.endpoint}/Company/${cid}`);
  }
}
