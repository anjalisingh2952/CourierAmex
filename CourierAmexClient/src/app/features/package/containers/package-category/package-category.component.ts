import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap } from 'rxjs';
import { PackageCategoryModel, PackageModel } from '@app/features/package/models';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { GenericResponse, PaginationModel, defaultPagination } from '@app/models';
import { PackageService } from '../../services';
import Swal from 'sweetalert2';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';

@Component({
  selector: 'package-category',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-category.component.html'
})
export class PackageCategoryComponent {

  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  pagination: PaginationModel = defaultPagination;
  readonly companies$: Observable<CompanyModel[]>;
  readonly courierName$: Observable<string>;
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  readonly packages$: Observable<PackageCategoryModel[]>;
  readonly packagesMain$: Observable<PackageCategoryModel[]>;
  readonly packagesSearch$: Observable<PackageCategoryModel[]>;

  constructor(
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private messages: MessageService
  ) {
    const $selectedCompany = this._entityState.pipe(
      map((state: ManifestModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    const $selectedManifest = this._entityState.pipe(
      map((state: ManifestModel) => ({ id: state.id, companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.id === curr.id)
    );

    this.manifests$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state?.companyId !== 0),
      exhaustMap(state => this.commonService.getManifests$(this.pagination, state.companyId ?? -1, false, -1) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.packages$ = $selectedManifest.pipe(
      distinctUntilChanged((prev, curr) => prev.id === curr.id),
      filter(state => state?.id !== 0),
      exhaustMap(state => this.packageService.getPagedByManifest$({ ...defaultPagination, ps: 5000 }, state.companyId ?? -1, state.id) //this.commonService.getManifests$(this.pagination, state.companyId ?? -1, false) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newManifestModel })))
        ),
      );

    this.companies$ = this.commonService.getCompanies$();

    const merge$ = merge(entity$, this._entityState.asObservable());
    this.entity$ = combineLatest([merge$, this.companies$])
      .pipe(
        map(([entity]) => {
          return { ...entity };
        })
      );
  }

  onCompanyChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, companyId: id });
  }

  onManifestChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, id });
  }

  save(entity: PackageCategoryModel[]): void {

    // Se crea una clase en vuelo ya que solo se utiliza en esa sección.
    const bulkRequest = {
      companyId: entity[0].companyId,
      category: entity[0].category,
      numbers: entity.map(entity => entity.number)
    }

    this.loading.show();

    const observer = {
      next: (res: GenericResponse<PackageCategoryModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');

          const id = this._entityState.value.id;

          this._entityState.next({ ...this._entityState.value, id: 0 });
          this._entityState.next({ ...this._entityState.value, id: id });

        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    this.packageService.CategoryUpdate$(bulkRequest)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe(observer);

  }

  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
  }

  private calculateVolumetricWeight(state: PackageModel): number {
    let calc = 0;
    try {
      calc = ((state.long ?? 0) * (state.width ?? 0) * (state.height ?? 0)) / 360;
    } catch {
      calc = 0;
    }
    return calc;
  }
}
