import { inject, ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HasInvoiceMaintenanceService } from '../../services';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-has-invoice-maintenance',
  templateUrl: './has-invoice-maintenance.component.html',
  styleUrl: './has-invoice-maintenance.component.scss'
})
export class HasInvoiceMaintenanceComponent {
  @ViewChild('dt') dt: Table;
  isGatewayUser: boolean = false;
  selectedCompany: any = 0;
  selectedCompanyName = "";
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  packageNumber: number = 0
  packageList: any[] = [];
  selectedPackageId: number
  loading: boolean = true;
  selectedRow: number = 0
  hasInvoice: number = 2;
  customerAccount: string = ""
  searchValue: string = ''
  filterBy: string = ''
  constructor(
    private translate: TranslateService,
    private loadingService: LoadingService,
    private commonService: CommonService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private messageService: MessageService,
    private hasInvoiceMaintenanceService: HasInvoiceMaintenanceService

  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }

  }
  ngOnInit(): void {
    this.setDefaultCompany();
    this.getPackagesByInvoiceStatus();
  }
  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      const userCia = this.credentailsService.credentials?.user.companyId;
      console.log("userCia", userCia);
      if (userCia) {
        this.selectedCompany = userCia;
      }
    }
  }

  //hasInvoiceMaintenanceService
  public getPackagesByInvoiceStatus() {
    this.loadingService.show();

    this.hasInvoiceMaintenanceService.getPackagesByInvoiceStatus(this.selectedCompany, this.searchValue)
      .pipe(
        filter((res) => res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.loading = false
          // this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this.packageList = res.data;

        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  UpdatePackageInvoiceStatus(packageNumber: number, hasInvoice: number): void {
    this.loadingService.show(); // Ensure loading starts
    this.packageNumber = packageNumber;
    this.hasInvoiceMaintenanceService
      .UpdatePackageInvoiceStatus(this.selectedCompany, hasInvoice, this.packageNumber)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          // Handle success (optional toast/message)
          this.getPackagesByInvoiceStatus();
          Swal.fire(
            this.messageService.getTranslate('Labels.Success'),
            'Invoice status updated successfully.',
            'success'
          );
        },
        error: (error) => {
          console.error('Update failed:', error);
          Swal.fire(
            this.messageService.getTranslate('Labels.Error'),
            'Failed to update invoice status.',
            'error'
          );
        }
      });
  }

  onRowClick(packagelist: any, i: number) {
    console.log("onRowClick", packagelist, i);
    this.selectedRow = i;
    this.packageNumber = packagelist.packageNumber;
  }
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Apply local filter
    this.dt.filterGlobal(value, 'contains');

    // If no local matches, call API
    setTimeout(() => {
      if (!this.dt.filteredValue || this.dt.filteredValue.length === 0) {
        this.fetchFilteredResultsFromAPI(value);
      }
    }, 0); // delay needed to allow table filtering to update filteredValue
  }
  fetchFilteredResultsFromAPI(searchTerm: string): void {
    this.loadingService.show();
    this.hasInvoiceMaintenanceService.getPackagesByInvoiceStatus(this.selectedCompany, searchTerm).subscribe({
      next: (response) => {
        this.dt.value = response?.data; // replace table data with API response
        this.dt.filteredValue = response?.data;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Search API failed:', err);
        this.loadingService.hide();
      }
    });
  }
}  