import { Component, inject } from '@angular/core';
import { PaymentService } from '../../services';
import { CommonService, CredentialsService, LoadingService } from '@app/@core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-open-close-point-of-sale',
  templateUrl: './open-close-point-of-sale.component.html'
})
export class OpenClosePointOfSaleComponent {

  pointOfSaleList: any;
  companyList: any;

  constructor(private paymentService: PaymentService,
    private credentailsService: CredentialsService,
    private commonService: CommonService,
    private loading: LoadingService
  ) {
    const router = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      router.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }

    this.commonService.getCompanies$().subscribe((cias: any[]) => {


      if (cias && cias.length > 0) {
        const userCia = cias.find((c: { id: number | undefined; }) => c.id === this.credentailsService.credentials?.user.companyId);
        this.companyList = cias;
        if (userCia) {
          this.companyList = userCia;
          return;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getPointOfSale();
    this.setDefaultCompany();
  }

  getPointOfSale() {
    this.loading.show();
    var companyId = this.credentailsService.credentials?.user.companyId ?? 0
    this.paymentService.getPointOfSale(companyId, this.credentailsService.credentials?.user.username ?? '', 1).subscribe({
      next: (list: any) => {
        this.pointOfSaleList = list;
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.loading.hide();
        console.log("Execution completed");
      }
    })
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      this.commonService.getCompanies$().subscribe((cias: any[]) => {
        if (cias && cias.length > 0) {
          const userCia = cias.find((c: { id: number | undefined; }) => c.id === this.credentailsService.credentials?.user.companyId);
          if (userCia) {
            return;
          }
        }
      });
    }
  }

  onFormSubmit(event: any) {
    if (event) {
      console.log("event", event);
      this.openSale(event);
    }
  }

  reFreshPointOfSale(event: any) {
    if (event) {
      console.log("reFreshPointOfSale event", event);
      this.getPointOfSale();
    }
  }

  openSale(pointOfSale: any) {
    if (pointOfSale.openingId) {
      this.paymentService.CashInOut(this.credentailsService.credentials?.user.companyId ?? 0, this.credentailsService.credentials?.user.username ?? '', pointOfSale.pointOfSaleId, pointOfSale.totalAmountDollar, pointOfSale.totalAmountLocal, pointOfSale.openingId).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response === 1) {
            Swal.fire({
              icon: 'success',
              title: 'Point of Sale Opened',
              text: 'The point of sale has been opened successfully!'
            });
          }
          this.getPointOfSale();
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          console.log("Execution completed");
        }
      });
    }
    else {
      this.paymentService.startPointOfSale(this.credentailsService.credentials?.user.companyId ?? 0, this.credentailsService.credentials?.user.username ?? '', pointOfSale.pointOfSaleId, pointOfSale.totalAmountDollar, pointOfSale.totalAmountLocal).subscribe({
        next: (response: any) => {
          console.log(response);
          if (response === 1) {
            Swal.fire({
              icon: 'success',
              title: 'Point of Sale Opened',
              text: 'The point of sale has been opened successfully!'
            });
          }
          this.getPointOfSale();
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          console.log("Execution completed");
        }
      });
    }
  }
}