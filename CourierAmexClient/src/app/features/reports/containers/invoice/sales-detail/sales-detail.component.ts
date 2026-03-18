import { inject, Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericAction } from '@app/models';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { ReportsService } from '@app/features/reports/services';
import { Router } from '@angular/router';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { CustomerModel } from '@app/features/customer';
import { SearchCustomerComponent } from '@app/@shared';

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrl: './sales-detail.component.scss'
})
export class SalesDetailComponent {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  @ViewChild(SearchCustomerComponent) searchCustomer!: SearchCustomerComponent;
  isLocked: boolean;
  isGatewayUser = false;
  startDate = '';
  endDate = '';
  selectedCompanyId = 0;
  selectedCompanyName = '';
  companies: CompanyModel[] = [];
  allcustomer: boolean = false;
  customer: boolean = true;
  customerCode: string = ""
  constructor(
    private loadingService: LoadingService,
    private credentialsService: CredentialsService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private router: Router,
    private messageService: MessageService,

  ) {
    this.isGatewayUser = !this.credentialsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentialsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
  }


  ngOnInit(): void {
    this.setDefaultCompany();
    this.initializeDates();
  }
  openDatePickerFrom(): void {
    this.dateInputFrom.nativeElement.showPicker();
  }
  openDatePickerTo(): void {
    this.dateInputTo.nativeElement.showPicker();
  }
  private initializeDates(): void {
    const toISOStringDate = (date: Date) => date.toISOString().slice(0, 10);

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Subtract 7 days

    this.startDate = toISOStringDate(lastWeek);
    this.endDate = toISOStringDate(today);
  }
  private setDefaultCompany(): void {
    if (this.credentialsService.isGatewayUser()) {
      const userCia = this.credentialsService.credentials?.user.companyId;
      console.log("userCia", userCia);
      if (userCia) {
        this.selectedCompanyId = userCia;
      }
    }
  }

  public getExcel_exportSalesReport(form?: NgForm) {

    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    if (this.customerCode == '' && this.customer == true) {
      Swal.fire("Error","Please choose a customer to proceed with this action.","error");
      return;
    }
    this.customerCode = this.allcustomer ? '' : this.customerCode;
    this.loadingService.show();
    console.log(new Date(this.startDate), new Date(this.endDate), this.selectedCompanyId, this.customerCode, this, this.customer, this.allcustomer)
    this.reportService.exportSalesReport(new Date(this.startDate), new Date(this.endDate), this.selectedCompanyId, this.customerCode).subscribe(blob => {
      this.loadingService.hide();
      this.customerCode = ''; 
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'sales_details_Report_' + this.startDate + '_to_' + this.endDate + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'), "Report Generated Successfully", 'success');

    });
  }
  toggleCustomer() {
    if (this.customer) {
      //this.selectedPaytype = 0; // or null if 0 still considered invalid
      this.allcustomer = false;
      this.isLocked = false;

    }
  }
  toggleAllcustomer() {
    if (this.allcustomer) {
      this.customer = false
      this.isLocked = true;
      this.customerCode = ''; // or null if 0 still considered invalid
    }
  }

  onSearchCustomer(action: GenericAction<CustomerModel>): void {
    console.log("onSearchCustomer", action,)
    if (action.data)
      this.customerCode = action.data?.code;

    // switch (action.action) {
    //   case 'update':
    //     this.getExcel_exportSalesReport();
    //     break;
    //   case 'click':
    //     this.getExcel_exportSalesReport();
    //     break;
    //   case 'clear':
    //     this.customerCode = '';
    //     break;
    // }
  }

}
