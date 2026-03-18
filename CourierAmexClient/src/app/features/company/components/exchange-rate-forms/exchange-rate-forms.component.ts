import { Component, ElementRef, ViewChild, EventEmitter, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CredentialsService, LoadingService } from '@app/@core';
import { ModuleModel, TemplateModel } from '@app/features';
import { ExchangeModel, newExchangeModel, CompanyModel, CurrencyModel, DocumentPayTypeModel, BankModel, BrandModel, PaymentTypeModel } from '@app/features/company';
import { TranslateService } from '@ngx-translate/core';
import { filter, finalize } from 'rxjs';
import { PermissionActionEnum, PermissionsEnum,defaultPagination,PaginationModel,PageOptionsDefault } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { start } from 'repl';

@Component({
  selector: 'app-exchange-rate-forms',
  templateUrl: './exchange-rate-forms.component.html',
  styleUrl: './exchange-rate-forms.component.scss',
  inputs: ['companies', 'currencies', 'templates'],
  outputs: ['onSave', 'onGoBack', 'onCompanyChange']
})
export class ExchangeRateFormsComponent {
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;

  document!: ExchangeModel;
  companies: CompanyModel[] = [];
  currencies: CurrencyModel[] = [];
  templates: TemplateModel[] = [];
  TodayExchangeRateList: any[]=[{ "PurchaseValue": 0, "SaleValue": 0, "Date": '' }];
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  disabledFields: boolean = true;

  onSave = new EventEmitter<ExchangeModel>();
  onCompanyChange = new EventEmitter<number>();
  onGoBack = new EventEmitter<void>();
  selectedcompanyId:number=0
  date: string = "";
  manualRate: boolean = false
  purchaseRate: any;
  saleRate: any;
  columns: ColDef[] = [];
  rows: any[]=[] ;
  state: TableState = {
      page: 1,
      pageSize: PageOptionsDefault,
      searchTerm: '',
      sortColumn: 'number',
      sortDirection: 'DESC',
    };
  translations = {
    PurchaseValue: '',
    SaleValue: '',
    Date: ''
  };

  constructor(
    private credentailsService: CredentialsService,
    private translate: TranslateService,
    private exchangeRateService: ExchangeRateService,
    private loading: LoadingService,

  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.DocumentTypes, PermissionActionEnum.Update);
    this.translate.get(['ExchangeRateList.PurchaseValue',
      'ExchangeRateList.SaleValue',
      'ExchangeRateList.Date'])
      .subscribe(
        translations => {
          this.translations.PurchaseValue = translations['ExchangeRateList.PurchaseValue'];
          this.translations.SaleValue = translations['ExchangeRateList.SaleValue'];
          this.translations.Date = translations['ExchangeRateList.Date'];
        });
  }

  @Input() set entity(input: ExchangeModel) {
    this.document = input;
    if (input.id == 0)
      this.disabledFields = false;
    else
      this.disabledFields = true;

  }


  ngOnInit(): void {
    this.setDefaultStartDate();
   
    const ciaId = this.credentailsService.credentials?.user.companyId ?? 0;
    if (!this.showCompanies && ciaId > 0) {
      this.selectedcompanyId= ciaId
      this.companyChange(ciaId);
    }
    if (this.selectedcompanyId != 2) {
      this.manualRate = true;
    }else{
      this.getUSDBuyRate(this.date, this.date);
      this.getUSDSaleRate(this.date, this.date);
    }
  }
  setDefaultStartDate(): void {
    const currentDateto = new Date();
    currentDateto.setDate(currentDateto.getDate() - 0);
    this.date = currentDateto.toISOString().split('T')[0];
  }
  openDatePickerTo(): void {
    this.dateInputTo.nativeElement.showPicker(); // Works in modern browsers
    // Alternative: this.dateInput.nativeElement.focus();
  }
  goBack(): void {
    this.onGoBack.emit();
  }


  companyChange(companyId: number): void {
    this.selectedcompanyId=companyId
    this.onCompanyChange.emit(companyId);
  }

  getUSDBuyRate(startDate: string, endDate: string) {
//getUSDSaleRate
    this.loading.show();
    //const startDate = '09/04/2025';
    //const endDates = '09/04/2025';
    this.exchangeRateService.getUSDBuyRate(new Date(startDate), new Date(endDate))
      .pipe(
        filter((res) => res.success==true),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this.TodayExchangeRateList[0]['PurchaseValue'] = res?.data;
          this.purchaseRate= res?.data;
  

        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }
  getUSDSaleRate(startDate: string, endDate: string) {
    //getUSDSaleRate
        this.loading.show();
        this.exchangeRateService.getUSDSaleRate(new Date(startDate), new Date(endDate))
          .pipe(
            filter((res) => res.success==true),
            finalize(() => this.loading.hide())
          )
          .subscribe({
            next: (res) => {
              this.TodayExchangeRateList[0]['SaleValue'] = res?.data;
              this.TodayExchangeRateList[0]['Date']=this.date;
              this.saleRate= res?.data;

            },
            error: (err: any) => {
              console.error(err);
            }
          });
      }
    
  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onSave.emit(Object.assign(this.document, form.value));
    } else {
      form.form.markAllAsTouched();
    }
  }

}
