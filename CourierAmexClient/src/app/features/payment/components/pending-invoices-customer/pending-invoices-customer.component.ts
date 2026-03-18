import { ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ClientCashierService, CompanyModel } from '@app/features/company';
import { CustomerService } from '@app/features/customer';
import { PackageStatusModel } from '@app/features/general';
import { InvoiceService } from '@app/features/invoice/services';
import { PackageModel } from '@app/features/package';
import { defaultPagination, PackageListByInvoice, PaginationModel } from '@app/models';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, finalize, forkJoin, take } from 'rxjs';
import Swal from 'sweetalert2';
import { PaymentModelComponent } from '../payment-model/payment-model.component';
import { PaymentService } from '@app/features/payment/services/payment.service';
import { is } from 'date-fns/locale';
import { PrinterService } from '@app/@core/services/printer.service';

@Component({
  selector: 'app-pending-invoices-customer',
  templateUrl: './pending-invoices-customer.component.html'
})
export class PendingInvoicesCustomerComponent {
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @Output() closePage = new EventEmitter<void>();
  @Input() selectedPointOfSale: any;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<PackageModel[]>([]);
  entities$ = this._entities.asObservable();
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  selectedInvoiceList: string;
  selectedStatusList: string[] = [];
  isInvalidPayment: boolean = false;
  packageListByInvoice: PackageListByInvoice[] = [];
  invoicePendingPayment = true;
  partialPaymentInValid: boolean;
  InvoiceCraditsDetail: any;
  fullName: string = '';
  selectedRow: any;
  totalDollar: number = 0;
  totalLocal: number = 0;
  customerCode: string = '';
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    companyName: '',
    code: '',
    fullName: '',
    action: ''
  };

  constructor(
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private printerService: PrinterService

  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'InvoiceHistory.CustomerCode',
      'InvoiceHistory.CustomerName',
      'InvoiceHistory.Company',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.code = translations['InvoiceHistory.CustomerCode'];
          this.translations.fullName = translations['InvoiceHistory.CustomerName'];
          this.translations.companyName = translations['InvoiceHistory.Company'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
    this.setDefaultCompany();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.changeDetectorRef.detectChanges();
  }

  onStateChange(state: TableState) {
    this.state = { ...state };
    this.pagination = {
      ...this.pagination,
      c: state.searchTerm,
      pi: state.page,
      ps: state.pageSize,
      s: `${state.sortColumn} ${state.sortDirection}`
    };
    this.performSearch();
  }

  selectCompany(entity: CompanyModel | undefined): void {
    this.selectedCompany = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    this.customerService.getPagedByCompany$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.updatePagination();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res: any) => {
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);
    forkJoin({
      companies: this.commonService.getCompanies$(),
    })
      .subscribe({
        next: (res) => {
          if (res.companies && res.companies.length > 0) {
            this._companies.next(res.companies ?? []);
            this.selectCompany(res.companies[0]);
            this._companies.pipe(take(1)).subscribe(() => {
              this.setDefaultCompany();
            });
          }
          this.loading.hide();
        },
        error: (error) => {
          console.error(error);
          this.loading.hide();
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      const cias = this._companies.value;
      if (cias && cias.length > 0) {
        const userCia = cias.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectCompany(userCia);
          return;
        }
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  }

  viewDetail(param: any) {
    this.selectedRow = param;
    param.companyId = this.selectedCompany?.id;
    console.log(param);
    this.packageListByInvoice = [];
    this.totalDollar = 0;
    this.totalLocal = 0;
    this.fullName = param.fullName;
    this.customerCode = param.code;
    this.invoiceService.InvoicesPendingByCustomer(param.code).subscribe({
      next: (response) => this.InvoiceCraditsDetail = response.data,
      error: (err) => console.error('Error fetching invoices:', err)
    });
  }

  updatePagination(): void {
    this.pagination = { ...this.pagination, tr: this._entities.value?.length || 0 };
  }

  getInvoicesPendingByCustomer(customerCode: any) {
    this.packageListByInvoice = [];
    this.invoiceService.InvoicesPendingByCustomer(customerCode).subscribe({
      next: (response) => this.InvoiceCraditsDetail = response.data,
      error: (err) => console.error('Error fetching invoices:', err)
    });
  }

  closeScreen(): void {
    this.closePage.emit();
  }

  invoicePendingPaymentDetail(event: any): void {
    const { unChecked, balance, localBalance, status, invoiceNumber } = event;
    const statusArray = status.toString().split(',').map((s: string) => s.trim());

    if (unChecked) {
      this.removeInvoice(invoiceNumber, balance, localBalance, statusArray);

      this.selectedInvoiceList = this.selectedInvoiceList
        .split(',')
        .filter(inv => inv !== invoiceNumber)
        .join(',');
    } else {
      this.addInvoice(event, balance, localBalance, statusArray);

      const invoices = this.selectedInvoiceList ? this.selectedInvoiceList.split(',') : [];
      if (!invoices.includes(invoiceNumber)) {
        invoices.push(invoiceNumber);
      }

      this.selectedInvoiceList = invoices.join(',');
    }
    this.isInvalidPayment = this.selectedStatusList.includes('0') && this.selectedStatusList.includes('3');
  }

  addInvoice(event: any, balance: number, localBalance: number, statusArray: string[]): void {
    this.getPackageByInvoice(event);
    this.totalDollar = parseFloat((this.totalDollar + balance).toFixed(2));
    this.totalLocal = parseFloat((this.totalLocal + localBalance).toFixed(2));
    this.selectedStatusList = [...new Set([...this.selectedStatusList, ...statusArray])];
  }

  removeInvoice(invoiceNumber: string, balance: number, localBalance: number, statusArray: string[]): void {
    this.packageListByInvoice = this.packageListByInvoice.filter(item => item.invoiceNumber !== invoiceNumber);
    this.totalDollar = parseFloat((this.totalDollar - balance).toFixed(2));
    this.totalLocal = parseFloat((this.totalLocal - localBalance).toFixed(2));
    this.selectedStatusList = this.selectedStatusList.filter(status => !statusArray.includes(status));
    this.isValidPartialPayment();
  }

  getPackageByInvoice(invoice: any): void {
    this.loading.show();
    this.invoiceService.GetPackagesByInvoice(invoice.invoiceNumber).subscribe({
      next: (response) => {
        this.loading.hide();
        if (response.success) {
          this.packageListByInvoice = [...this.packageListByInvoice, ...response.data];
          this.isValidPartialPayment();
        }
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        this.loading.hide();
      }
    });
  }

  openPaymentModal(isPartialPayment: boolean, isPayModel: boolean): void {
    if (!this.selectedInvoiceList.length) {
      Swal.fire("Warning", "Please select an invoice to make payment.", "warning");
      return;
    }

    if (isPartialPayment && this.partialPaymentInValid) {
      Swal.fire("Warning", "Please select a single invoice to make partial payment.", "warning");
      return;
    }

    if (this.isInvalidPayment) {
      Swal.fire("Warning", "Cannot make payment. Please select a valid invoice.", "warning");
      return;
    }

    const modalRef = this.modalService.open(PaymentModelComponent, {
      size: 'lg', backdrop: 'static', keyboard: false, centered: true
    });
    modalRef.componentInstance.data = {
      isPartialPayment,
      isPayModel,
      totalDollar: this.totalDollar,
      totalLocal: this.totalLocal,
      customerCode: this.customerCode,
      pointOfSaleId: this.selectedPointOfSale.pointOfSaleId
    };
    modalRef.componentInstance.onFormSubmit.subscribe((paymentData: any) => {
      this.submitForToPaynment(paymentData)
    });
  }

  submitForToPaynment(paymentData: any): void {
    const obj = {
      customerId: this.selectedRow.id,
      invoiceCSV: Array.isArray(this.selectedInvoiceList) ? this.selectedInvoiceList.join(",") : this.selectedInvoiceList,
      localAmount: this.totalLocal,
      dollarAmount: this.totalDollar,
      paidAmount: paymentData.payReceived ?? 0,
      changeAmount: Number(paymentData?.change ?? 0),
      currencyCode: Number(paymentData.selectedCurrency),
      paymentType: paymentData.isPartialPayment ? "ADELANTO" : "PAGO",
      subPaymentTypeId: paymentData.selectedSubPaymentId,
      reference: paymentData.refrence ?? "",
      pointOfSaleId: this.selectedPointOfSale.pointOfSaleId,
      companyId: this.selectedCompany?.id ?? 0,
      partialPayment: paymentData.isPartialPayment,
      creditPayment: paymentData.payReceived < this.totalDollar,
      user: this.credentailsService.credentials?.user.username ?? ""
    };

    this.paymentService.paymentForInvoice(
      obj.customerId,
      obj.invoiceCSV,
      obj.localAmount,
      obj.dollarAmount,
      obj.paidAmount,
      obj.changeAmount,
      obj.currencyCode,
      obj.paymentType,
      obj.subPaymentTypeId,
      obj.reference,
      obj.pointOfSaleId,
      obj.companyId,
      obj.partialPayment,
      obj.creditPayment,
      obj.user
    ).subscribe({
      next: (resp) => {
        console.log(resp);
        this.getInvoicesPendingByCustomer(this.customerCode);
        this.printLabel(resp);
        Swal.fire({
          title: "Payment Successful!",
          text: "The payment has been processed successfully.",
          icon: "success",
          confirmButtonText: "OK"
        });

        this.selectedInvoiceList = '';
        this.totalLocal = 0;
        this.totalDollar = 0;

      },
      error: (err) => {
        console.error("Payment Failed:", err);
        Swal.fire({
          title: "Payment Failed!",
          text: "Something went wrong while processing the payment.",
          icon: "error",
          confirmButtonText: "Try Again"
        });
      }
    });

  }

  Payment(): void {
    this.openPaymentModal(false, true);
  }

  partialPayment(): void {
    this.openPaymentModal(true, false);
  }

  isValidPartialPayment(): void {
    this.partialPaymentInValid = new Set(this.packageListByInvoice?.map(x => x.invoiceNumber)).size > 1;
  }


  printLabel(paymentId: any) {
    try {
      this.loading.show();
      this.invoiceService.GetPaymentDetailsForLabel(this.credentailsService.credentials?.user.companyId ?? 0, paymentId ?? 0).subscribe({
        next: (response) => {
          response.forEach((label: any) => {
            this.paymentService.GetFullPaymentDetailsById(Number.parseInt(label.id), Number.parseInt(label.invoiceNumber)).subscribe({
              next: (invoiceResponse) => {
                this.printerService.getPrinterStatusObservable().pipe(take(1)).subscribe({
                  next: (isConnected) => {
                    if (!isConnected) {
                      this.paymentService.getPayById$(this.selectedPointOfSale.pointOfSaleId).subscribe((res) => {
                        this.printerService.connect(res.data.ipAddress, res.data.portNumber).then((connected) => {
                          if (connected) {
                            this.loading.hide();
                            this.printerService.printReceipt(invoiceResponse.paymentInfo);
                            this.printerService.printReceipt(invoiceResponse.paymentInfo, false);
                            this.loading.hide();
                            Swal.fire(this.messageService.getTranslate('Labels.Success'), this.messageService.getTranslate('Labels.PrintedSuccessfully'), 'success').finally(() => {
                            });
                          } else {
                            this.loading.hide();
                            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.FailedToConnect'), 'error').finally(() => {
                            });
                          }
                        });
                      })
                    } else {
                      this.loading.hide();
                      this.printerService.printReceipt(invoiceResponse.paymentInfo);
                      this.printerService.printReceipt(invoiceResponse.paymentInfo, false);
                      //this.closeModal()
                      Swal.fire(this.messageService.getTranslate('Labels.Success'), this.messageService.getTranslate('Labels.PrintedSuccessfully'), 'success').finally(() => {
                      });
                    }
                  },
                  error: (error) => {
                    this.loading.hide();
                    //this.closeModal();
                    Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.FailedToConnect'), 'error').finally(() => {
                    });
                  }
                });
              },
              error: (error) => {
                this.loading.hide();
                Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error').finally(() => {
                });
              }
            });
          });
        },
        error: (error) => {
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error').finally(() => {
            this.loading.hide();
          });
        }
      });
    } catch (error) {
      this.loading.hide();
      Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error').finally(() => {
      });
    }
  }
}
