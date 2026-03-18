import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from '../../services';
import { LoadingService } from '@app/@core';
import Swal from 'sweetalert2';
import { AggregatedResult, PointOfSaleDetail } from '../../models';

@Component({
  selector: 'app-sale-summary',
  templateUrl: './sale-summary.component.html'
})
export class SaleSummaryComponent implements OnInit {
  @Output() onClosingOfPointOfSale = new EventEmitter<boolean>();
  @Input() saleDetail: any;
  @Input() pointOfSaleDetail: any;
  cashInfo: AggregatedResult;
  totalPayment: number = 0;
  paidLocal: number = 0;
  paidDollar: number = 0;

  constructor(public activeModal: NgbActiveModal,
    private paymentService: PaymentService,
    private loading: LoadingService) { }

  ngOnInit(): void {

    this.totalPayment = this.saleDetail.reduce((sum: any, item: { totalPayments: any; }) => sum + item.totalPayments, 0);
    this.paidLocal = this.saleDetail.reduce((sum: any, item: { amountLocal: any; }) => sum + item.amountLocal, 0);
    this.paidDollar = this.saleDetail.reduce((sum: any, item: { amountDollar: any; }) => sum + item.amountDollar, 0);


    this.GetDetail();
    console.log('Point of Sale:', this.saleDetail);
    console.log('Point of Sale:', this.pointOfSaleDetail);
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  exportToExcel(): void {
    this.loading.show();
    this.paymentService.GetPointOfSaleDailyExcelReport(this.pointOfSaleDetail.companyId, this.pointOfSaleDetail.openingCode, 0, "")
      .subscribe({
        next: (blob) => {
          if (!blob || blob.size === 0) {
            Swal.fire({
              icon: 'info',
              title: 'No Data',
              text: 'No data found for this point of sale.',
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

  GetDetail(): void {
    this.loading.show();
    this.paymentService.GetPointOfDetailByOpeningCode(this.pointOfSaleDetail.companyId, this.pointOfSaleDetail.openingCode, 0, "")
      .subscribe({
        next: (resp) => {
          console.log("Result", this.calculateAggregatedResult(resp));

          this.cashInfo = this.calculateAggregatedResult(resp);
          if (!resp) {
            Swal.fire({
              icon: 'info',
              title: 'No Data',
              text: 'No data found for this point of sale.',
              confirmButtonText: 'OK'
            });
          }
          this.loading.hide();
          return;
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

  calculateAggregatedResult(reportData: PointOfSaleDetail[]): AggregatedResult {
    const aggregatedResult = {
      TotalDollerSum: 0,
      TotalLocalSum: 0,
      PaidLocal: 0,
      PaidDollar: 0,
      TotalChangeInLocal: 0,
      TotalChangeInDollar: 0,
      TotalLocalOnClosing: 0,
      TotalDollarsOnClosing: 0,
      CashOutAmountLocal: 0,
      CashOutAmountDollar: 0,
      CashInAmountLocal: 0,
      CashInAmountDollar: 0,
    };

    const filteredData = reportData.filter(x => x.paymentId === 0);
    const filteredPaymentData = reportData.filter(x => x.paymentId !== 0);
    const sortedData = filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const earliestRecord = sortedData[0];
    const restOfRecords = sortedData.slice(1);

    if (earliestRecord) {
      aggregatedResult.TotalDollerSum = earliestRecord.totalDoller;
      aggregatedResult.TotalLocalSum = earliestRecord.totalLocal;
    }
    aggregatedResult.PaidLocal = reportData
      .filter(x => x.currencyCode === "188" && x.paymentId !== 0)
      .reduce((sum, x) => sum + x.paidAmount, 0);

    aggregatedResult.PaidDollar = reportData
      .filter(x => x.currencyCode !== "188" && x.paymentId !== 0)
      .reduce((sum, x) => sum + x.paidAmount, 0);

    aggregatedResult.TotalChangeInLocal = reportData
      .filter(x => x.currencyCode === "188")
      .reduce((sum, x) => sum + x.changeInLocal, 0);

    aggregatedResult.TotalChangeInDollar = reportData
      .filter(x => x.currencyCode !== "188")
      .reduce((sum, x) => sum + x.changeInDollar, 0);

    aggregatedResult.TotalLocalOnClosing = aggregatedResult.TotalLocalSum - aggregatedResult.TotalChangeInLocal;
    aggregatedResult.TotalDollarsOnClosing = aggregatedResult.TotalDollerSum - aggregatedResult.TotalChangeInDollar;

    reportData
      .filter(x => x.paymentId === 0 && x.totalLocal < 0)
      .forEach(x => {
        aggregatedResult.CashOutAmountLocal += x.totalLocal;
      });

    reportData
      .filter(x => x.paymentId === 0 && x.totalDoller < 0)
      .forEach(x => {
        aggregatedResult.CashOutAmountDollar += x.totalDoller;
      });

    restOfRecords
      .filter(x => x.paymentId === 0 && x.totalLocal > 0)
      .forEach(x => {
        aggregatedResult.CashInAmountLocal += Math.abs(x.totalLocal);
      });

    restOfRecords
      .filter(x => x.paymentId === 0 && x.totalDoller > 0)
      .forEach(x => {
        aggregatedResult.CashInAmountDollar += Math.abs(x.totalDoller);
      });

    return aggregatedResult;
  }

  ClosePointOfSale() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to close this point of sale?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.show();
        this.paymentService.closePointOfSale(this.pointOfSaleDetail.openingCode).subscribe({
          next: (resp) => {
            this.onClosingOfPointOfSale.emit(true);
            this.loading.hide();
          },
          error: (err) => {
            console.error('Error closing point of sale:', err);
            let errorMessage = 'An error occurred while closing point of sale.';
            if (err.status === 404) {
              errorMessage = 'No data found.';
            } else if (err.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              confirmButtonText: 'OK'
            });

            this.loading.hide();
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Point of sale closure was cancelled.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}