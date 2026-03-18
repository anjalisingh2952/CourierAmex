import { ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ManifestService } from '@app/features/manifest';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-manifest-report-observations',
  templateUrl: './manifest-report-observations.component.html',
  styleUrl: './manifest-report-observations.component.scss'
})
export class ManifestReportObservationsComponent {

  object1 = { name: 'Manifest 1', date: new Date() };
  objectList = [{ id: 1, value: 'Item 1' }, { id: 2, value: 'Item 2' }];


  isGatewayUser: boolean = false;
  selectedCompany:any;
  selectedCompanyName = "";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  selectedManifestNumber: string = "";
  isEnter:boolean=false;
  constructor(
    private translate: TranslateService,
    private loading: LoadingService,
    private commonService: CommonService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private manifestService: ManifestService,
    private messageService: MessageService,

  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    this.companies$ = this.commonService.getCompanies$();
  }
  ngOnInit(): void {
    this.setDefaultCompany();
  }
  setDefaultCompany() {
    this.companies$.subscribe(companies => {
      if (this.credentailsService.isGatewayUser() && companies.length > 0) {
        const userCia = companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectedCompany = userCia.id;
          this.selectedCompanyName = userCia.name;
        }
      }
    });
  }
  public OnManifestNumberChange(): void {
    console.log(this.selectedManifestNumber, this.selectedCompany);
    
    // this.isEnter=true;
    this.exportToExcel();

  }

  exportToExcel() {
    console.log("exportToExcel=========<<<");
    this.manifestService.GetExcel_ManifestReportObservation(this.selectedManifestNumber, this.selectedCompany ?? -1).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `ManifestReport_obervation_${this.selectedManifestNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'),"Report Generated Successfully", 'success');
      
    })
  }
  
}