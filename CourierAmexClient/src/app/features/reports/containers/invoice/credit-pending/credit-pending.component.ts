import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CountryModel, StateModel, ZoneModel } from '@app/features/general/models';
import { ZoneService } from '@app/features/general/services';
import { ReportsService } from '@app/features/reports/services';
import { sortType } from '@app/@shared';
import { blob } from 'stream/consumers';
import { CompanyModel } from '@app/features/company';
import { NgForm, AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';

interface Zone {
  countryId: number;
  stateId: number;
  code: string;
  name: string;
  notes: string | null;
  route: number;
  countryName: string;
  stateName: string;
  id: number;
  status: number;
}
@Component({
  selector: 'app-credit-pending',
  templateUrl: './credit-pending.component.html',
  styleUrls: ['./credit-pending.component.scss']
})
export class CreditPendingComponent implements OnInit {
  @ViewChild('dateInputFrom') dateInputFrom!: ElementRef;
  @ViewChild('dateInputTo') dateInputTo!: ElementRef;
  @ViewChild('form', { read: NgForm }) form!: NgForm;

  openDatePickerFrom(): void {
    this.dateInputFrom.nativeElement.showPicker(); // Works in modern browsers
    // Alternative: this.dateInput.nativeElement.focus();
  }
  openDatePickerTo(): void {
    this.dateInputTo.nativeElement.showPicker(); // Works in modern browsers
    // Alternative: this.dateInput.nativeElement.focus();
  }
  searchValue: string = ""
  startDate: string = '';
  endDate: string = "";
  pagination: PaginationModel = defaultPagination;
  selectedCountry: CountryModel | undefined = undefined;
  selectedState: StateModel | undefined = undefined;
  hasAdd: boolean = false;
  //selectedZoneId:number
  private readonly _entities = new BehaviorSubject<ZoneModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  private readonly _states = new BehaviorSubject<StateModel[]>([]);
  states$ = this._states.asObservable();
  zonelist: any;
  // statesList = [
  //   { countryId: 0, stateId: 2, code: '2', name: 'ALAJUELA', stateName: 'AJALUELA' },
  //   { countryId: 0, stateId: 6, code: '3', name: 'PUNTARENAS', stateName: 'PUNTARENAS' },
  //   { countryId: 0, stateId: 1, code: '4', name: 'SAN JOSE', stateName: 'SAN JOSE' }
  // ];
  selectedZone: string = '';
  selectedZoneId: any; // Multiple selections
  allSelected = false;
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  selectedCompany = 0;
  selectedCompanyName = "";
  isGatewayUser: boolean = false;

  constructor(
    private router: Router,
    private loading: LoadingService,
    private zoneService: ZoneService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private reportService: ReportsService,
    private toastr: ToastrService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Delete);
    this.isGatewayUser = this.credentailsService.isGatewayUser();

  }
  ngOnInit(): void {
    this.setDefaultStartDate();
    this.loadAttributes();
    //this.performSearch();
    this.setDefaultCompany();
    this.loadCompany();
  }
  setDefaultStartDate(): void {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7); // Subtract 7 days
    this.startDate = currentDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    //endDate
    const currentDateto = new Date();
    currentDateto.setDate(currentDateto.getDate() - 0);
    this.endDate = currentDateto.toISOString().split('T')[0];
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
  onCompanyChange(companyId: number): void {
    console.log('Selected Company ID:', event);
    this.selectedCompany = companyId;
    this.performSearch();
  }
  private loadCompany(): void {
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
  generateReport(form?: NgForm) {

    if (form && !form.valid) {
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return; // Stop execution if validation fails
    }
    console.log("selectedZoneId=34=>", this.selectedZoneId);

    if (this.selectedZoneId && this.selectedZoneId.length > 0) {
      console.log("selectedZoneId==>", this.selectedZoneId);

      this.selectedZoneId = this.selectedZoneId.map((z: Zone) => z.id)
      // this.selectedZoneId = this.zonelist.map((z: Zone) => z.id).join(',');
      console.log("selectedZoneId", this.selectedZoneId);

    } else {
      Swal.fire("Error",this.messageService.getTranslate('CreditPending.Zonevalidation'),'error')

      // Swal.fire(this.messageService.getTranslate('CreditPending.Zonevalidation'), this.messageService.getTranslate('Labels.InternalError'), 'error');
      return;
    }
    console.log("selectedCompany", this.selectedCompany, this.selectedZoneId, "StateDate", this.startDate, "enddate", this.endDate);
    this.loading.show();
    this.reportService.GetExcel_OutstandingCreditCustomerInvoices(this.selectedCompany, new Date(this.startDate), new Date(this.endDate), this.selectedZoneId).subscribe(blob => {
      this.loading.hide();
      this.selectedZoneId = [];
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Invoice_CreditPending.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    });
  }
  zoneChange(selectedZone: number) {
    //console.log("zoneChange", selectedZone);
    this.allSelected = false;
    // this.selectedZoneId = this.zonelist.map((z: Zone) => z.id)
    // this.selectedZoneId = this.zonelist.map((z: Zone) => z.id).join(',');
    // console.log("selectedZoneId",this.selectedZoneId);


  }
  toggleSelectAll(event: any) {
    /* if (event.target.checked) {
       this.selectedZoneId = this.zonelist.map((z: Zone) => z.id)
      // this.selectedZoneId = this.zonelist.map((z: Zone) => z.id).join(',');
       console.log("selectedZoneId",this.selectedZoneId);
   
     } else {
       this.selectedZoneId = ""; // Clear selection
     }*/
  }
  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.ps = 1000;
    this._entities.next([]);
    const countryId = this.selectedCountry?.id ?? 0;
    const stateId = this.selectedState?.id ?? 0;
    //console.log(this.pagination, countryId, stateId)
    this.zoneService.getPaged$(this.pagination, this.selectedCompany, stateId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          //this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
          this.zonelist = res.data;
          //console.log("Zone",res.data)
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private loadAttributes(): void {
    this.loading.show();
    this._countries.next([]);

    this.commonService.getCountries$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._countries.next(res);
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }
  clear(dt: any) {
    this.selectedZoneId = []
  }
}
