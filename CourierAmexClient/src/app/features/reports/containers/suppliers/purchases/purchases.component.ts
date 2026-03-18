
import { inject, Component, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PaginationModel, GenericAction, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel, ProductModel } from '@app/features/company';
import { PackageModel } from '@app/features/package/models';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Router } from '@angular/router';
import { ReportsService } from '@app/features/reports/services';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss'
})
export class PurchasesComponent implements OnInit {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  @ViewChild('form', { read: NgForm }) form!: NgForm;

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
    private messageService: MessageService,
    private reportsService: ReportsService

  ) {
    this.isGatewayUser = this.credentialsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.isGatewayUser) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true });
    }
  }

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

  const companyId = this.selectedCompanyId;
  const startDate = this.startDate;
  const endDate = this.endDate;

  this.reportsService.getPurchasesReportExcel(companyId, startDate, endDate).subscribe({
    next: (blob) => {
      this.loadingService.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Purchases_Report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      Swal.fire(this.messageService.getTranslate('Labels.Success'), "Report Generated Successfully", 'success');
    },
    error: (err) => {
      this.loadingService.hide();
      Swal.fire(this.messageService.getTranslate('Labels.Error'), "An error occurred while generating the report.", 'error');
      console.error('Report generation error:', err);
    }
  });
}

}