import { inject, ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel, LocationModel, CashierModel } from '@app/features/company/models';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { tr } from 'date-fns/locale';
import { DomSanitizer } from '@angular/platform-browser';
import { PackageInventoryService } from '../../services/package-inventory.service';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ClientCashierService } from '../../../company/services/client-cashier.service';

@Component({
  selector: 'app-package-inventory',
  templateUrl: './package-inventory.component.html',
  styleUrl: './package-inventory.component.scss'
})
export class PackageInventoryComponent {
  pdfSrc: any;
  isGatewayUser: boolean = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  selectedStore: number = 0
  loading: boolean = false;
  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  selectedManifestNumber: string = "";
  selectedPackage: number
  private readonly _entities = new BehaviorSubject<CashierModel[]>([]);
  entities$ = this._entities.asObservable();
  pagination: PaginationModel = defaultPagination;
  inventoryList: any[] = []
  selectedInventoryId: any;
  selectedRow: number = 0
  packageNumber: number;
  active = 0;

  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private loadingService: LoadingService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private router: Router,
    private clientCashierService: ClientCashierService,
    private packageInventoryService: PackageInventoryService
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
  }

  ngOnInit(): void {
    this.setDefaultCompany();
    this.loadAttributes();
    console.log(this.credentailsService.credentials)
  }

  setDefaultCompany() {
    if (this.credentailsService.isGatewayUser()) {
      const userCia = this.credentailsService.credentials?.user.companyId;
      console.log("userCia", userCia);
      if (userCia) {
        this.selectedCompany = userCia;
      }
    }
  }

  private loadAttributes(): void {
    this.loadingService.show();
    console.log("this.selectedCompany", this.selectedCompany)
    this.loadingService.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.pi = 1;
    this.pagination.ps = 5000;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;

    this.clientCashierService.getPaged$(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loadingService.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private updatePagination(): void {
    const entities = this._entities.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }

  public OnPackageNumberChange(): void {
    console.log(this.packageNumber, this.selectedStore);
    if (!this.selectedStore) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select the store first'
      });
      return;
    }
    if (!this.packageNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Package number is required field'
      });
      return;
    }
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    console.log(formatted);
    const userName = this.credentailsService.credentials?.user.username ? this.credentailsService.credentials?.user.username : '';
    const customerName = this.credentailsService.credentials?.user.name ? this.credentailsService.credentials?.user.name : '';
    const date = formatted;

    console.log("entity==", this.selectedStore, this.packageNumber, userName, customerName, date);

    this.packageInventoryService.addIventoryPackage(this.selectedStore, this.packageNumber, userName, customerName, date).subscribe({
      next: (res) => {
        if (res?.success) {
          this.loadingService.hide();
          this.inventoryList = res?.data;
          console.log("this.inventoryList", this.inventoryList);
          this.onChangeStore();
        } else {
          this.loadingService.hide();
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
        Swal.fire(this.messageService.getTranslate('Labels.Error'), "No inventory packages found.", 'error');
      }
    });
  }

  public onChangeStore(): void {
    console.log(this.selectedCompany, this.selectedStore);
    this.active = 0;
    this.packageInventoryService.storeInventory(this.selectedCompany, this.selectedStore)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadingService.hide();
            this.inventoryList = res?.data;
            console.log("this.inventoryList", this.inventoryList)
          } else {
            this.loadingService.hide();
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          this.loadingService.hide();
          Swal.fire(this.messageService.getTranslate('Labels.Error'), "No inventory packages found.", 'error');
        }
      });
  }

  onRowClick(packagelist: any, i: number) {
    console.log("onRowClick", packagelist, i);
    this.selectedRow = i;
    this.selectedPackage = packagelist.packageNumber;
  }

  resendPackageNotification() {
    console.log("resendPackageNotification");
    console.log(this.selectedPackage);
    if (!this.selectedPackage) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Package number is required field'
      });
      return;
    }
    const documentType = "RECEIVED OUR OFFICE"

    console.log("entity==", this.selectedPackage, documentType);

    this.packageInventoryService.resendPackageNotification(this.selectedPackage, documentType).subscribe({
      next: (res) => {
        if (res?.success) {
          this.loadingService.hide();
          console.log("resendPackageNotification res", res);
          Swal.fire(this.messageService.getTranslate('Labels.Success'), "Notification Resent", 'success');
        } else {
          this.loadingService.hide();
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
        Swal.fire(this.messageService.getTranslate('Labels.Error'), "No inventory packages found.", 'error');
      }
    });
  }

  deleteEntity(type: number) {
    console.log("deleteEntity", type);
    console.log(this.packageNumber, this.selectedStore);
    let confirmationMsg = this.messageService.getTranslate('ManifestDetails.DeleteAllPackages') + this.selectedStore;
    if (type == 1) {
      confirmationMsg = this.messageService.getTranslate('ManifestDetails.DeletePackage') + this.selectedPackage;
    }
    if (this.selectedPackage <= 0 && type == 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Kindly select a package before continuing'
      });
    } else if (type == 2 && this.selectedStore <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Store can't be empty"
      });
    } else {
      Swal.fire({
        title: this.messageService.getTranslate('Labels.DeleteTitle'),
        text: confirmationMsg,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.messageService.getTranslate('Labels.Confirm'),
        cancelButtonText: this.messageService.getTranslate('Labels.Cancel')
      })
        .then((response: SweetAlertResult) => {
          if (response.isConfirmed) {
            this.confimredDeleteEntity(this.selectedPackage, type);
          }
        });
    }
  }

  confimredDeleteEntity(selectedPackage: number, type: number) {
    console.log("confimredDeleteEntity", type, selectedPackage);
    console.log(this.packageNumber, this.selectedStore);
    if (!this.selectedStore) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select the store first'
      });
      return;
    }
    if (!selectedPackage) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Package number is required field'
      });
      return;
    }
    const deleteAll = type === 2 ? 1 : 0;

    console.log("deleteAll==", deleteAll);

    this.packageInventoryService.deleteInventoryPackage(this.selectedStore, selectedPackage, deleteAll).subscribe({
      next: (res) => {
        if (res?.success) {
          this.loadingService.hide();
          this.onChangeStore();
          Swal.fire(this.messageService.getTranslate('Labels.Success'), "Package deleted successfully ", 'success');
        } else {
          this.loadingService.hide();
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
        Swal.fire(this.messageService.getTranslate('Labels.Error'), "No inventory packages found.", 'error');
      }
    });
  }

  onTabChange(event: any) {
    const index = event.index;

    if (index === 1) {
      console.log('Report tab clicked');
      this.getReport();
    }
  }

  getReport() {
    console.log("getReport", this.selectedStore);
    console.log(this.packageNumber, this.selectedStore);
    if (!this.selectedStore) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select the store first'
      });
      return;
    }
    this.packageInventoryService.GetExcel_StoreInventoryReport(this.selectedCompany, this.selectedStore).subscribe(blob => {
      this.loadingService.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'store_Inventory_Report_' + this.selectedStore + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      Swal.fire(this.messageService.getTranslate('Labels.Success'), "Report generated successfully ", 'success');
    });
  }

  GetPDF_StoreInventoryReport() {
    console.log("getReport", this.selectedStore);
    console.log(this.packageNumber, this.selectedStore);
    if (!this.selectedStore) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select the store first'
      });
      return;
    }
    this.packageInventoryService.GetPDF_StoreInventoryReport(this.selectedCompany, this.selectedStore).subscribe(blob => {
      this.loadingService.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'store_Inventory_Report_' + this.selectedStore + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      if (objectUrl) {
        this.handlePdfResponse(objectUrl);
      } else {
        Swal.fire('Warning', 'No PDF data found!', 'warning');
      }
      Swal.fire(this.messageService.getTranslate('Labels.Success'), "Report generated successfully ", 'success');
    });
  }

  handlePdfResponse(pdfBase64: string): void {
    if (!pdfBase64?.trim()) {
      Swal.fire('Error', 'Invalid or empty PDF data.', 'error');
      return;
    }

    const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');
    const url = window.URL.createObjectURL(pdfBlob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = Array.from(slice, char => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}