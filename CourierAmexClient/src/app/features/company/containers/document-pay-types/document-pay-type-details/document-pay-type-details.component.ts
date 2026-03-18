import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, LoadingService, MessageService } from '@app/@core';
import { getDateString } from '@app/@shared';
import { PaymentTypeModel, BankModel, BrandModel, CompanyModel, CurrencyModel, DocumentPayTypeModel, newDocumentPayType, ModuleModel, TemplateModel } from '@app/features';
import { PaymentTypeService, BankService, CurrencyService, DocumentPayTypeService } from '@app/features/company/services';
import { defaultPagination, GenericResponse } from '@app/models';
import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'document-pay-type-details',
  templateUrl: './document-pay-type-details.component.html'
})
export class DocumentPayTypeDetailsContainer {
  private readonly _entity = new BehaviorSubject<DocumentPayTypeModel>({ ...newDocumentPayType });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  readonly currencies$: Observable<CurrencyModel[]>;

  readonly banks$: Observable<BankModel[]>;
  readonly brands$: Observable<BrandModel[]>;
  readonly paymentTypes$: Observable<PaymentTypeModel[]>;
  readonly modules$: Observable<ModuleModel[]>;
  readonly templates$: Observable<TemplateModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private currencyService: CurrencyService,
    private bankService: BankService,
    private messages: MessageService,
    private documentPayTypeService: DocumentPayTypeService,
    private PaymentTypeService: PaymentTypeService,
  ) {

    const $selectedCompany = this._entity.pipe(
      map((state: DocumentPayTypeModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    const $selectedModule = this._entity.pipe(
      map((state: DocumentPayTypeModel) => ({ moduleId: state.moduleId, companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.moduleId === curr.moduleId)
    );

    this.currencies$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.currencyService.getByCompany$(state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.banks$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.bankService.getByCompany$(state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.brands$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.bankService.getBrandByCompany$(state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.paymentTypes$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.PaymentTypeService.getPaged$({ ...defaultPagination, ps: 5000 }, state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.modules$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.commonService.getModulesByCompany$(state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx),
          catchError(_ => of([])))
      ));

    this.templates$ = $selectedModule.pipe(
      filter(state => state?.moduleId !== '' && state.moduleId !== undefined),

      exhaustMap(state => this.commonService.getTemplatesByCompanyModule$(state.moduleId ?? '', state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx),
          catchError(_ => of([])))
      ));


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


  private loadEntity(id: number): void {
    if (id > 0) {
      this.loading.show();

      this.documentPayTypeService.getById$(id)
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

  save(entity: DocumentPayTypeModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<DocumentPayTypeModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['company', 'document-pay-types'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.documentPayTypeService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.documentPayTypeService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['company', 'document-pay-types']);
  }

  onCompanyChange(id: number): void {
    this._entity.next({ ...this._entity.value, companyId: id, payTypeId: 0, currencyCode: 0, moduleId: '', templateId: 0 });
  }

  onPaymentTypeChange(id: number): void {
    this._entity.next({ ...this._entity.value, payTypeId: id });
  }

  // onPaymentTypeChange(id: number): void {
  //   this._entity.next({ ...this._entity.value, payTypeId: id });
  // }

  onModuleChange(id: string): void {
    this._entity.next({ ...this._entity.value, moduleId: id });
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




