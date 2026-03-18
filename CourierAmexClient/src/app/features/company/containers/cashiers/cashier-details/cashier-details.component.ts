import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, distinctUntilChanged, finalize, lastValueFrom, map, merge, of, switchMap, tap } from 'rxjs';

import { CommonService, LoadingService, MessageService } from '@app/@core';
import { CashierModel, ClientCashierService, CompanyModel, newCashierModel, UserByPointOfSaleModel } from '@app/features/company';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cashier-details',
  templateUrl: './cashier-details.component.html',
  styleUrls: ['./cashier-details.component.scss']
})
export class CashierDetailsComponent {
  private readonly _entityState = new BehaviorSubject<CashierModel>({ ...newCashierModel });

  readonly companies$: Observable<CompanyModel[]>;
  readonly entity$: Observable<CashierModel>;
  protected isLocked = false;
  pointOfSaleId: number = 0;
  users: UserByPointOfSaleModel[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private service: ClientCashierService,
    private messages: MessageService
  ) {
    const $selectedCompany = this._entityState.pipe(
      map((state: CashierModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
            catchError(_ => of({ ...newCashierModel })))
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

  private createOrUpdateEntity(id: number): Observable<CashierModel> {
    this.isLocked = false;
    if (id === 0) {
      const instance = { ...newCashierModel, companyId: 0 };
      this._entityState.next(instance);
      return of(instance);
    }
    const currentCashier = this._entityState.value;
    this.service.getUserByPointOfSale(currentCashier.companyId ?? 0, id).subscribe((res) => {
      this.users = res;
    });

    return this.service.getById$(id)
      .pipe(
        map((res) => {
          if (res?.data) {
            const entity = res?.data;
            this._entityState.next(entity);
            
            return entity;
          }

          return { ...newCashierModel };
        }));
  }

  protected onCompanyChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, companyId: id });
  }

  protected save(entity: CashierModel): void {
    this.loading.show();
    const observer = {
      next: (res: GenericResponse<CashierModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'cashier-details'], { queryParams: { id: res.data.id }, replaceUrl: true });
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
      this.service.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.service.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  protected goBack(): void {
    this.router.navigate(['company', 'cashiers']);
  }

}
