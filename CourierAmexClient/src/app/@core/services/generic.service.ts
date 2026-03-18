import { HttpClient } from '@angular/common/http';

import { Observable, Subject, takeUntil } from 'rxjs';

import { BaseEntity, ConfigModel, GenericResponse, PagedResponse, PaginationModel } from '@app/models';
import { ConfigLoaderService } from './config-loader.service';

export abstract class GenericService<T extends BaseEntity<string | number>> {
  config?: ConfigModel;
  destroy$ = new Subject<void>();

  constructor(
    public configService: ConfigLoaderService,
    public http: HttpClient,
    protected endpoint: string
  ) {
    this.configService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => this.config = config);
  }

  public getAll$(): Observable<T[]> {
    return this.http.get<T[]>(`${this.config?.apiUrl}v1/${this.endpoint}/All`);
  }

  public getById$(id: string | number): Observable<GenericResponse<T>> {
    return this.http.get<GenericResponse<T>>(`${this.config?.apiUrl}v1/${this.endpoint}/?id=${id}`);
  }

  public getPaged$(pagination: PaginationModel): Observable<PagedResponse<T>> {
    const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
    const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
    return this.http.get<PagedResponse<T>>(`${this.config?.apiUrl}v1/${this.endpoint}/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}`);
  }

  public create$(entity: T): Observable<GenericResponse<T>> {
    return this.http.post<GenericResponse<T>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

  public delete$(id: string | number): Observable<GenericResponse<T>> {
    return this.http.delete<GenericResponse<T>>(`${this.config?.apiUrl}v1/${this.endpoint}?id=${id}`);
  }

  public update$(entity: T): Observable<GenericResponse<T>> {
    return this.http.put<GenericResponse<T>>(`${this.config?.apiUrl}v1/${this.endpoint}`, entity);
  }

}
