import { ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ReportsService } from '@app/features/reports/services';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-manifest-report-by-bag',
  templateUrl: './manifest-report-by-bag.component.html',
  styleUrl: './manifest-report-by-bag.component.scss'
})
export class ManifestReportByBagComponent {

  object1 = { name: 'Manifest 1', date: new Date() };
  objectList = [{ id: 1, value: 'Item 1' }, { id: 2, value: 'Item 2' }];


  isGatewayUser: boolean = false;
  selectedCompany: any=0;
  selectedCompanyName = "";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  selectedManifestNumber: string = "";
  isEnter: boolean = false;
  constructor(
    private translate: TranslateService,
    private loading: LoadingService,
    private commonService: CommonService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private messageService: MessageService,
    private reportsService: ReportsService

  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    this.companies$ = this.commonService.getCompanies$();
  }
  ngOnInit(): void {
    this.setDefaultCompany();
  }
  setDefaultCompany() {
    this.companies$.subscribe(companies => {
      console.log("companies", companies);
      if (this.credentailsService.isGatewayUser() && companies.length > 0) {
        const userCia = companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectedCompany = userCia.id;
          this.selectedCompanyName = userCia.name;
        }
      }
    });
  }


  exportToExcel(form?: NgForm) {
    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    if (this.selectedManifestNumber == '') {
      Swal.fire("Error","Please Enter Valid Manifest Number.","error")
      return;
    }

    this.reportsService.exportReportBag(this.selectedCompany ?? -1, this.selectedManifestNumber).subscribe(blob => {
      this.loading.hide();
      this.selectedManifestNumber = '';
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `ManifestReport_by_bag_${this.selectedManifestNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'), "Report Generated Successfully", 'success');

    })
  }

}