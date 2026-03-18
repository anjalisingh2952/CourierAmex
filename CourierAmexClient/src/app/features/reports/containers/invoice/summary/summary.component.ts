import { Component, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PaginationModel, GenericAction, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService,MessageService } from '@app/@core';
import { CompanyModel, ProductModel } from '@app/features/company';
import { PackageModel } from '@app/features/package/models';
import { CustomerModel } from '@app/features/customer';
import { ReportsService } from '@app/features/reports/services';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  @ViewChild('form', { read: NgForm }) form!: NgForm;

  onCustomerChange = new EventEmitter<ProductModel>();

  entity!: PackageModel;
  isLocked = false;
  isGatewayUser = false;

  startDate = '';
  endDate = '';
  selectedCustomerCode = '';
  selectedCompanyId = 0;
  selectedCompanyName = '';

  pagination: PaginationModel = defaultPagination;

  companies: CompanyModel[] = [];

  constructor(
    private loadingService: LoadingService,
    private commonService: CommonService,
    private credentialsService: CredentialsService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private messageService: MessageService,

  ) { }

  ngOnInit(): void {
    this.initializeDates();
    this.loadCompanies();
    this.setDefaultCompany();
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


  private loadCompanies(): void {
    this.loadingService.show();
    this.commonService.getCompanies$()
      .pipe(
        filter(res => res?.length > 0),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          this.companies = res;
          this.setDefaultCompany(); // Move this here to ensure companies are available
        },
        error: (err) => {
          console.error(err);
        }
      });
  }


  private setDefaultCompany(): void {
    const currentUserCompanyId = this.credentialsService.credentials?.user.companyId;

    if (!this.credentialsService.isGatewayUser() || !currentUserCompanyId) {
      return;
    }

    this.isGatewayUser = true;

    const userCompany = this.companies.find(c => c.id === currentUserCompanyId);

    if (userCompany) {
      this.selectedCompanyId = userCompany.id;
      this.selectedCompanyName = userCompany.name;
    }

  }

  onCompanyChange(companyId: number): void {
    this.selectedCompanyId = companyId;
    console.log('Company changed to:', companyId);
  }

  generateReport(form: NgForm): void {
    console.log('Generate report with form data:', form.value);

    this.loadingService.show();
    this.reportService.GetExcel_SalesSummaryReport(new Date(this.startDate), new Date(this.endDate), this.selectedCustomerCode).subscribe(blob => {
      this.loadingService.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'sales_summary_report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'),"Report Generated Successfully", 'success');
    });
  }

  onSearchCustomer(action: GenericAction<CustomerModel>): void {
    switch (action.action) {
      case 'update':
      case 'click':
        this.selectedCustomerCode = action.data?.code || '';
        break;
      case 'clear':
        this.selectedCustomerCode = '';
        break;
    }
  }
}
