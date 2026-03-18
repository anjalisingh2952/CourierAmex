import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";

import { Observable, Subject, takeUntil } from "rxjs";

import { ConfigModel, GenericResponse } from "@app/models";
import { ConfigLoaderService } from "@app/@core";
import { ControlCodeModel } from "../models";

@Injectable()
export class ControlCodeService implements OnDestroy {
  private config?: ConfigModel;
  private destroy$ = new Subject<void>();

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

  getAll$(): Observable<GenericResponse<ControlCodeModel[]>> {
    return this.http.get<GenericResponse<ControlCodeModel[]>>(`${this.config?.apiUrl}v1/SystemSetting/All`);
  }

  bulk$(settings: ControlCodeModel[]): Observable<GenericResponse<boolean>> {
    return this.http.put<GenericResponse<boolean>>(`${this.config?.apiUrl}v1/SystemSetting/Bulk`, settings);
  }
}
