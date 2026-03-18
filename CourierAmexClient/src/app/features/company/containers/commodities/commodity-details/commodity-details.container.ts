import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, finalize, map, merge, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CommodityModel, CommodityService, CompanyModel, newCommodityModel } from '@app/features';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';


@Component({
  selector: 'commodity-details',
  templateUrl: './commodity-details.container.html'
})
export class CommodityDetailsContainer {
  private readonly _entityState = new BehaviorSubject<CommodityModel>({ ...newCommodityModel });

  readonly companies$: Observable<CompanyModel[]>;
  readonly entity$: Observable<CommodityModel>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private messages: MessageService,
    private commonService: CommonService,
    private commodityService: CommodityService
  ) {
    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newCommodityModel })))
        )
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

  save(entity: CommodityModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<CommodityModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'commodity-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    };

    if (entity.id === 0) {
      this.commodityService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.commodityService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'commodities']);
  }

  private createOrUpdateEntity(id: number): Observable<CommodityModel> {
    if (id === 0) {
      return of({ ...newCommodityModel });
    }

    return this.commodityService.getById$(id)
      .pipe(
        map((res) => {
          if (res?.data) {
            const entity = res?.data;
            return entity;
          }

          return { ...newCommodityModel };
        }));
  }
}
