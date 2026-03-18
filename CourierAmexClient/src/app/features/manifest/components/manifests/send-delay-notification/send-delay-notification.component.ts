import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ManifestService } from '@app/features/manifest/services';
import { defaultPagination, PageOptionsDefault, PaginationModel } from '@app/models';
import { ManifestModel } from '@app/models/manifest.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { filter, finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'send-delay-notification',
  templateUrl: './send-delay-notification.component.html',
  inputs: ['entity']
})
export class SendDelayNotificationModalComponent implements OnInit {
  @ViewChild("filterTemplate") filterTemplate!: TemplateRef<any>;
  protected entity?: ManifestModel;
  pagination: PaginationModel = defaultPagination;
  packageList: any[] = [];
  packageListBackup: any[] = [];
  isAllSelected: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    number: '',
    customerCode: '',
    customerName: '',
    trackingNumber: '',
    courierName: '',
    origin: '',
    client:'',
    description: '',
    action: ''
  };


  constructor(
    private activeModal: NgbActiveModal,
    private loadingService: LoadingService,
    private manifestService: ManifestService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
  ) {

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['PackageDetails.TrackingNumber',
      'Packages.CustomerCode',
      'Packages.CustomerName',
      'RouteSheet.Client',
      'Packages.TrackingNumber',
      'Packages.CourierName',
      'Packages.Origin',
      'PackageDetails.Description',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.action = translations['Labels.Actions'];
          this.translations.trackingNumber = translations['PackageDetails.TrackingNumber'];
          this.translations.client = translations['RouteSheet.Client'];
          this.translations.customerName = translations['Packages.CustomerName'];
          this.translations.courierName = translations['Packages.CourierName'];
          this.translations.origin = translations['Packages.Origin'];
          this.translations.description = translations['PackageDetails.Description'];
        });
  }

  ngOnInit(): void {
    console.log(this.entity);
    this.getManifestPackage();
  }


  Load(): void {
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.filterTemplate });
    this.columns.push({ field: 'packageNumber', label: this.translations.trackingNumber, sortable: true });
    this.columns.push({ field: 'customerCode', label: this.translations.client, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'courierName', label: this.translations.courierName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.cd.detectChanges();
  }

  getManifestPackage() {
    this.loadingService.show();
    this.manifestService.getManifestPackage(this.entity?.manifestNumber).subscribe(res => {
      this.loadingService.hide();

      this.packageListBackup = res?.data ?? [];

      this.packageListBackup.forEach(item => {
        item.checked = false;
      });

      this.applyTableState();
      this.Load();
      this.SelectAll();
    });
  }


  applyTableState(): void {
    const { page, pageSize, searchTerm } = this.state;

    const filtered = this.packageListBackup.filter(pkg =>
      Object.values(pkg)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    this.packageList = filtered.slice(startIndex, endIndex)
    this.packageList.forEach((item: any) => {
      item.checked = true;
    });


    this.pagination = {
      ...this.pagination,
      c: searchTerm,
      pi: page,
      ps: pageSize,
      s: `${this.state.sortColumn} ${this.state.sortDirection}`
    };
  }


  SelectAll() {
    this.isAllSelected = !this.isAllSelected;
    this.packageList.forEach(item => {
      item.checked = this.isAllSelected;
    });
  }


  onCheckboxChange(param: any) {
    console.log(param);
    this.isAllSelected = this.packageList.every(a => a.checked == true);
  }

  close(): void {
    this.activeModal.close(false);
  }

  submit(form: NgForm): void {
    this.loadingService.show();
    var param = this.packageList.filter(a => a.checked);
    if (param.length == 0) {
      this.loadingService.hide();
      Swal.fire({
        title: this.translate.instant('Labels.Error'),
        text: this.translate.instant('Labels.SelectAtLeastOne'),
        icon: 'error',
        confirmButtonText: this.translate.instant('Labels.Confirm')
      })
      this.loadingService.hide();
      return;
    }

    var obj = this.packageList.filter(a => a.checked).map(a => {
      return {
        PackageNumber: a.packageNumber,
        DocType: 'DELAY',
        Status: 0
      }
    });

    this.manifestService.InsertNotification(obj).subscribe(res => {
      console.log(res);
      if (res?.success) {
        this.loadingService.hide();
        Swal.fire({
          title: this.translate.instant('Labels.Success'),
          text: this.translate.instant('Labels.SendSuccessfully'),
          icon: 'success',
          confirmButtonText: this.translate.instant('Labels.Confirm')
        })
      }
      else {
        this.loadingService.hide();
        Swal.fire({
          title: this.translate.instant('Labels.Error'),
          text: this.translate.instant('Labels.InternalError'),
          icon: 'error',
          confirmButtonText: this.translate.instant('Labels.Confirm')
        })
      }

    })
    this.loadingService.hide();
    this.activeModal.close(true);
  }

  protected onStateChange(state: TableState) {
    this.state = { ...state };
    this.applyTableState();
  }
}
