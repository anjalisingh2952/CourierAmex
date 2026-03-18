import { inject, ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel, CommodityModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { PriceImageMaintenanceService } from '../../services';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommodityService } from '../../../company/services/commodity.service';
import { CommodityPriceModel } from '../../models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PriceImageMaintenancModalComponent } from '../../components/price-image-maintenanc-modal/price-image-maintenanc-modal.component';
@Component({
  selector: 'app-price-image-maintenance',
  templateUrl: './price-image-maintenance.component.html',
  styleUrl: './price-image-maintenance.component.scss'
})
export class PriceImageMaintenanceComponent {
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  @ViewChild('dt') dt: Table;
  modalRef!: NgbModalRef;
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
  attachmentUrl: any;
  private readonly _entities = new BehaviorSubject<CommodityModel[]>([]);
  entities$ = this._entities.asObservable();
  commodityModelList: CommodityPriceModel[] = [];

  pagination: PaginationModel = defaultPagination;

  constructor(
    private translate: TranslateService,
    private loadingService: LoadingService,
    private commonService: CommonService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private messageService: MessageService,
    private priceImageMaintenanceService: PriceImageMaintenanceService,
    private commodityService: CommodityService,
    private modalService: NgbModal,


  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    console.log(this.credentailsService.credentials?.user);
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }

  }
  ngOnInit(): void {
    this.setDefaultCompany();
    this.performSearch();
    this.getAttachmentUrlByCompanyId();
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

  public getPackagesByInvoiceStatus() {
    this.loadingService.show();
    this.loading = true;
    this.priceImageMaintenanceService.GetPendingBillingPackages(this.selectedCompany)
      .pipe(
        filter((res) => res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.loading = false;
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

  UpdatePackageInvoiceStatus(packageNumber: number, commodity: number, rowPrice: number): void {
    this.loadingService.show(); // Ensure loading starts
    this.packageNumber = packageNumber;
    const { commodityId, price, modifiedBy } = {
      commodityId: commodity,
      price: rowPrice,
      modifiedBy: this.credentailsService.credentials?.user.id ?? ""

    };
    console.log("UpdatePackageInvoiceStatus=>", commodityId, price, modifiedBy, this.packageNumber)
    this.priceImageMaintenanceService
      .UpdatePackageCommodityAndPrice(commodityId, price, modifiedBy, this.packageNumber)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          // Handle success (optional toast/message)
          this.loadingService.hide();
          // this.getPackagesByInvoiceStatus();
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
   // console.log("onRowClick", packagelist, i);
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
       // this.fetchFilteredResultsFromAPI(value);
      }
    }, 0); // delay needed to allow table filtering to update filteredValue
  }
  fetchFilteredResultsFromAPI(searchTerm: string): void {
    this.loadingService.show();
    this.priceImageMaintenanceService.GetPendingBillingPackages(this.selectedCompany).subscribe({
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

  onEditComplete(event: any) {
    console.log("Edited event:", event, "selectedRow", this.selectedRow);
    //console.log("Edited articles:", this.packageList[this.selectedRow]);
    const { data, field } = event;
    //console.log("Edited Field:", field);
    //console.log("Row Data:", data);
    if (field == "price" && this.packageList[this.selectedRow]?.updatedprice > 0) {
      this.UpdatePackageInvoiceStatus(this.packageList[this.selectedRow].packageNumber, this.packageList[this.selectedRow].commodity, data);
    } else if (field == "commodity" && this.packageList[this.selectedRow]?.commodity > 0) {
      this.UpdatePackageInvoiceStatus(this.packageList[this.selectedRow].packageNumber, this.packageList[this.selectedRow].commodity, this.packageList[this.selectedRow].price);
    }

  }
  getDescriptionById(targetId: number, currentVal: number): string | undefined {
    if (currentVal != null && targetId == undefined)
      targetId = currentVal;
    return this.commodityModelList.find(item => item.id === targetId)?.description;
  }

  private performSearch(): void {
    const companyId = this.selectedCompany;
    this.priceImageMaintenanceService.GetActiveCommodities(companyId)
      .pipe(
        filter((res) => res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this.commodityModelList = res.data ?? [];
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  getAttachmentUrlByCompanyId() {
    this.priceImageMaintenanceService.GetAttachmentUrlByCompanyId(this.selectedCompany)
      .pipe(
        filter((res) => res?.success == true),
        finalize(() => {
        })
      )
      .subscribe({
        next: (res) => {
          this.attachmentUrl = res.data?.attachmentUrl;
          console.log(this.attachmentUrl, res.data?.attachmentUrl);
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  getResourceIcons(files: string[]): (string | null)[] {
    const maxIcons = 3;
    const result = [...files];
    while (result.length < maxIcons) {
      result.push("");
    }
    return result.slice(0, maxIcons);
  }
  fileModelView(file:string){
    const modalRef = this.modalService.open(PriceImageMaintenancModalComponent, {size: 'xl'});
        modalRef.componentInstance.file = file;
    
  }
  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
  isImageFile(filename: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename);
  }
}  
