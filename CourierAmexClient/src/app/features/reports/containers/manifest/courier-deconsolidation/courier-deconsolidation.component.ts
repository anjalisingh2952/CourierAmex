import { Component, ViewChild, ElementRef ,OnInit} from '@angular/core';
import { BehaviorSubject, filter, finalize,forkJoin } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ReportsService } from '@app/features/reports/services';
import { CompanyModel } from '@app/features/company';
import { ManifestService } from '@app/features/manifest';
import { defaultPagination ,PaginationModel,ManifestScanner,newCountManifestScanner } from '@app/models';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-courier-deconsolidation',
  templateUrl: './courier-deconsolidation.component.html',
  styleUrls: ['./courier-deconsolidation.component.scss']
})
export class CourierDeconsolidationComponent implements OnInit {
  @ViewChild('form', { read: NgForm }) form!: NgForm;

  freightPrice=0.00;
  categoryD:boolean=false;
  isGatewayUser: boolean = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  selectedManifest:number=0;
  reportType="manifest";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  pagination: PaginationModel = defaultPagination;
  
  private readonly _closesManifest = new BehaviorSubject<ManifestScanner[]>([]);
  closesManifest$ = this._closesManifest.asObservable();
  constructor(
      private loading: LoadingService,
      private commonService: CommonService,
      private messageService: MessageService,
      private credentailsService: CredentialsService,
      private reportService: ReportsService,
      private manifestService:ManifestService,
      private toastr:ToastrService
  ){
    this.isGatewayUser = this.credentailsService.isGatewayUser();
  }
  ngOnInit(): void {
    this.setDefaultCompany();
    this.loadAttributes();
    
  }

  generateReport(form?: NgForm){

    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    this.loading.show();
   // decimal freightValue, string category)
   this.reportService.generateCourierDeconsolidationReportExcel(this.selectedCompany, this.selectedManifest,this.freightPrice,this.categoryD).subscribe(blob => {
     this.loading.hide();
     const a = document.createElement('a');
     const objectUrl = URL.createObjectURL(blob);
     a.href = objectUrl;
     a.download = 'CourierDeconsolidationReport.xlsx';
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'),"Report Generated Successfully", 'success');
     

   });
  }
  setDefaultCompany() {

    this.companies$.subscribe(companies => {
      //this.selectedCompany = this.credentailsService.credentials?.user.companyId

      if (this.credentailsService.credentials?.user.companyId ) {
       
          this.selectedCompany = this.credentailsService.credentials?.user.companyId;
         // this.selectedCompanyName = userCia.name;
          this.performSearch();
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
    protected selectCompany(id: number): void {
      this.selectedCompany = id;
      this.performSearch();
    }
    private performSearch(): void {
        this.loading.show();
        this.pagination.tr = 0;
        this.pagination.ti = 0;
        this.pagination.ps=1000;
        this._closesManifest.next([]);
        const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;
    
        this.manifestService.GetManifestScanner(this.pagination, companyId)
        .pipe(
          filter((res) => res?.success && res?.data?.length > 0),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            this._closesManifest.next(res.data);

          },
          error: (err: any) => {
            console.error(err);
          }
        });
       
      }
}