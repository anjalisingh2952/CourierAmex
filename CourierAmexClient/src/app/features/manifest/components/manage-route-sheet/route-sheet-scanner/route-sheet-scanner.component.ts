import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateRouteSheetComponent } from '../create-route-sheet/create-route-sheet.component';
import { ManifestService } from '@app/features/manifest/services';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { defaultPagination, PaginationModel, RouteInsertModel } from '@app/models';
import { CredentialsService, LoadingService } from '@app/@core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-route-sheet-scanner',
  templateUrl: './route-sheet-scanner.component.html',
  styleUrls: ['./route-sheet-scanner.component.scss']
})
export class RouteSheetScannerComponent {
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("actionWithCheckTemplate") actionWithCheckTemplate!: TemplateRef<any>;
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  pagination: PaginationModel = defaultPagination;

  rows: any[] = [];
  columns: ColDef[] = [];
  packageColumns: ColDef[] = [];
  routeSheetDetails: any[] = [];
  PackageByRouteReport: any[] = [];
  selectedPackageIds: number[] = [];

  selectedDescription: string = '';
  selectedRouteSheetId: number;
  totalPackages: number;
  modalRef!: NgbModalRef;
  enteredPackageNumber: number;
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    routeSheetID: '',
    description: '',
    zone: '',
    areas: '',
    creationDate: '',
    status: '',
    action: ''
  };

  packageTranslations = {
    select: '',
    zone: '',
    client: '',
    tracking: '',
    description: ''
  };

  constructor(private modalService: NgbModal,
    private translate: TranslateService,
    private manifestService: ManifestService,
    private changeDetectorRef: ChangeDetectorRef,
    private loading: LoadingService,
    private zoneService: ManifestService,
    private credentailsService: CredentialsService) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'Labels.Actions',
      'RouteSheet.ID',
      'RouteSheet.Description',
      'RouteSheet.Zone',
      'RouteSheet.Areas',
      'RouteSheet.CreationDate',
      'RouteSheet.Status'])
      .subscribe(
        translations => {
          this.translations.action = translations['Labels.Actions'];
          this.translations.routeSheetID = translations['RouteSheet.ID'];
          this.translations.description = translations['RouteSheet.Description'];
          this.translations.zone = translations['RouteSheet.Zone'];
          this.translations.areas = translations['RouteSheet.Areas'];
          this.translations.creationDate = translations['RouteSheet.CreationDate'];
          this.translations.status = translations['RouteSheet.Status'];
        });

    this.translate.get([
      'Labels.Actions',
      'RouteSheet.Zone',
      'RouteSheet.Client',
      'RouteSheet.Tracking',
      'RouteSheet.Description'
    ])
      .subscribe(
        translations => {
          this.packageTranslations.select = translations['Labels.Actions'];
          this.packageTranslations.zone = translations['RouteSheet.Zone'];
          this.packageTranslations.client = translations['RouteSheet.Client'];
          this.packageTranslations.tracking = translations['RouteSheet.Tracking'];
          this.packageTranslations.description = translations['RouteSheet.Description'];
        });
  }

  ngAfterViewInit(): void {
    this.loading.show();
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.columns.push({ field: 'routeSheetID', label: this.translations.routeSheetID, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.columns.push({ field: 'zone', label: this.translations.zone, sortable: true });
    this.columns.push({ field: 'areas', label: this.translations.areas, sortable: true });
    this.columns.push({ field: 'creationDate', label: this.translations.creationDate, type: "date", sortable: true });
    this.columns.push({ field: 'status', label: this.translations.status, sortable: true });
    this.loading.hide();
    this.changeDetectorRef.detectChanges();

    this.packageColumns.push({ field: 'action', label: this.packageTranslations.select, sortable: false, cssClass: 'text-end', contentTemplate: this.actionWithCheckTemplate });
    this.packageColumns.push({ field: 'zone', label: this.packageTranslations.zone, sortable: true });
    this.packageColumns.push({ field: 'clientCode', label: this.packageTranslations.client, sortable: true });
    this.packageColumns.push({ field: '', label: this.packageTranslations.tracking, sortable: true });
    this.packageColumns.push({ field: 'description', label: this.packageTranslations.description, sortable: true });
    this.loading.hide();
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.getRouteSheetDetail();
  }

  getRouteSheetDetail() {
    this.loading.show();
    this.manifestService.GetRouteSheetDetail(0, 0, this.credentailsService.credentials?.user.companyId?.toString(),100000,1,'').subscribe((res: any) => {
      this.routeSheetDetails = res.list;
      this.loading.hide();
    });
  }

  viewDetail(param: any) {
    this.loading.show();
    this.selectedDescription = param.description;
    this.selectedRouteSheetId = param.routeSheetID;
    this.manifestService.GetPackageByRouteReport(param.routeSheetID).subscribe((res: any) => {
      this.PackageByRouteReport = res;
      this.selectedPackageIds = [];
      this.totalPackages = res.length;
      this.loading.hide();
    })
  }

  onScannerEvent(event: any): void {
  }

  onListRefresh(event: any): void {
    if (event) {
      this.getRouteSheetDetail()
    }
  }

  createRouteSheet(): void {
    const modalRef = this.modalService.open(CreateRouteSheetComponent, {
      size: 'lg', backdrop: 'static', keyboard: false, centered: true
    });
    modalRef.result.then(
      (result: boolean) => {
        this.onListRefresh(result);
      },
      () => {
      }
    );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  onCheckboxChange(params: any) {
    const packageId = params.packageId;
    const isSelected = params.selected;

    if (isSelected) {
      if (!this.selectedPackageIds.includes(packageId)) {
        this.selectedPackageIds.push(packageId);
      }
    } else {
      const index = this.selectedPackageIds.indexOf(packageId);
      if (index > -1) {
        this.selectedPackageIds.splice(index, 1);
      }
    }
  }

  deletePackageFromRoute() {
    if (this.selectedPackageIds.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Packages Selected',
        text: 'Please select at least one package to delete.',
        confirmButtonText: 'OK'
      });
      this.loading.hide();
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the selected packages (${this.selectedPackageIds.length}) from the route?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.show();
        this.manifestService.DeletePackageFromRouteMap(this.selectedPackageIds, this.selectedRouteSheetId).subscribe((res: any) => {
          if (res) {
            Swal.fire({
              icon: 'success',
              title: 'Package removed!',
              text: 'Package removed from route successfully.',
              confirmButtonText: 'OK'
            });
          }

          this.PackageByRouteReport = this.PackageByRouteReport.filter((item: any) => !this.selectedPackageIds.includes(item.packageId));
          this.totalPackages = this.PackageByRouteReport.length;
          this.selectedPackageIds = [];
          this.loading.hide();
        });
        if (!result.isConfirmed){
          //this.loading.show();
        }
      }
    });
  }

  executeMethod() {

    if (!this.enteredPackageNumber) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Package Number',
        text: 'Please enter a valid package number.',
        confirmButtonText: 'OK'
      });
      return;
    }
    if (!this.selectedRouteSheetId) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Route Sheet',
        text: 'Please select a road map.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.manifestService.GetValidatePackageRoute(this.enteredPackageNumber, this.selectedRouteSheetId).subscribe((res: any) => {
      var status = Number(res.data.result);
      if (status == 0) {
        Swal.fire({
          icon: 'success',
          title: 'Package Added!',
          text: 'Package added to route successfully.',
          confirmButtonText: 'OK'
        });

        var obj: RouteInsertModel = {
          description: this.selectedDescription,
          userId: this.credentailsService.credentials?.user.id ?? "",
          status: 0,
          zoneId: 0,
          deliveryTypeId: 1,
          PointOfSaleId: 1,
          companyId: this.credentailsService.credentials?.user.companyId?.toString() ?? "0",
          packageIds: [this.enteredPackageNumber],
        }
        this.loading.show();

        this.manifestService.insertRoute(obj).subscribe(async resp => {
          if (resp) {
            Swal.fire({
              icon: 'success',
              title: 'Package added!',
              text: `Package is added to read map successfully.`,
              confirmButtonText: 'OK'
            });
            this.loading.hide();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error creating route!',
              text: 'An error occurred while creating the route.',
              confirmButtonText: 'OK'
            });
            this.loading.hide();
          }
        })
      }
      else if (status == 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Zone',
          text: 'The package zone does not match the route.',
          confirmButtonText: 'OK'
        });
      }
      else if (status == 2) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Area',
          text: 'The package area does not match the route.',
          confirmButtonText: 'OK'
        });
      }
      else if (status == 3) {
        Swal.fire({
          icon: 'error',
          title: 'Already in Another Route',
          text: 'The package is already assigned to another route.',
          confirmButtonText: 'OK'
        });
      }
      else if (status == 4) {
        Swal.fire({
          icon: 'info',
          title: 'Not Billed',
          text: 'The package has not been billed yet.',
          confirmButtonText: 'OK'
        });
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Unknown Error',
          text: 'An unexpected error occurred.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
