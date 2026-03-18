import { inject, Component, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PaginationModel, GenericAction, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel, ProductModel, CustomerPayTypeModel } from '@app/features/company';
import { PackageModel } from '@app/features/package/models';
import { CustomerPayTypeService } from '../../../../company/services/customer-pay-type.service';
import { ReportsService } from '@app/features/reports/services';
import { Router } from '@angular/router';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ZoneService } from '@app/features/general/services';
import { CountryModel, StateModel, ZoneModel } from '@app/features/general/models';

@Component({
  selector: 'app-pending-invoices',
  templateUrl: './pending-invoices.component.html',
  styleUrl: './pending-invoices.component.scss'
})
export class PendingInvoicesComponent {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  customerPayType: any[];
  isLocked = false;
  isGatewayUser = false;
  selectedPaytype: number;
  startDate = '';
  endDate = '';
  selectedCompanyId = 0;
  selectedCompanyName = '';
  pagination: PaginationModel = defaultPagination;

  companies: CompanyModel[] = [];
  zonelist: any;
  selectedZone: number;
  selectedZoneId: any; // Multiple selections 

  selectedCountry: CountryModel | undefined = undefined;
  selectedState: StateModel | undefined = undefined;
  AllPayType: boolean = false;
  AllZone: boolean = false;
  constructor(
    private loadingService: LoadingService,
    private customerPayTypeService: CustomerPayTypeService,
    private credentialsService: CredentialsService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private router: Router,
    private messageService: MessageService,
    private zoneService: ZoneService

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
    this.getZones();
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
        this.performSearch();
      }
    }
  }
  private performSearch(): void {
    this.loadingService.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.pi = 1;
    this.pagination.ps = 100;
    const companyId = this.selectedCompanyId

    this.customerPayTypeService.getPaged$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          // this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          const resPayType = res.data;
          if (resPayType.length > 0)
            this.customerPayType = resPayType.filter(c => c.status === 2);

        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private getZones(): void {
    this.loadingService.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.ps = 2000;
    const countryId = this.selectedCountry?.id ?? 0;
    const stateId = this.selectedState?.id ?? 0;
    //console.log(this.pagination, countryId, stateId)
    this.zoneService.getPaged$(this.pagination, this.selectedCompanyId, stateId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          //this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this.zonelist = res.data;
          //console.log("Zone",res.data)
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }
  onChangePaytype() {

  }
  onChangeZone() {

  }
  public getExcel_PendingInvoicesReport(form?: NgForm){

    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    this.selectedPaytype= this.AllPayType ? 0 :  this.selectedPaytype;
    this.selectedZone= this.AllZone ? 0: this.selectedZone;
    this.loadingService.show();
    console.log(new Date(this.startDate), new Date(this.endDate), this.selectedCompanyId, this.selectedPaytype, this.selectedZone,this,this.AllPayType,this.AllZone)
    this.reportService.GetExcel_PendingInvoicesReport(new Date(this.startDate), new Date(this.endDate), this.selectedCompanyId, this.selectedPaytype, this.selectedZone).subscribe(blob => {
      this.loadingService.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'sales_PendingInvoicesReport_' + this.startDate + '_to_' + this.endDate + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'),"Report Generated Successfully", 'success');
      
    });
  }
  toggleAllPayType() {
    if (this.AllPayType) {
      this.selectedPaytype = 0; // or null if 0 still considered invalid
    }
  }
  toggleAllZone() {
    if (this.AllZone) {
      this.selectedZone = 0; // or null if 0 still considered invalid
    }
  }
}
