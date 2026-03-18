import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CustomerDetailComponent } from '../customer-detail/customer-detail.component';
import { InvoiceService } from '@app/features/invoice/services';
import { CredentialsService, LoadingService } from '@app/@core';

@Component({
  selector: 'app-invoices-packages',
  templateUrl: './invoices-packages.component.html'
})
export class InvoicesPackagesComponent {
  @Input() Packages: any;
  paymentInfo: any;
  isInvoice: boolean
  invoicePayment: any[]= [];
  isPaymentForInvoice: boolean = false;
  dataReceived: Subject<any[]> = new Subject<any[]>();
  parent: CustomerDetailComponent;
  constructor(public activeModal: NgbActiveModal,
    parent: CustomerDetailComponent,
    private loading: LoadingService,
    private InvoiceService: InvoiceService,
    private cre: CredentialsService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.parent = parent;
  }

  ngOnInit() {
    this.parent.packagesData$.subscribe(data => {
      this.Packages = data;
      this.paymentInfo = data;
      console.log(this.paymentInfo);
    });

    this.parent.modalHead$.subscribe(data => {
      this.isInvoice = data === "FACTURA";
      this.loading.show();
      if (this.isInvoice) {
        this.InvoiceService.GetPaymentInfoByInvoiceId(this.cre.credentials?.user.companyId, this.Packages[0].invoiceNumber).subscribe((res: any) => {
          if (res) {
            this.invoicePayment = res;

            if (this.invoicePayment.length > 0) {
              this.isPaymentForInvoice = true;
            }
            this.loading.hide();
            this.changeDetectorRef.detectChanges();
          }
        });
      }
      else{
        this.isPaymentForInvoice = false;
        this.loading.hide();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['Packages']?.currentValue) {
      this.paymentInfo = changes['Packages']?.currentValue;
    }
    this.changeDetectorRef.detectChanges();
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}