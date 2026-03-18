import { Component, TemplateRef, ViewChild, Input, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PendingInvoicesCustomerComponent } from '../pending-invoices-customer/pending-invoices-customer.component';
import { SaleSummaryComponent } from '../sale-summary/sale-summary.component';
import { PaymentService } from '../../services';
import Swal from 'sweetalert2';
import { LoadingService } from '@app/@core';
import { HttpClient } from '@angular/common/http';

import * as JsBarcode from "jsbarcode";
import { PrinterService } from '@app/@core/services/printer.service';
import { WeightReaderService } from '@app/@core/services/weight-reader.service';
import { ToastrService } from 'ngx-toastr';
declare var epson: any;
@Component({
  selector: 'app-open-close-point-of-sale-form',
  templateUrl: './open-close-point-of-sale-form.component.html',
  inputs: ['pointOfSaleList'],
  outputs: ['onSaleStart', 'reFreshPointOfSale']
})
export class OpenClosePointOfSaleFormComponent {
  @ViewChild('tlprint', { static: false }) tlprint!: ElementRef<HTMLAnchorElement>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild('tlprintFrame', { static: false }) tlprintFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  @ViewChild('closePointOfSaleRef') closePointOfSaleRef!: TemplateRef<any>;
  onSaleStart = new EventEmitter<any>();
  reFreshPointOfSale = new EventEmitter<any>();

  isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);


  tcpAddress: string = '10.0.0.1';
  tcpPort: number = 8001;
  dataToSend: string = 'type here...';
  dataReceived: string = '';
  private printer: any;
  private ePosDev: any;
  selectedDate: { [key: string]: string } = {};
  pointOfSaleList: any;
  selectedPointOfSale: number;
  showPendingInvoices: boolean = false;
  modalRef!: NgbModalRef;
  isClosed: boolean = false;
  transactionType: string = "";
  isFormValid: boolean = false;
  totalAmountDollar: number;
  totalAmountLocal: number;
  form: any;
  packageNumber: number;
  constructor(private modalService: NgbModal,
    private renderer: Renderer2,
    private loading: LoadingService,
    private paymentService: PaymentService,
    private http: HttpClient,
    private toastr: ToastrService,
    private weightReaderService: WeightReaderService,
    private printerService: PrinterService
  ) { }


  ngOnInit(): void {
    this.setDefaultDates()
  }

  openModal(template: TemplateRef<any>, item: any) {
    this.totalAmountDollar = 0;
    this.totalAmountLocal = 0;
    this.form = item;
    this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
  }

  openCashInOutModal(template: TemplateRef<any>, item: any) {
    this.totalAmountDollar = 0;
    this.totalAmountLocal = 0;
    this.form = item;
    this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  confirmOpenSale() {
    if (this.isFormValid) {
      var obj = {
        totalAmountDollar: this.totalAmountDollar ?? 0,
        totalAmountLocal: this.totalAmountLocal ?? 0,
        pointOfSaleId: this.form.pointOfSaleId,
        companyId: this.form.companyId
      };

      this.onSaleStart.emit(obj);

      this.isClosed = true;
      this.closeModal();
      return;
    }
  }

  cashInOut(isCashIn: boolean) {
    if (this.isFormValid) {
      var obj = {
        totalAmountDollar: isCashIn ? this.totalAmountDollar ?? 0 : -this.totalAmountDollar,
        totalAmountLocal: isCashIn ? this.totalAmountLocal ?? 0 : -this.totalAmountLocal,
        pointOfSaleId: this.form.pointOfSaleId,
        companyId: this.form.companyId,
        openingId: this.form.openingCode
      };
      this.onSaleStart.emit(obj);

      this.isClosed = true;
      this.closeModal();
      return;
    }
  }

  validateFields() {
    this.isFormValid = (this.totalAmountDollar !== null && this.totalAmountDollar > 0) ||
      (this.totalAmountLocal !== null && this.totalAmountLocal > 0);
  }

  isInvalid(field: any) {
    return field.invalid && field.touched;
  }

  openContinueModal(item: any) {
    this.selectedPointOfSale = item;
    this.showPendingInvoices = true;
  }

  closePendingInvoices() {
    this.showPendingInvoices = false;
  }

  closePointOfSale(item: any) {
    this.paymentService.getPointOfSaleDailySummary(item.companyId, item.openingCode).subscribe((data: any) => {
      if (data) {
        const modelRef = this.modalService.open(SaleSummaryComponent, {
          size: 'xl', backdrop: 'static', keyboard: false, centered: true
        });
        modelRef.componentInstance.saleDetail = data;
        modelRef.componentInstance.pointOfSaleDetail = item;
        modelRef.componentInstance.onClosingOfPointOfSale.subscribe((result: boolean) => {
          if (result) {
            this.reFreshPointOfSale.emit(result)
          }
        });
      }
    });

  }

  setDefaultDates() {
    if (this.pointOfSaleList) {
      this.pointOfSaleList.forEach((item: any) => {
        if (!this.selectedDate[item.pointOfSaleId]) {
          this.selectedDate[item.pointOfSaleId] = new Date().toISOString().split('T')[0];
        }
      });
    }
  }

  handleDailySales(dailyData: any) {
    this.loading.show();

    if (!this.selectedDate[dailyData.pointOfSaleId]) {
      this.loading.hide();
      console.log(this.selectedDate);

      Swal.fire({
        icon: 'info',
        title: 'Date Required',
        text: 'Please select a date before proceeding.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.paymentService
      .GetPointOfSaleDailyExcelReport(dailyData.companyId, 0, dailyData.pointOfSaleId, this.selectedDate[dailyData.pointOfSaleId])
      .subscribe({
        next: (blob) => {
          if (!blob || blob.size === 0) {
            Swal.fire({
              icon: 'info',
              title: 'No Data',
              text: 'No data found for the selected date and company.',
              confirmButtonText: 'OK'
            });
            this.loading.hide();
            return;
          }

          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = 'PointOfSaleDailyReport.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
          this.loading.hide();
        },
        error: (err) => {
          console.error('Error fetching report:', err);

          let errorMessage = 'An error occurred while fetching the report.';
          if (err.status === 404) {
            errorMessage = 'No data found.';
          } else if (err.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          Swal.fire({
            icon: 'info',
            title: 'Warning',
            text: errorMessage,
            confirmButtonText: 'OK'
          });

          this.loading.hide();
        }
      });
  }
}