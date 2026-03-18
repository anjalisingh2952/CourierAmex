import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Subject, filter, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CompanyModel, CustomerPayTypeModel, CustomerPayTypeService, newCustomerPayType } from '@app/features';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'customer-pay-type-details',
  templateUrl: './customer-pay-type-details.container.html'
})
export class CustomerPayTypeDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<CustomerPayTypeModel>({ ...newCustomerPayType });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private customerPayTypeService: CustomerPayTypeService,
    private messages: MessageService
  ) {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.has('id')) {
          const id = params.get('id') ?? 0;
          this.loadEntity(+id);
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

  onCompanyChange(id: number): void {
    this._entity.next({ ...this._entity.value, companyId: id });
  }

  save(entity: CustomerPayTypeModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<CustomerPayTypeModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'paytype-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.customerPayTypeService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.customerPayTypeService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'pay-types']);
  }

  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.customerPayTypeService.getById$(id)
        .pipe(
          filter((res) => !!res && !!res.success && !!res.data),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              this._entity.next(res.data);
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
        error: (err: any) => {
          console.error(err);
        }
      });
  }
}
