import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Subject, filter, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CompanyModel, LocationModel, newLocationModel } from '@app/features/company/models';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { LocationService } from '@app/features/company/services';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'location-details',
  templateUrl: './location-details.container.html'
})
export class LocationDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<LocationModel>({ ...newLocationModel });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private locationService: LocationService,
    private messages: MessageService
  ) {
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

  save(entity: LocationModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<LocationModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'location-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.locationService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.locationService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'location-list']);
  }

  onCompanyChange(id: number | undefined): void {
    const cia = this._companies.value.find(c => c.id === id);
    this._entity.next({
      ...this._entity.value,
      companyId: id,
      countryId: cia?.countryId ?? undefined
    });
  }

  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.locationService.getById$(id)
        .pipe(
          filter((res) => !!res && !!res.success && !!res.data),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              const entity = res.data;
              this._entity.next({
                ...entity
              });
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
