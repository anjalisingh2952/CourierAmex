import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CreditNoteInsertRequestModel, Invoice, InvoiceModel } from '@app/features/invoice/models';
import { InvoiceService } from '@app/features/invoice/services';
import { defaultPagination, PaginationModel } from '@app/models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, finalize, firstValueFrom, Subject, take } from 'rxjs';
import { InvoicesPackagesComponent } from '../invoices-packages/invoices-packages.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PrinterService } from '@app/@core/services/printer.service';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import Swal from 'sweetalert2';
import { ClientCategoryModel } from '@app/features/company';
import { PaymentService } from '@app/features/payment/services';
import { ExchangeRateService } from '@app/features/company/services/exchange-rate.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent {
  private readonly _entities = new BehaviorSubject<Invoice[]>([]);
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  @Input() detail: any;
  @Input() balanceLocal: any;
  private _modalHeadData = new BehaviorSubject<any>(null);
  private _packagesData = new BehaviorSubject<any[]>([]);
  packagesData$ = this._packagesData.asObservable();
  modalHead$ = this._modalHeadData.asObservable();
  entities$ = this._entities.asObservable();

  modalRef!: NgbModalRef;
  dataReceived = new Subject<any[]>();
  selectedOptionsString: string = 'Pago';
  invoices: any;
  columns: ColDef[] = [];
  rows: Invoice[] = [];
  cashierList: ClientCategoryModel[] = [];
  documentSelected: boolean;
  InvoiceCraditsDetail: any;
  isFormValid: boolean;
  selectedId: any;
  isCancelled: boolean = false;
  selectedCashier: any;
  pagination: PaginationModel = defaultPagination;
  selectedRow: any;
  selectedCashierId: number = 0;
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  paginationCashier: PaginationModel = defaultPagination;
  stateCashier: TableState = {
    page: 1,
    pageSize: 1000,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };


  invoice = { ...InvoiceModel };
  filterData = {
    clientId: '',
    toDate: new Date().toISOString().split('T')[0],
    fromDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0],
    filters: ''
  };

  translations = {
    invoiceNumber: '',
    user: '',
    cashRegisterID: 0,
    client: '',
    date: '',
    taxableAmount: 0,
    exemptAmount: null,
    customsTax: null,
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
    paymentType: null,
    status: 0,
    fullName: null,
    exchangeRatePurchase: 0,
    exchangeRateSale: 0,
    note: null,
    type: null,
    key: null,
    productID: 0,
    quantity: 0,
    price: 0,
    description: '',
    productType: null,
    isExempt: false,
    hasCustomsTax: false,
    documentNumber: '',
    creditNote: null,
    documentType: '',
    actoin: '',
    paymentStatus: ''
  };


  constructor(private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private loading: LoadingService,
    private printerService: PrinterService,
    private cred: CredentialsService,
    private messages: MessageService,
    private exchangeRateService: ExchangeRateService,
    private router: Router) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'InvoiceHistory.DocumentType',
      'InvoiceHistory.Document',
      'InvoiceHistory.Date',
      'InvoiceHistory.Tax',
      'InvoiceHistory.TotalDollars',
      'InvoiceHistory.TotalLocal',
      'InvoiceHistory.Paid',
      'InvoiceHistory.PaymentStatus',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.actoin = translations['Labels.Actions'];
          this.translations.documentType = translations['InvoiceHistory.DocumentType'];
          this.translations.documentNumber = translations['InvoiceHistory.Document'];
          this.translations.paymentStatus = translations['InvoiceHistory.PaymentStatus'];
          this.translations.date = translations['InvoiceHistory.Date'];
          this.translations.salesTax = translations['InvoiceHistory.Tax'];
          this.translations.total = translations['InvoiceHistory.TotalDollars'];
          this.translations.totalLocal = translations['InvoiceHistory.TotalLocal'];
          this.translations.paidAmount = translations['InvoiceHistory.Paid'];
        });
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'action', label: this.translations.actoin, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.columns.push({ field: 'documentType', label: this.translations.documentType, sortable: true });
    this.columns.push({ field: 'documentNumber', label: this.translations.documentNumber.toString(), sortable: true });
    this.columns.push({ field: 'date', label: this.translations.date, type: "date", sortable: true });
    this.columns.push({ field: 'status', label: this.translations.paymentStatus, sortable: true, cssClass: "text-center", contentTemplate: this.statusTemplate });
    this.columns.push({ field: 'salesTax', label: this.translations.salesTax.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'total', label: this.translations.total.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'totalLocal', label: this.translations.totalLocal.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'paidAmount', label: this.translations.paidAmount.toString(), type: "2decimals", sortable: true });
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detail']?.currentValue) {
      this.updateInvoiceDetails(changes['detail'].currentValue);
      this.filterData.filters = this.selectedOptionsString;
    }
  }

  private updateInvoiceDetails(detail: any): void {
    const {
      id = 0,
      companyId = 0,
      number,
      code = '',
      fullName = '',
      companyName = '',
      courierName = '',
      trackingNumber = '',
      status = 0,
      volumetricWeight = 0,
      manifestId = 0,
      hasInvoice = false,
      taxType = 0
    } = detail;

    this.invoice = { id, companyId, number, code, fullName, companyName, courierName, trackingNumber, status, volumetricWeight, manifestId, hasInvoice, taxType };

    if (code) {
      this.filterData.clientId = code;
    }
  }

  fetchFilteredRecords(): void {
    const { fromDate, toDate, clientId, filters } = this.filterData;
    this.invoiceService.CustomerDetailsByClientId(clientId, fromDate, toDate, filters).subscribe(
      response => {
        var sortedData = response.data.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        this.invoices = sortedData;
        this._entities.next(sortedData);
      },
      error => console.error('Error fetching filtered records:', error)
    );
  }

  updateSelectedOptions(event: Event, option: string): void {
    const checkbox = event.target as HTMLInputElement;
    const options = new Set(this.selectedOptionsString.split(', '));

    if (checkbox.checked) {
      options.add(option);
    } else {
      options.delete(option);
    }

    this.selectedOptionsString = Array.from(options).join(', ');
    this.filterData.filters = this.selectedOptionsString;
  }

  filterRecords(): void {
    this.selectedId = null;
    const { fromDate, toDate, clientId } = this.filterData;

    if (!fromDate && !toDate && !clientId) {
      Swal.fire("Warning", "Please select a date range and a client ID to filter records", "warning");
      return;
    } else {
      if (!fromDate) {
        Swal.fire("Warning", "Please select a start date to filter records.", "warning")
        return;
      }
      if (!toDate) {
        Swal.fire("Warning", "Please select an end date to filter records.", "warning")
        return;
      }
      if (!clientId) {
        Swal.fire("Warning","Please select a client ID to filter records.","warning")
        return;
      }
    }
    if (this.filterData.filters) {
      this.fetchFilteredRecords();
    } else {
      console.log('No filters applied.');
    }
  }

  CancelPayment(): void {
    var isPagoSelected = this._modalHeadData.getValue();
    if (!this.selectedId) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.SelectDoc'), 'warning');
      return;
    }
    if (!(isPagoSelected == "PAGO" || isPagoSelected == "ADELANTO")) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.PaymentSelect'), 'warning');
      return;
    }
    if (this.isCancelled) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.PaymentAlreadyCancelled'), 'warning');
      return;
    }

    let formattedToday = new Date().toISOString().split('T')[0];
    this.exchangeRateService.getExchangeRate(this.cred.credentials?.user.companyId ?? 0, formattedToday).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          if (res.data.length > 0) {
            this.cancelPayment();
          }
          else {
            Swal.fire({
              title: this.messages.getTranslate('Labels.Error'),
              text: this.messages.getTranslate('Labels.NoExchangeRate'),
              icon: 'error',
              showCancelButton: true,
              confirmButtonText: this.messages.getTranslate('Labels.AddExchangeRate'),
              cancelButtonText: this.messages.getTranslate('Labels.Cancel'),
            }).then((result) => {
              if (result.isConfirmed) {
                this.routeToExchangeRate();
              }
            });
            return;
          }

        }
      },
      error: (error: any) => {
        console.error(error);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    })
  }

  routeToExchangeRate(): void {
    this.router.navigate(['/company/exchange-rate']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  }

  formatNumber(number: number): string {
    return number?.toFixed(2) || '0.00';
  }

  viewEntity(param: any): void {
    console.log(param);

    const isPago = param.documentType !== "FACTURA";
    this._modalHeadData.next(isPago ? "PAGO" : "FACTURA");

    const fetchDetails$ = isPago
      ? this.invoiceService.GetPaymentDetailsForLabel(this.invoice.companyId, Number(param.documentNumber))
      : this.invoiceService.GetPackagesByInvoice(Number(param.documentNumber));


    fetchDetails$.subscribe(response => {
      isPago ? this._packagesData.next(response) : this._packagesData.next(response.data);
      const modalRef = this.modalService.open(InvoicesPackagesComponent, {
        size: 'xl',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.parent = this;
    });
  }

  generateInvoice(): void {
    if (!this.documentSelected) {
      Swal.fire("Warning","Please select a document first from Payment and Invoices list.","warning");
      return;
    }
    this.router.navigate(['/invoice/invoice-report', this.selectedId]);
  }

  async onCheckboxChange(selectedRow: any): Promise<void> {
    this._modalHeadData.next(selectedRow.documentType);
    this.selectedRow = selectedRow;
    const entities = await firstValueFrom(this.entities$);
    const updatedEntities = entities.map(row => ({
      ...row,
      selected: row === selectedRow
    }));

    this.selectedId = Number(selectedRow.documentNumber);
    this.documentSelected = true;
    const isPago = selectedRow.documentType !== "FACTURA";
    this.isCancelled = isPago && selectedRow.status === 1;
    this._entities.next(updatedEntities);
  }

  printLabel() {
    try {
      this.loading.show();
      this.invoiceService.GetPaymentDetailsForLabel(this.invoice.companyId, this.selectedId).subscribe({
        next: (response) => {
          response.forEach((label: any) => {
            this.paymentService.GetFullPaymentDetailsById(Number.parseInt(label.id), Number.parseInt(label.invoiceNumber)).subscribe({
              next: (invoiceResponse) => {
                this.printerService.getPrinterStatusObservable().pipe(take(1)).subscribe({
                  next: (isConnected) => {
                    if (!isConnected) {
                      this.printerService.connect(this.selectedCashier.ipAddress, this.selectedCashier.portNumber).then((connected) => {
                        if (connected) {
                          this.loading.hide();
                          this.printerService.printReceipt(invoiceResponse.paymentInfo);
                          this.loading.hide();
                          this.closeModal()
                          Swal.fire(this.messages.getTranslate('Labels.Success'), this.messages.getTranslate('Labels.PrintedSuccessfully'), 'success').finally(() => {
                          });
                        } else {
                          this.loading.hide();
                          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.FailedToConnect'), 'error').finally(() => {
                          });
                        }
                      });
                    } else {
                      this.loading.hide();
                      this.printerService.printReceipt(invoiceResponse.paymentInfo);
                      this.closeModal()
                      Swal.fire(this.messages.getTranslate('Labels.Success'), this.messages.getTranslate('Labels.PrintedSuccessfully'), 'success').finally(() => {
                      });
                    }
                  },
                  error: (error) => {
                    this.loading.hide();
                    this.closeModal();
                    Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.FailedToConnect'), 'error').finally(() => {
                    });
                  }
                });
              },
              error: (error) => {
                this.loading.hide();
                Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error').finally(() => {
                });
              }
            });
          });
        },
        error: (error) => {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error').finally(() => {
            this.loading.hide();
          });
        }
      });
    } catch (error) {
      this.loading.hide();
      Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error').finally(() => {
      });
    }
  }

  sendToPrinter() {
    if (!this.selectedCashier || this.selectedCashier.portNumber == null || this.selectedCashier.portNumber === 0 || !this.selectedCashier.ipAddress) {
      Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.SelectPrinter'), 'error');
      return;
    }

    this.printLabel();
  }

  openModal(template: TemplateRef<any>) {
    var isPagoSelected = this._modalHeadData.getValue();
    if (!this.selectedId) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.SelectDoc'), 'warning');
      return;
    }
    if (!(isPagoSelected == "PAGO" || isPagoSelected == "ADELANTO")) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.PaymentSelect'), 'warning');
      return;
    }

    const companyId = this.cred.credentials?.user.companyId;
    this.invoiceService.getAllCashier$(this.paginationCashier, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.cashierList = res.data
          console.log(res)
        },
        error: (error: any) => {
          console.error(error);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      });
    this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
  }

  closeModal() {
    if (this.modalRef) {
      this.selectedCashier = null;
      this.selectedCashierId = 0;
      this.modalRef.close();
    }
  }

  onChangeOfCashier(event: Event) {
    this.selectedCashierId = Number((event.target as HTMLSelectElement).value);
    this.selectedCashier = this.cashierList.find((x) => x.id === this.selectedCashierId);
  }

  cancelInvoice() {
    if (!this.selectedId) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('Labels.SelectDoc'), 'warning');
      return;
    }

    if (this.selectedRow.documentType !== "FACTURA") {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('InvoiceHistory.SelectInvoice'), 'warning');
      return;
    }

    if (this.selectedRow.paidAmount > 0 && this.selectedRow.paidAmount < this.selectedRow.total) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('InvoiceHistory.InvoicePartiallyPaid'), 'warning');
      return;
    }

    if (this.selectedRow.status == 1) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('InvoiceHistory.InvoiceAlreadyCancelled'), 'warning');
      return;
    }

    if (this.selectedRow.status == 2) {
      Swal.fire(this.messages.getTranslate('Labels.Warning'), this.messages.getTranslate('InvoiceHistory.InvoiceAlreadyPaid'), 'warning');
      return;
    }

    this.loading.show();
    this.invoiceService.IsElectronicInvoiceProcessed(this.cred.credentials?.user.companyId ?? 0, this.selectedRow.documentNumber).subscribe({
      next: (res) => {
        if (res?.success) {
          if (!res.data) {
            this.loading.hide();
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('InvoiceHistory.IsElectronicInvoiceProcessed'), 'error');
            return;
          }
          else {
            this.loading.hide();
            Swal.fire({
              text: this.messages.getTranslate('InvoiceHistory.ConfermationCancelInvoice'),
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: this.messages.getTranslate('Labels.Confirm'),
              cancelButtonText: this.messages.getTranslate('Labels.Cancel')
            }).then((result) => {
              if (result.isConfirmed) {

                this.loading.show();
                var param: CreditNoteInsertRequestModel = {
                  reconciliationId: 0,
                  companyId: this.cred.credentials?.user.companyId ?? 0,
                  clientOrSupplierType: "Cliente",
                  clientOrSupplierCode: this.selectedRow.client,
                  currencyCode: 188,
                  exchangeRate: this.selectedRow.exchangeRateSale,
                  amount: this.selectedRow.total,
                  observation: "Factura Electronica Anulada",
                  status: "Aplicado",
                  systemDate: this.getFormattedDateTime(),
                  transactionDate: new Date(this.selectedRow.date).toISOString(),
                  category: 0,
                  modifiedByUserId: Number.parseInt(this.cred.credentials?.user.id ?? '0'),
                  invoiceNumber: this.selectedRow.documentNumber,
                  creditNoteAction: "",
                  invoiceAmountInDollars: this.selectedRow.total,
                  invoiceAmountInColones: this.selectedRow.totalLocal,
                  accountingEntryCode: "",
                  applyElectronicInvoice: 0
                };
                this.invoiceService.insertCreditNote(param).subscribe({
                  next: (res) => {
                    if (res?.success && res?.data) {
                      this.InvoiceCraditsDetail = res.data;
                      this.invoiceService.cancelInvoice(
                        this.selectedRow.documentNumber,
                        this.cred.credentials?.user.companyId ?? 0,
                        this.cred.credentials?.user.username ?? ""
                      ).subscribe({
                        next: (cancelRes) => {
                          if (cancelRes) {
                            this.loading.hide();
                            Swal.fire(
                              this.messages.getTranslate('Labels.Success'),
                              this.messages.getTranslate('InvoiceHistory.CancelInvoiceSuccess'),
                              'success'
                            );
                            this.fetchFilteredRecords();
                          } else {
                            this.loading.hide();
                            Swal.fire(
                              this.messages.getTranslate('Labels.Error'),
                              this.messages.getTranslate('InvoiceHistory.CancelInvoiceFailed'),
                              'error'
                            );
                          }
                        },
                        error: () => {
                          this.loading.hide();
                          Swal.fire(
                            this.messages.getTranslate('Labels.Error'),
                            this.messages.getTranslate('Labels.InternalError'),
                            'error'
                          );
                        }
                      });

                    } else {
                      this.loading.hide();
                      Swal.fire(
                        this.messages.getTranslate('Labels.Error'),
                        this.messages.getTranslate('Labels.InternalError'),
                        'error'
                      );
                    }
                  },
                  error: () => {
                    this.loading.hide();
                    Swal.fire(
                      this.messages.getTranslate('Labels.Error'),
                      this.messages.getTranslate('Labels.InternalError'),
                      'error'
                    );
                  }
                });
              }
            });
          }
        } else {
          this.loading.hide();
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          return;
        }
      },
      error: (error) => {
        this.loading.hide();
        console.error(error);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error').finally(() => {
          this.closeModal();
        });
      }
    });
  }

  cancelPayment() {
    Swal.fire({
      text: this.messages.getTranslate('InvoiceHistory.ConfermationCancelPayment'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.messages.getTranslate('Labels.Confirm'),
      cancelButtonText: this.messages.getTranslate('Labels.Cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.cancelPayment(this.cred.credentials?.user.companyId ?? 0, this.selectedId, this.cred.credentials?.user.username ?? ""
        ).subscribe({
          next: (res) => {
            if (res !== 0) {
              Swal.fire(this.messages.getTranslate('Labels.Success'), this.messages.getTranslate('Labels.CancelPaymentSuccess'), 'success'
              ).finally(() => {
                this.fetchFilteredRecords();
              });
            } else {
              Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.CancelPaymentError'), 'error'
              );
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error').finally(() => {
              this.closeModal();
            });
          }
        });
      }
    });
  }

  getFormattedDateTime(): string {
    const now = new Date();
    const pad = (n: number, width: number = 2) => String(n).padStart(width, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const milliseconds = pad(now.getMilliseconds(), 3);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

}