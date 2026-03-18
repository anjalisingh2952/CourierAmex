import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subject, filter, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { ShippingWayTypeModel, newShippingWayType } from '@app/features/general/models';
import { ShippingWayTypeService } from '@app/features/general/services';
import { LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'shipping-way-type-details',
  templateUrl: './shipping-way-type-details.container.html'
})
export class ShippingWayTypeDetailsContainer implements OnDestroy {
  private readonly _entity = new BehaviorSubject<ShippingWayTypeModel>({ ...newShippingWayType });
  entity$ = this._entity.asObservable();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private shippingWayTypeService: ShippingWayTypeService,
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(model: ShippingWayTypeModel): void {
    this.loading.show();
    const entity = {
      ...model,
    };

    const observer = {
      next: (res: GenericResponse<ShippingWayTypeModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['general', 'shipping-way-type-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.shippingWayTypeService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.shippingWayTypeService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['general', 'shipping-way-types']);
  }

  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.shippingWayTypeService.getById$(id)
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
}
