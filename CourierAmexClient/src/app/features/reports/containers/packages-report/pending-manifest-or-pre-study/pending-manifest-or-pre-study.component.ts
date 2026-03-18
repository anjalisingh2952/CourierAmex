import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { BehaviorSubject, filter, finalize, forkJoin } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ReportsService } from '@app/features/reports/services';
import { CompanyModel } from '@app/features/company';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-pending-manifest-or-pre-study',
  templateUrl: './pending-manifest-or-pre-study.component.html',
  styleUrls: ['./pending-manifest-or-pre-study.component.scss']
})
export class PendingManifestOrPreStudyComponent implements OnInit {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  @ViewChild('form', { read: NgForm }) form!: NgForm;

  openDatePickerFrom(): void {
    this.dateInputFrom.nativeElement.showPicker(); // Works in modern browsers
  }
  openDatePickerTo(): void {
    this.dateInputTo.nativeElement.showPicker(); // Works in modern browsers
  }

  startDate: string = '';
  endDate: string = "";
  isGatewayUser: boolean = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  reportType = "manifest";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  constructor(
    private loading: LoadingService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private reportService: ReportsService,
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
  }
  ngOnInit(): void {
    this.setDefaultStartDate();
    this.setDefaultCompany();
    this.loadAttributes();
  }


  setDefaultStartDate(): void {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7); // Subtract 7 days
    this.startDate = currentDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    const currentDateto = new Date();
    currentDateto.setDate(currentDateto.getDate() - 0);
    this.endDate = currentDateto.toISOString().split('T')[0];
  }
  generateReport(form?: NgForm) {
    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    console.log("selectedCompany", this.selectedCompany, "REPORT tYPE", this.reportType, "StateDate", this.startDate, "enddate", this.endDate);
    //PendingManifestOrPreStudy
    this.loading.show();
    this.reportService.PendingManifestOrPreStudy(this.selectedCompany, new Date(this.startDate), new Date(this.endDate), this.reportType).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.reportType.toLowerCase() == 'prestudy' ? 'PreStudyReport.xlsx' : 'PendingManifestReport.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    });
  }
  setDefaultCompany() {
    console.log("setDefaultCompany==>1");

    this.companies$.subscribe(companies => {
      console.log("setDefaultCompany==>2", companies);

      if (this.credentailsService.isGatewayUser() && companies.length > 0) {
        console.log("setDefaultCompany==>3");

        const userCia = companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);

        if (userCia) {
          this.selectedCompany = userCia.id;
          this.selectedCompanyName = userCia.name;
        }
      }
    });
  }
  private loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);
    this.commonService.getCompanies$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res);
        },
        error: (err: any) => {
          console.error(err);
        }
      });

  }
}