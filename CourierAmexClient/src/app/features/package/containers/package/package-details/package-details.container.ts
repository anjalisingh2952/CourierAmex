import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, lastValueFrom, map, merge, of, switchMap, tap } from 'rxjs';

import { PackageModel, newPackageModel } from '@app/features/package/models';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { PackageService } from '@app/features/package/services';
import { CommodityModel, CompanyModel, ProductModel } from '@app/features/company';
import { CountryModel } from '@app/features/general';
import { WEIGHT_LBS, getCourierByTracking } from '@app/@shared';
import Swal from 'sweetalert2';
import { GenericResponse } from '@app/models/generic-response.interface';

@Component({
  selector: 'packages-package-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-details.container.html'
})
export class PackageDetailsContainer {
  private readonly _entityState = new BehaviorSubject<PackageModel>({ ...newPackageModel });
  protected additionalInfo: {
    countryName: string,
    weightUnit: number,
    isCommodityRequired: boolean
  } = {
    countryName: '',
    weightUnit: 1,
    isCommodityRequired: false
  };

  readonly countries$: Observable<CountryModel[]>;
  readonly companies$: Observable<CompanyModel[]>;
  readonly commodities$: Observable<CommodityModel[]>;
  readonly courierName$: Observable<string>;
  readonly entity$: Observable<PackageModel>;
  protected isLocked = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private messages: MessageService
  ) {
    const $selectedCompany = this._entityState.pipe(
      map((state: PackageModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    this.commodities$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state?.companyId !== 0),
      exhaustMap(state => this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newPackageModel })))
        )
      );

    this.countries$ = this.commonService.getCountries$();
    this.companies$ = this.commonService.getCompanies$();

    const merge$ = merge(entity$, this._entityState.asObservable());
    this.entity$ = combineLatest([merge$, this.companies$, this.countries$])
      .pipe(
        tap(([entity, companyList, countryList]) => {
          this.additionalInfo = {
            countryName: '',
            weightUnit: 1,
            isCommodityRequired: false
          };
          const cia = companyList.find(c => c.id === entity.companyId);
          if (cia) {
            this.setAdditionalInfo(countryList, cia);
          }
        }),
        map(([entity]) => {
          return { ...entity };
        })
      );
  }

  onCompanyChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, companyId: id });
  }

  onCustomerChange(request: ProductModel): void {
    this._entityState.next({ ...this._entityState.value, customerCode: request.name, searchCustomer: request.isSelected });
  }

  onTrackingNumberChange(tracking: string): void {
    this._entityState.next({ ...this._entityState.value, trackingNumber: tracking, courierName: getCourierByTracking(tracking) });
  }

  onWeightChange(weight: number): void {
    let weightLbs = 0;
    try {
      if (this.additionalInfo?.weightUnit === 1) {
      weightLbs = weight * WEIGHT_LBS;
      } else if (this.additionalInfo?.weightUnit === 2) {
        weightLbs = weight / WEIGHT_LBS;
      }
    } catch {
      weightLbs = 0;
    }
    this._entityState.next({ ...this._entityState.value, weight: weight, weightLbs: weightLbs });
  }

  onWidthChange(width: number): void {
    let state = this._entityState.value;
    state.width = width;
    state.volumetricWeight = this.calculateVolumetricWeight(state);
    this._entityState.next({ ...state });
  }

  onHeightChange(height: number): void {
    let state = this._entityState.value;
    state.height = height;
    state.volumetricWeight = this.calculateVolumetricWeight(state);
    this._entityState.next({ ...state });
  }

  onLongChange(long: number): void {
    let state = this._entityState.value;
    state.long = long;
    state.volumetricWeight = this.calculateVolumetricWeight(state);
    this._entityState.next({ ...state });
  }

  async save(entity: PackageModel) {
    this.loading.show();
    const observer = {
      next: (res: GenericResponse<PackageModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
         this.router.navigate(['package', 'details'], { queryParams: { id: res.data.id }, replaceUrl: true });
        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    const payload = {
      ...entity,
      number: 0,
      observations: '',
      description: '', 
      price: 0, 
      receivedBy: '', 
      packageType: 1, 
      palets: 0,
      insurance: 0,
      packages: 1,
      packageStateId: 0,
      bags: 0, 
      totalWeight: 0, 
      type: '1', 
      totalLabel: '', //1-3
      packageDetail: '',
      // comodityId: entity.commodityId,
      updatePrice: false, 
      hasInvoice: entity.hasInvoice ? 1:0, 
      preStudy: 0, 
      dua: '',
      resources: '', 
      category: 'C',
    };

    if (entity.id === 0) {
      if(entity.copies === 1){
        this.packageService.create(payload)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
      } else {
        let successCount = 0;
        let lastInsertedId = 0;
        for (let index = 0; index < entity.copies; index++) {
          const fieldIndex = index+1;
          const record = {
            ...payload,
            trackingNumber: `${payload.trackingNumber}-${fieldIndex}`,
            totalLabel: `${fieldIndex}-${entity.copies}`
          };
          const package$ = this.packageService.create(record);
          const response = await lastValueFrom(package$);
          if (response.data.id === 0) {
            alert(this.messages.getTranslate('Labels.InternalError'));
          } else {
            lastInsertedId = response.data?.id;
            successCount++;
          }
        }
  
        if(successCount > 0) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['package', 'details'], { queryParams: { id: lastInsertedId }, replaceUrl: true });
        }
      }

    } else {
      this.packageService.update(payload)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['package', 'list']);
  }

  private setAdditionalInfo(counties: CountryModel[], company: CompanyModel | undefined): void {
    if (company) {
      if (company?.countryId && company?.countryId > 0) {
        const country = counties.find(c => c.id === company.countryId);
        if (country) {
          const shortName = country.shortname && country.shortname.length > 0 ? `(${country.shortname})` : '';
          this.additionalInfo = { ...this.additionalInfo, countryName: `${country.name} ${shortName}` };
        }
      }
      this.additionalInfo = { ...this.additionalInfo, isCommodityRequired: company.isCommodityRequired, weightUnit: company.weightUnit };
    }
  }

  private createOrUpdateEntity(id: number): Observable<PackageModel> {
    this.isLocked = false;
    if (id === 0) {
      const instance = { ...newPackageModel, companyId: 0 };
      this._entityState.next(instance);
      return of(instance);
    }

    return this.packageService.getById$(id)
      .pipe(
        map((res) => {
          if (res?.data) {
            const entity = res?.data;
            this.isLocked = true;
            this._entityState.next(entity);
            return entity;
          }

          return { ...newPackageModel };
        }));
  }

  private calculateVolumetricWeight(state: PackageModel): number {
    let calc = 0;
    try {
      calc = Math.ceil(((state.long ?? 0) * (state.width ?? 0) * (state.height ?? 0)) / 360);
    } catch {
      calc = 1;
    }
    return calc;
  }
}
