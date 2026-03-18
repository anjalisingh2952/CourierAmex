import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CountryModel, StateModel, ZoneModel, newZoneModel } from '@app/features/general/models';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { ZoneService } from '@app/features/general/services';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'zone-details',
  templateUrl: './zone-details.container.html'
})
export class ZoneDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<ZoneModel>({ ...newZoneModel });
  entity$ = this._entity.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  readonly states$: Observable<StateModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private zoneService: ZoneService,
    private commonService: CommonService,
    private messages: MessageService
  ) {
    const $selectedCountry = this.entity$.pipe(
      map((state: ZoneModel) => ({ countryId: state.countryId })),
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId)
    );

    this.states$ = $selectedCountry.pipe(
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId),
      filter(state => state?.countryId !== undefined),
      exhaustMap(state => this.commonService.getStates$(state.countryId ?? 0)
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

  save(entity: ZoneModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<ZoneModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['general', 'zone-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.zoneService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.zoneService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['general', 'zones']);
  }

  onLoadStates(id: number | undefined): void {
    this._entity.next({
      ...this._entity.value,
      countryId: id,
      stateId: undefined
    });
  }

  private loadEntity(id: number): void {
    if (id >= 0) {
      this.loading.show();

      this.zoneService.getById$(id)
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
    this._countries.next([]);

    this.commonService.getCountries$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._countries.next(res);
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }
}
