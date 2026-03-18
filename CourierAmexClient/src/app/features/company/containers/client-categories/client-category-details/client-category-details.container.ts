import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { ClientCategoryModel, CompanyModel, ProductModel, newClientCategory } from '@app/features/company/models';
import { ClientCategoryService, CompanyService, ProductService } from '@app/features/company/services';
import { LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from '@app/models';
import { getDateString } from '@app/@shared';

@Component({
  selector: 'company-client-category-details',
  templateUrl: './client-category-details.container.html'
})
export class ClientCategoryDetailsContainer implements OnInit, OnDestroy {
  private readonly _entity = new BehaviorSubject<ClientCategoryModel>({ ...newClientCategory });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  readonly products$: Observable<ProductModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private companyService: CompanyService,
    private clientCategoryService: ClientCategoryService,
    private productService: ProductService,
    private messages: MessageService
  ) {
    const $selectedCompany = this.entity$.pipe(
      map((state: ClientCategoryModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    this.products$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state?.companyId !== undefined),
      exhaustMap(state => this.productService.getByCompany$(state.companyId ?? 0)
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

  onCompanyChange(id: number): void {
    this.loading.show();
    this._entity.next({
      ...this._entity.value,
      companyId: id,
      excludedProducts: [],
      includedProducts: []
    });
  }

  onAddExcludedProducts($event: ProductModel[]): void {
    const entity = this._entity.value;
    const prods = this.addProducts($event, entity.excludedProducts ?? []);

    this._entity.next({
      ...entity,
      excludedProducts: prods
    });
  }

  onRemoveExcludedProducts($event: ProductModel[]): void {
    const entity = this._entity.value;
    const prods = this.removeProducts($event, entity.excludedProducts ?? []);

    this._entity.next({
      ...entity,
      excludedProducts: prods
    });
  }

  onAddIncludedProducts($event: ProductModel[]): void {
    const entity = {...this._entity.value};
    const prods = this.addProducts($event, entity.includedProducts ?? []);

    this._entity.next({
      ...entity,
      includedProducts: prods
    });
  }

  onRemoveIncludedProducts($event: ProductModel[]): void {
    const entity = {...this._entity.value};
    const prods = this.removeProducts($event, entity.includedProducts ?? []);

    this._entity.next({
      ...entity,
      includedProducts: prods
    });
    
  }

  save(model: ClientCategoryModel): void {
    this.loading.show();
    const currentEntity = {...this._entity.value};
    const entity = {
      ...model,
      excludedProducts: currentEntity.excludedProducts,
      includedProducts: currentEntity.includedProducts
    };

    const observer = {
      next: (res: GenericResponse<ClientCategoryModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'category-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.clientCategoryService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.clientCategoryService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'categories']);
  }

  private addProducts(newProds: ProductModel[], products: ProductModel[]): ProductModel[] {
    newProds.forEach(p => {
      const idx = products.findIndex(x => x.id === p.id);
      if (idx === -1) {
        p.isSelected = false;
        products.push(p);
      }
    });

    return products;
  }

  private removeProducts(removeProds: ProductModel[], products: ProductModel[]): ProductModel[] {
    removeProds.forEach(p => {
      const idx = products.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        products.splice(idx, 1);
      }
    });

    return products;
  }

  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.clientCategoryService.getById$(id)
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
    this._companies.next([]);

    this.companyService.getActive$()
      .pipe(
        filter((res) => !!res && !!res.success && !!res.data && res.data.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res.data ?? []);
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
}
