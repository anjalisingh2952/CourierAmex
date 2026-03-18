import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CountryModel, StateModel, AreaModel, newAreaModel, ZoneModel } from '@app/features/general/models';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { AreaService } from '@app/features/general/services';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'area-details',
  templateUrl: './area-details.container.html'
})
export class AreaDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<AreaModel>({ ...newAreaModel });
  entity$ = this._entity.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  readonly states$: Observable<StateModel[]>;
  readonly zones$: Observable<ZoneModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private areaService: AreaService,
    private commonService: CommonService,
    private messages: MessageService
  ) {
    const $selectedCountry = this.entity$.pipe(
      map((state: AreaModel) => ({ countryId: state.countryId })),
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

    const $selectedState = this.entity$.pipe(
      map((state: AreaModel) => ({ stateId: state.stateId })),
      distinctUntilChanged((prev, curr) => prev.stateId === curr.stateId)
    );

    this.zones$ = $selectedState.pipe(
      distinctUntilChanged((prev, curr) => prev.stateId === curr.stateId),
      filter(state => state?.stateId !== undefined),
      exhaustMap(state => this.commonService.getZones$(state.stateId ?? 0)
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

  save(entity: AreaModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<AreaModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['general', 'area-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.areaService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.areaService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['general', 'areas']);
  }

  onLoadStates(id: number | undefined): void {
    this._entity.next({
      ...this._entity.value,
      countryId: id,
      stateId: undefined
    });
  }

  onLoadZones(id: number | undefined): void {
    this._entity.next({
      ...this._entity.value,
      stateId: id,
      zoneId: undefined
    });
  }

  private loadEntity(id: number): void {
    if (id >= 0) {
      this.loading.show();

      this.areaService.getById$(id)
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
