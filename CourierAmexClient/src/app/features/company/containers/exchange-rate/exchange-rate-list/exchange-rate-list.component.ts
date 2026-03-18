import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { getDateString } from '@app/@shared';
import { ExchangeModel, newExchangeModel, PaymentTypeModel, BankModel, BrandModel, CompanyModel, CurrencyModel, DocumentPayTypeModel, newDocumentPayType, ModuleModel, TemplateModel, ExchangeListModel } from '@app/features';
import { PaymentTypeService, BankService, CurrencyService, DocumentPayTypeService } from '@app/features/company/services';
import { defaultPagination, GenericResponse } from '@app/models';
import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { ExchangeRateService } from "@app/features/company/services/exchange-rate.service";
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-exchange-rate-list',
  templateUrl: './exchange-rate-list.component.html',
  styleUrl: './exchange-rate-list.component.scss'
})
export class ExchangeRateListComponent {


  private readonly _entity = new BehaviorSubject<ExchangeModel>({ ...newExchangeModel });
  entity$ = this._entity.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  readonly currencies$: Observable<CurrencyModel[]>;
  readonly templates$: Observable<TemplateModel[]>;
  exchangeRateList: ExchangeListModel[] = [];
  searchValue: string | undefined;
  companyId: any;

  private destroy$ = new Subject<void>();
  isAdd: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [{ "PurchaseValue": 45, "SaleValue": 78, "Date": '07-04-2025' }];
  translations = {
    PurchaseValue: '',
    SaleValue: '',
    Date: ''
  };

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
    private exchangeRateService: ExchangeRateService,
    private credentailsService: CredentialsService
  ) {
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
    const $selectedCompany = this._entity.pipe(
      map((state: ExchangeModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    this.currencies$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0 && state.companyId !== undefined),
      exhaustMap(state => this.currencyService.getByCompany$(state.companyId ?? -1)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));
    console.log(this.currencies$);
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
    this.setDefaultCompany();
    this.loadAttributes();
    this.getExchangeRate();
  }

  //#endregion

  //#region Setter_Functions

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      this.companyId = this.credentailsService.credentials?.user.companyId
      console.log("this.companyId", this.companyId);

    }
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
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

  save(entity: ExchangeModel): void {
    this.loading.show();
    console.log(" save:entity", entity);
    const observer = {
      next: (res: GenericResponse<ExchangeModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          //this.router.navigate(['company', 'document-pay-types'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
          this.isAdd = false;
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
      this.exchangeRateService.PostExchangeRate(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.isAdd = false;
    //this.router.navigate(['company', 'document-pay-types']);
  }

  onCompanyChange(id: number): void {
    this._entity.next({ ...this._entity.value, companyId: id });
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
  addNew() {
    this.isAdd = true;
  }
  getExchangeRate() {
    this.loading.show();
    console.log("getExchangeRate", this.companyId)
    this.exchangeRateService.getExchangeRate(this.companyId)
      .pipe(
        filter((res) => res?.data.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this.exchangeRateList = res?.data;
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

}