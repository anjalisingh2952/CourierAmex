import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil, tap } from 'rxjs';
import Swal from 'sweetalert2';

import { CompanyModel, LocationModel, SupplierModel, newSupplierModel } from '@app/features/company/models';
import { LocationService, SupplierService } from '@app/features/company/services';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'supplier-details',
  templateUrl: './supplier-details.container.html'
})
export class SupplierDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<SupplierModel>({ ...newSupplierModel });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  readonly locations$: Observable<LocationModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private supplierService: SupplierService,
    private locationService: LocationService,
    private messages: MessageService
  ) {
    const $selectedCompany = this.entity$.pipe(
      map((state: SupplierModel) => ({ companyId: state.companyId, id: state.id })),
      filter(state => state?.companyId !== undefined),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId && prev.id === curr.id),
    );

    this.locations$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId && prev.id === curr.id),
      tap(() => this.loading.show()),
      exhaustMap(state => this.locationService.getByCompany$(state.companyId ?? 0, state.id ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.has('id')) {
          const id = params.get('id');
          this.loadEntity(id ? +id : 0);
        }
      });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCompanyChange(id: number | undefined): void {
    const cia = this._companies.value.find(c => c.id === id);
    this._entity.next({
      ...this._entity.value,
      companyId: id,
      countryId: cia?.countryId ?? undefined
    });
  }

  save(entity: SupplierModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<SupplierModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'supplier-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    if (entity.id === 0) {
      this.supplierService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.supplierService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'supplier-list']);
  }

  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.supplierService.getById$(id)
        .pipe(
          filter((res) => !!res && !!res.success && !!res.data),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              const entity = res.data;
              setTimeout(() => {
                this._entity.next({
                  ...entity
                });
              }, 100);
            }
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          }
        });
    } else {
      Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      this.goBack();
    }
  }

  private loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);

    this.commonService.getCompanies$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res);
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
}
