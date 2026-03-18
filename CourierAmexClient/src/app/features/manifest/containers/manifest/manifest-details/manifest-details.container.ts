import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, catchError, combineLatest, finalize, map, merge, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';

import { CommonService, LoadingService, MessageService } from '@app/@core';
import { ManifestService } from '@app/features/manifest/services';
import { CompanyModel } from '@app/features/company/models';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';
import { ShippingWayTypeModel } from '@app/features/general';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { packageDetailModel } from '@app/features/package';

@Component({
  selector: 'manifests-manifest-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manifest-details.container.html'
})
export class ManifestDetailsContainer implements OnInit, OnDestroy {
  private readonly _shipTypeState = new BehaviorSubject<number>(0);
  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel});

  readonly shippingWayTypes$: Observable<ShippingWayTypeModel[]>;
  readonly companies$: Observable<CompanyModel[]>;
  readonly entity$: Observable<ManifestModel>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private manifestService: ManifestService,
    private messages: MessageService
  ) {
    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newManifestModel })))
        ),
        tap(seed => this._entityState.next(seed)),
      );
    this.companies$ = this.commonService.getCompanies$();
    this.shippingWayTypes$ = this._shipTypeState.asObservable()
      .pipe(
        switchMap(state => this.commonService.getShippingWayTypes$(state)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of([])))
        ));

    const merge$ = merge(entity$,this._entityState.asObservable());
    this.entity$ = combineLatest([merge$, this.companies$])
      .pipe(
        map(([entity, companyList]) => {
          const cia = companyList.find(c => c.id === entity.companyId);
          return { ...entity, address: cia?.address ?? ''};
        }),
      );
  }

  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    if (id === 0) {
      return of({ ...newManifestModel, shippingWay: 0, companyId: 0 });
    }

    return this.manifestService.getById$(id)
      .pipe(
        map((res) => {
          if (res?.data) {
            const entity = res?.data;
            this._shipTypeState.next(entity.shipType);
            return entity;
          }

          this._shipTypeState.next(0);

          return { ...newManifestModel };
        }));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  onCompanyChange(id: number | undefined): void {
    this._entityState.next({...this._entityState.value, companyId: id});
  }

  onUpdateShipType(entity: ManifestModel): void {
    this._shipTypeState.next(entity.shipType);
    this._entityState.next({...this._entityState.value, 
      shippingWay: 0,
      shipType: entity.shipType,
      companyId: entity.companyId,
      address: entity.address,
      manifestNumber: entity.manifestNumber,
      name: entity.name,
    });
  }

  onUpdateEntity(entity: ManifestModel): void {
    this._entityState.next({...this._entityState.value, 
      shippingWay: entity.shippingWay,
      shipType: entity.shipType,
      companyId: entity.companyId,
      address: entity.address,
      manifestNumber: entity.manifestNumber,
      name: entity.name,
    });
  }

  save(entity: ManifestModel): void {
    this.loading.show();
    const observer = {
      next: (res: GenericResponse<ManifestModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['manifest', 'details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    if (entity.id === 0) {
      this.manifestService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.manifestService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['manifest', 'list']);
  }

}
