import { Component, Input, SimpleChanges, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from '../../services';
import { CredentialsService } from '@app/@core';

@Component({
  selector: 'app-payment-model',
  templateUrl: './payment-model.component.html'
})
export class PaymentModelComponent implements OnInit, OnChanges {
  @Output() onFormSubmit = new EventEmitter<any>();
  @Input() data: any = {};

  isFormValid: boolean = false;
  selectedCurrency: string = '188';
  errorMessage: string = '';
  paymentType: any[] = [];
  subPaymentType: any[] = [];
  isPayTypeCash: boolean = false;
  isRefrence: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private paymentService: PaymentService,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    if (this.credentialsService.isGatewayUser()) {
      this.getPaymentType(this.credentialsService.credentials?.user.companyId ?? 0);
    }
    this.data.selectedPaymentId = 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      console.log('Current Data:', changes['data'].currentValue);
    }
  }

  onCurrencyChange(value: string): void {
    this.selectedCurrency = value;
    Object.assign(this.data, { payReceived: '', change: '', selectedSubPaymentId: 0 });
    this.errorMessage = '';
    this.getSubPaymentType();
  }

  validateAmount(): void {
    const payReceived = Number(this.data.payReceived) || 0;
    const total = this.selectedCurrency === '840' ? this.data.totalDollar : this.data.totalLocal;

    this.errorMessage = '';
    this.data.refrenceErrorMessage = '';

    if (this.data.isPayModel) {
      if (payReceived < total && this.isRefrence) {
        this.errorMessage = 'Please enter a value greater than or equal to the total';
      } else if (payReceived === total) {
        this.data.isPartialPayment = false;
      } else if (payReceived > total && !this.data.isPartialPayment && this.isPayTypeCash) {
        this.data.change = payReceived - total;
      } else {
        this.data.change = 0;
      }
    } else if (payReceived > total && this.isRefrence) {
      this.errorMessage = 'Please enter a value less than or equal to the total';
    }
  }

  onSubmit(): void {
    this.validateAmount();
    if (!this.isRefrence) this.validateForm();

    if (this.errorMessage || this.data.refrenceErrorMessage) return;

    if (!this.data.selectedPaymentId || this.data.selectedPaymentId === "0") {
      this.errorMessage = 'Please select a Payment Method';
      return;
    }

    if (!this.data.selectedSubPaymentId || this.data.selectedSubPaymentId === "0") {
      this.errorMessage = 'Please select a Payment Type';
      return;
    }

    if (this.isPayTypeCash && (!this.data.payReceived || this.data.payReceived <= 0)) {
      this.errorMessage = 'Please enter a valid Payment Received amount';
      return;
    }

    if (!this.isPayTypeCash && !this.data.payReceived) {
      this.data.payReceived = this.selectedCurrency === '840' ? this.data.totalDollar : this.data.totalLocal;
    }

    if (!this.isRefrence && (!this.data.refrence || this.data.refrence.trim() === '')) {
      this.data.refrenceErrorMessage = 'Please enter a valid reference';
      return;
    }

    const selectedPayment = this.paymentType.find(x => x.paymentId == Number(this.data.selectedPaymentId));
    this.data.selectedPaymentId = selectedPayment ? selectedPayment.description : '';
    this.data.selectedCurrency = this.selectedCurrency;

    this.onFormSubmit.emit(this.data);
    this.activeModal.dismiss();
  }

  validateForm(): void {
    this.data.refrenceErrorMessage = this.isRefrence && (!this.data.refrence || this.data.refrence.trim() === '')
      ? 'Please enter a valid reference'
      : '';
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  getPaymentType(companyId: number): void {
    this.paymentService.getPaymentType(companyId).subscribe((res: any) => {
      this.paymentType = res;
    });
  }

  getSubPaymentType(): void {
    this.isPayTypeCash = this.data.selectedPaymentId == 1;
    this.isRefrence = this.data.selectedPaymentId === "1";

    this.paymentService.getSubPaymentTypeByPaymentId(
      this.credentialsService.credentials?.user.companyId ?? 0,
      this.data.selectedPaymentId,
      this.data.pointOfSaleId
    ).subscribe((res: any) => {
      this.subPaymentType = res.filter((x: any) => x.currencyCode == this.selectedCurrency);
    });
  }

  onSubTypeChange(): void {
    const subPayment = this.subPaymentType.find(x => x.subPaymentId == this.data.selectedSubPaymentId);
    if (subPayment) {
      this.selectedCurrency = subPayment.currencyCode;
    }
    this.isFormValid = true;
  }
}