import { inject, Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { Router } from '@angular/router';
import { CustomerService } from '@app/features/customer';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enabled-credit',
  templateUrl: './enabled-credit.component.html',
  styleUrl: './enabled-credit.component.scss'
})
export class EnabledCreditComponent {

  isLocked: boolean;
  isGatewayUser = false;
  selectedCompanyId = 0;
  selectedCompanyName = '';
  companies: CompanyModel[] = [];
  allcustomer: boolean = false;
  customer: boolean = true;
  customerCode: string = ""
  customerList: any[] = [];
  customerCreditList: any[] = []
  searchValue: string = "";
  selectedProduct: any;
  selectedRow = 0;
  disableCreditList:any[]=[];
  disabledCustomer: string=""
  allowCreditBtn:boolean=false
  disabledCreditBtn:boolean=false

  constructor(
    private loadingService: LoadingService,
    private credentialsService: CredentialsService,
    private toastr: ToastrService,
    private customerService: CustomerService

  ) {
    this.isGatewayUser = !this.credentialsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentialsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
  }


  ngOnInit(): void {
    this.setDefaultCompany();
    this.getAll_customers_enabled();
  }

  private setDefaultCompany(): void {
    if (this.credentialsService.isGatewayUser()) {
      const userCia = this.credentialsService.credentials?.user.companyId;
      if (userCia) {
        this.selectedCompanyId = userCia;
      }
    }
  }

  private getAll_customers_enabled(): void {
    this.loadingService.show();
    this.customerService.GetAll_customers_enabled$(this.selectedCompanyId)
      .pipe(
        filter(res => res.data?.length > 0),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          this.customerList = res.data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  
  private clients_credit_search(): void {
    this.loadingService.show();
    this.customerService.clients_credit_search$(this.selectedCompanyId, this.disabledCustomer)
      .pipe(
        filter(res => res.data?.length > 0),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          this.disableCreditList = res.data;
          if(this.disableCreditList.length>0){
            this.allowCreditBtn=true
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  
  onSearchCustomer(event: any) {
    if (typeof event.value === 'string' && event.value.trim() !== '') {
      this.disabledCustomer=event.value
      this.clients_credit_search();
    }
    if (event.value && typeof event.value === 'object' && Object.keys(event.value).length > 0) {
      this.customerCode = event.value.customerCode;
     // this.AllowCredit();
    }
  }


  onRowClick(customerlist: any, i: number) {
    this.selectedRow = i;
    this.customerCode = customerlist.customerCode;
    this.disabledCreditBtn=true
  }

  AllowCredit() {
    this.loadingService.show();
    this.customerService.enable_credit$(this.selectedCompanyId, this.customerCode)
      .pipe(
        filter(res => res.data?.length > 0),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          Swal.fire("Success","Credit Enable Successfully.","success")
          this.disableCreditList=[];
          this.allowCreditBtn=false
          this.getAll_customers_enabled();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  RemoveCredit() {
    this.customerService.disable_credit$(this.selectedCompanyId, this.customerCode)
      .pipe(
        filter(res => res.data?.length > 0),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          Swal.fire("Success","Credit Disabled Successfully.","success")
          this.disabledCreditBtn=false;
          this.getAll_customers_enabled();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}