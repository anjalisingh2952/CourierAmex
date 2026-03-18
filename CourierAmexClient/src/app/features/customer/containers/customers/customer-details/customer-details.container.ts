import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';

import { AreaModel, ClientCategoryModel, CompanyModel, CountryModel, CustomerPayTypeModel, DocumentTypeModel, LocationModel, StateModel, SupplierModel, ZoneModel } from '@app/features';
import { CustomerModel, CustomerService, newCustomerModel } from '@app/features/customer';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'customer-details',
  templateUrl: './customer-details.container.html'
})
export class CustomerDetailsContainer implements OnDestroy {
  private readonly _entityState = new BehaviorSubject<CustomerModel>({ ...newCustomerModel });

  readonly companies$: Observable<CompanyModel[]>;
  readonly countries$: Observable<CountryModel[]>;
  readonly states$: Observable<StateModel[]>;
  readonly zones$: Observable<ZoneModel[]>;
  readonly areas$: Observable<AreaModel[]>;
  readonly suppliers$: Observable<SupplierModel[]>;
  readonly locations$: Observable<LocationModel[]>;
  readonly documentTypes$: Observable<DocumentTypeModel[]>;
  readonly customerPayTypes$: Observable<CustomerPayTypeModel[]>;
  readonly customerCategories$: Observable<ClientCategoryModel[]>;
  readonly entity$: Observable<CustomerModel>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private customerService: CustomerService,
    private messages: MessageService
  ) {
    // #region [ Company Events ]
    const $selectedCompany = this._entityState.pipe(
      map((state: CustomerModel) => ({ companyId: state.companyId })),
      filter(state => state.companyId !== undefined),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    this.customerCategories$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state.companyId !== undefined && state.companyId > 0),
      exhaustMap(state => this.commonService.getCustomerCategories$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    this.customerPayTypes$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state.companyId !== undefined && state.companyId > 0),
      exhaustMap(state => this.commonService.getCustomerPayTypes$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    this.suppliers$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state.companyId !== undefined && state.companyId > 0),
      exhaustMap(state => this.commonService.getSuppliers$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    this.documentTypes$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state.companyId !== undefined && state.companyId > 0),
      exhaustMap(state => this.commonService.getDocumentTypes$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));
    // #endregion

    // #region [ Country Events ]
    const $selectedCountry = this._entityState.pipe(
      map((state: CustomerModel) => ({ countryId: state.countryId })),
      filter(state => state.countryId !== undefined),
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId),
    );

    this.states$ = $selectedCountry.pipe(
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId),
      filter(state => state.countryId !== undefined && state.countryId > 0),
      exhaustMap(state => this.commonService.getStates$(state.countryId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));
    // #endregion

    // #region [ State Events ]
    const $selectedState = this._entityState.pipe(
      map((state: CustomerModel) => ({ stateId: state.stateId })),
      filter(state => state.stateId !== undefined),
      distinctUntilChanged((prev, curr) => prev.stateId === curr.stateId)
    );

    this.zones$ = $selectedState.pipe(
      distinctUntilChanged((prev, curr) => prev.stateId === curr.stateId),
      exhaustMap(state => this.commonService.getZones$(state.stateId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));
    // #endregion

    // #region [ Zone Events ]
    const $selectedZone = this._entityState.pipe(
      map((state: CustomerModel) => ({ zoneId: state.zoneId })),
      filter(state => state.zoneId !== undefined),
      distinctUntilChanged((prev, curr) => prev.zoneId === curr.zoneId)
    );

    this.areas$ = $selectedZone.pipe(
      distinctUntilChanged((prev, curr) => prev.zoneId === curr.zoneId),
      exhaustMap(state => this.commonService.getAreas$(state.zoneId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));
    // #endregion

    // #region [ Supplier Events ]
    const $selectedSupplier = this._entityState.pipe(
      map((state: CustomerModel) => ({ companyId: state.companyId, supplierId: state.supplierId })),
      filter(state => state.supplierId !== undefined),
      distinctUntilChanged((prev, curr) => prev.supplierId === curr.supplierId)
    );

    this.locations$ = $selectedSupplier.pipe(
      distinctUntilChanged((prev, curr) => prev.supplierId === curr.supplierId),
      exhaustMap(state => this.commonService.getLocations$(state.companyId ?? 0, state.supplierId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));
    // #endregion

    this.countries$ = this.commonService.getCountries$();
    this.companies$ = this.commonService.getCompanies$();

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newCustomerModel })))
        ),
      );

    const merge$ = merge(entity$, this._entityState.asObservable());
    this.entity$ = combineLatest([merge$])
      .pipe(
        map(([entity]) => {
          return { ...entity };
        })
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(entity: CustomerModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<CustomerModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.redirect(res.data.id);
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
      this.customerService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.customerService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['customer', 'list']);
  }

  onCompanyChange(data: { id: number, countryId: number }): void {
    this._entityState.next({
      ...this._entityState.value,
      companyId: data.id,
      countryId: data.countryId,
    });
  }

  onLoadZones(id: number | undefined): void {
    this._entityState.next({
      ...this._entityState.value,
      stateId: id
    });
  }

  onLoadAreas(id: number | undefined): void {
    this._entityState.next({
      ...this._entityState.value,
      zoneId: id
    });
  }

  onLoadLocations(id: number | undefined): void {
    this._entityState.next({
      ...this._entityState.value,
      supplierId: id
    });
  }

  onUpdateCustomer(entity: CustomerModel): void {
    this._entityState.next({ ...entity });
  }

  private redirect(id: number): void {
    setTimeout(() => {
      this.router.navigate(['customer', 'details'], { queryParams: { id: id, dt: getDateString() }, replaceUrl: true });
    }, 500);
  }

  private createOrUpdateEntity(id: number): Observable<CustomerModel> {
    if (id === 0) {
      return of({ ...newCustomerModel, companyId: 0 });
    }

    return this.customerService.getById$(id)
      .pipe(
        map((res) => {
          if (res?.data) {
            const entity = res?.data;
            this._entityState.next(entity);
            return entity;
          }

          return { ...newCustomerModel };
        }));
  }
}
