import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CredentialsService, LoadingService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { Invoice } from '@app/features/invoice/models';
import { defaultPagination, PaginationModel } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-invoices-cradits-list',
  templateUrl: './invoices-cradits-list.component.html'
})
export class InvoicesCraditsListComponent implements OnChanges {
  @Output() invoicePendingPaymentDetail: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @Input() invoiceCraditsDetail: any[] = [];
  @Input() invoicePendingPayment: boolean = false;

  invoices: any[] = [];
  entities: any[] = [];
  columns: ColDef[] = [];
  rows: any[] = [];
  pagination: PaginationModel = defaultPagination;
  
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    invoiceNumber: "",
    user: "",
    cashRegisterID: 0,
    client: "",
    date: "",
    taxableAmount: 0,
    exemptAmount: 0,
    customsTax: 0,
    salesTax: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    totalLocal: 0,
    balance: 0,
    localBalance: 0,
    paidAmount: 0,
    change: 0,
    paymentMethodID: 0,
    paymentType: "",
    status: 0,
    fullName: "",
    exchangeRatePurchase: 0,
    exchangeRateSale: 0,
    note: "",
    type: "",
    key: "",
    productID: 0,
    quantity: 0,
    price: 0,
    description: "",
    productType: "",
    isExempt: false,
    hasCustomsTax: false,
    documentNumber: "",
    creditNote: "",
    documentType: "",
    id: 0,
    action: ""
  };
  selectedId: number = 0;
  documentSelected: boolean = false;
  _entities = new BehaviorSubject<any[]>([]);

  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;

    const translationKeys = [
      'InvoiceHistory.Date',
      'InvoiceHistory.Invoice',
      'InvoiceHistory.Tax',
      'InvoiceHistory.TotalDollars',
      'InvoiceHistory.TotalLocal',
      'InvoiceHistory.Status',
      'InvoiceHistory.BalanceInDollars',
      'InvoiceHistory.BalanceInLocal'
    ];

    if (this.invoicePendingPayment) {
      translationKeys.unshift('Labels.Actions');
    }

    this.translate.get(translationKeys).subscribe(translations => {
      if (this.invoicePendingPayment) {
        this.translations.action = translations['Labels.Actions'];
      }
      this.translations.date = translations['InvoiceHistory.Date'];
      this.translations.invoiceNumber = translations['InvoiceHistory.Invoice'];
      this.translations.taxableAmount = translations['InvoiceHistory.Tax'];
      this.translations.total = translations['InvoiceHistory.TotalDollars'];
      this.translations.totalLocal = translations['InvoiceHistory.TotalLocal'];
      this.translations.status = translations['InvoiceHistory.Status'];
      this.translations.balance = translations['InvoiceHistory.BalanceInDollars'];
      this.translations.localBalance = translations['InvoiceHistory.BalanceInLocal'];
    });
  }

  ngAfterViewInit(): void {

    if (this.invoicePendingPayment) {
      this.columns.push({ field: 'action', label: this.translations.action, sortable: false, contentTemplate: this.actionTemplate });
    }
    this.columns.push({ field: 'invoiceNumber', label: this.translations.invoiceNumber, sortable: true });
    this.columns.push({ field: 'date', label: this.translations.date, type: "date", sortable: true });
    this.columns.push({ field: 'taxableAmount', label: this.translations.taxableAmount.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'total', label: this.translations.total.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'totalLocal', label: this.translations.totalLocal.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'status', label: this.translations.status.toString(), sortable: true, contentTemplate: this.statusTemplate });
    this.columns.push({ field: 'balance', label: this.translations.balance.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'localBalance', label: this.translations.localBalance.toString(), type: "2decimals", sortable: true });

    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceCraditsDetail']?.currentValue) {
      this.updateInvoiceCraditDetails(changes['invoiceCraditsDetail'].currentValue);
    }
  }

  updateInvoiceCraditDetails(newDetails: any[]): void {
    this.entities = newDetails || [];
    this.invoices = newDetails || [];
  }

  async onCheckboxChange(selectedRow: any): Promise<void> {
    const entities = this.invoiceCraditsDetail;
  
    const updatedEntities = entities.map(row => ({
      ...row,
      selected: row === selectedRow ? !row.selected : row.selected
    }));
  
    this.selectedId = Number(selectedRow.documentNumber);
    this.documentSelected = updatedEntities.some(row => row.selected);
    this._entities.next(updatedEntities);
  
    if (selectedRow.selected) {
      this.invoicePendingPaymentDetail.emit({ ...selectedRow, unChecked: false });
    } else {
      this.invoicePendingPaymentDetail.emit({ ...selectedRow, unChecked: true });
    }
  }
  

  viewEntity(entity: any): void {
    console.log("entity", entity);
  }
}