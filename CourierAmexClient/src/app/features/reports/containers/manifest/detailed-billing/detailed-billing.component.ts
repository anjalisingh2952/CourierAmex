import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { BehaviorSubject, filter, finalize, forkJoin, Observable } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ReportsService } from '@app/features/reports/services';
import { CompanyModel } from '@app/features/company';
import { ManifestService } from '@app/features/manifest';
import { defaultPagination, PageOptionsDefault, PaginationModel, ManifestScanner, newCountManifestScanner } from '@app/models';
import { NgForm } from '@angular/forms';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { manifestsupplierComponent } from '@app/features/reports/components/manifest/manifest-supplier.component';
import { manifestdetailsComponent } from '@app/features/reports/components/manifest/manifest-details.component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AverageManifest, DetailedBilling, Manifestdetail, ManifestProvoider, newDetailedBilling } from '@app/features/reports/models/detailed-billing.model';

@Component({
  selector: 'app-detailed-billing',
  templateUrl: './detailed-billing.component.html',
  styleUrls: ['./detailed-billing.component.scss']
})
export class DetailedBillingComponent implements OnInit {
  @ViewChild('form', { read: NgForm }) form!: NgForm;
  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  readonly entity$: Observable<ManifestModel>;
  freightPrice = 0.00;
  categoryD = "";
  isGatewayUser: boolean = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  selectedManifest: string = "";
  reportType = "manifest";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  pagination: PaginationModel = defaultPagination;

  private readonly _closesManifest = new BehaviorSubject<ManifestScanner[]>([]);
  closesManifest$ = this._closesManifest.asObservable();


  manifestProductsDetail = [];
  manifestReportDetailbySupplier = [];
  manifestAveragePricebyKilogram = [];

  columnsManifestAverage: ColDef[] = [];
  columnsManifestDetail: ColDef[] = [];
  columnsManifestSupplier: ColDef[] = [];

  isDownload: boolean = false;
  manifestsList: ManifestModel[] = []
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };
  manifestAverage: AverageManifest[] = [];
  manifestDetail: Manifestdetail[] = [];
  manifestSupplier: ManifestProvoider[] = [];
  detailedBilling: DetailedBilling = newDetailedBilling;
  constructor(
    private loading: LoadingService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private reportService: ReportsService,
    private manifestService: ManifestService
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();

  }

  ngOnInit(): void {
    this.setDefaultCompany();
    this.loadAttributes();
  }
  protected onStateChange(state: TableState) {
    this.state = { ...state };
    this.pagination = {
      ...this.pagination,
      c: state.searchTerm,
      pi: state.page,
      ps: state.pageSize,
      s: `${state.sortColumn} ${state.sortDirection}`
    };
  }
  private getManifestDetailedBilingData(): void {
    this.loading.show();
    //this._closesManifest.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;
    this.reportService.getManifestDetailedBilingData(this.selectedCompany, this.selectedManifest).subscribe(response => {
      if (response.success) {
        console.log("getManifestDetailedBilingData", response.data);
        this.detailedBilling = response.data ?? newDetailedBilling;

        this.manifestAverage = this.detailedBilling.manifestAverage ?? [];
        this.manifestDetail = this.detailedBilling.manifestdetails ?? [];
        this.manifestSupplier = this.detailedBilling.manifestSupplier ?? [];

        this.loading.hide();
      }
      else{
        console.log("Error Occured in getManifestDetailedBilingData")
        this.loading.hide();
      }
    });
    

  }
  generateReport(form?: NgForm) {

    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    console.log("selectedCompany", this.selectedCompany, "Manifest", this.selectedManifest);

    //GetExcel_ManifestDetailedBilingInvoices
    //GetExcel_ManifestDetailedBilingData
    this.loading.show();
    //debugger;
    this.reportService.GetExcel_ManifestDetailedBilingInvoices(this.selectedCompany, this.selectedManifest).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'ManifestDetailedBiling.xlsx';
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
          this.performSearch();
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

  manifestChange(event: any) {

    console.log(`manifest number:${event}`);

    this.getManifestDetailedBilingData();
  }

  protected selectCompany(id: number): void {
    this.selectedCompany = id;
    this.performSearch();
  }
  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.ps = 1000;
    this._closesManifest.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;

    this.manifestService.GetManifestScanner(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this.selectedManifest = "";
          this._closesManifest.next(res.data);

        },
        error: (err: any) => {
          console.error(err);
        }
      });

  }
}