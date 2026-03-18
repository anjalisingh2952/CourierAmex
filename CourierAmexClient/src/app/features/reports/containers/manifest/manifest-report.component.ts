import { ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ReportsService } from '../../services';
import { tr } from 'date-fns/locale';
import { ReportViewerComponent } from './manifest-report/report-viewer/report-viewer.component'
import { newManifestBillingInfo, newManifestGeneralInfo } from '../../models';



@Component({
  selector: 'app-manifest-report',
  templateUrl: './manifest-report.component.html',
})
export class ManifestReportComponent {


  @ViewChild('reportContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  object1 = { name: 'Manifest 1', date: new Date() };
  objectList = [{ id: 1, value: 'Item 1' }, { id: 2, value: 'Item 2' }];

  componentRef!: ComponentRef<ReportViewerComponent>;


  isGatewayUser: boolean = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  selectedManifestNumber: string = "";


  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private reportService: ReportsService,

  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();


  }
  ngOnInit(): void {
    this.setDefaultCompany();
    this.loadAttributes();
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

  private loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);
    companies: this.commonService.getCompanies$(),
      forkJoin({
        companies: this.commonService.getCompanies$(),

      }).pipe(
        finalize(() => {
          this.loading.hide();
        })
      )
        .subscribe({
          next: (res) => {
            if (res.companies && res.companies.length > 0) {
              this._companies.next(res.companies ?? []);
              this.container.clear(); // Remove any existing report
              const componentRef = this.container.createComponent(ReportViewerComponent);
              componentRef.instance.entity = newManifestGeneralInfo;
              componentRef.instance.entityList = [];
              componentRef.instance.companyName = this.selectedCompanyName;
              componentRef.instance.reportName = "Billing Manifest";
              this.componentRef = componentRef;
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        });
  }

  public OnManifestNumberChange(): void {

    this.reportService.getManifestGeneralInfo(this.selectedCompany, this.selectedManifestNumber).subscribe(res => {

      if (res.success) {

        this.reportService.getManifestBillingInfo(this.selectedCompany, this.selectedManifestNumber).subscribe(res2 => {

          if (res2.success) {


            this.container.clear(); // Remove any existing report
            const componentRef = this.container.createComponent(ReportViewerComponent);
            componentRef.instance.entity = res.data ?? newManifestGeneralInfo;
            componentRef.instance.entityList = Array.isArray(res2.data) ? res2.data : [newManifestBillingInfo];
            componentRef.instance.companyName = this.selectedCompanyName;
            componentRef.instance.companyId = this.selectedCompany;
            componentRef.instance.manifestNumber = this.selectedManifestNumber;
            componentRef.instance.reportName = "Billing Manifest";
            this.componentRef = componentRef;

          }
          else{

          }
        });

        

      }
      else {

      }

    });

  }

}