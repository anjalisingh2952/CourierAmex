import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize, firstValueFrom, forkJoin } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { PaginationModel, PermissionActionEnum, PermissionsEnum, RouteInsertModel, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CountryModel, StateModel, ZoneModel } from '@app/features/general/models';
import { ZoneService } from '@app/features/general/services';
import { CompanyModel } from '@app/features/company';
import { ManifestService } from '@app/features/manifest/services';
import { Invoice } from '@app/features/invoice/models';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PackageSheet } from '@app/features/package';

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
  selector: 'app-generate-route-sheet',
  templateUrl: './generate-route-sheet.component.html',
  styleUrl: './generate-route-sheet.component.scss'
})
export class GenerateRouteSheetComponent {
  @ViewChild('panel', { static: false }) panel!: ElementRef;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild('routeModal') routeModal!: ElementRef;

  packageData = new BehaviorSubject<PackageSheet[]>([]);
  private readonly _entities = new BehaviorSubject<ZoneModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  private readonly _states = new BehaviorSubject<StateModel[]>([]);
  states$ = this._states.asObservable();

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  pagination: PaginationModel = defaultPagination;
  columns: ColDef[] = [];
  rows: Invoice[] = [];
  searchValue: string = ""
  startDate: string = '';
  selectedZoneIds: number[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  pageSize = 20;
  selectedRows: number[] = [];
  selectedCountry: CountryModel | undefined = undefined;
  selectedState: StateModel | undefined = undefined;
  hasAdd: boolean = false;
  totalPackages: number = 0;
  manifestId: string;
  modalRef!: NgbModalRef;
  routeDescription: string = '';
  zonelist: any;
  selectedZone: string = '';
  selectedZoneId: any;
  allSelected = false;
  selectedCompany = 0;
  selectedCompanyName = "";
  isGatewayUser: boolean = false;

  state: TableState = {
    page: 1,
    pageSize: 20,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    actoin: '',
    manifestNumber: '',
    manifestDate: '',
    clientCode: '',
    clientFullName: '',
    clientAddress: '',
    packageID: 0,
    packageNumber: '',
    packageDescription: '',
    packageOrigin: '',
    packageWeight: 0,
    packagePrice: 0,
    packageType: '',
    areaCode: '',
    stopName: '',
    zoneCode: '',
    zoneName: ''
  };

  constructor(
    private router: Router,
    private loading: LoadingService,
    private zoneService: ZoneService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private manifestService: ManifestService,
    private translate: TranslateService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef

  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'ManagePackagesRoute.ManifestNumber',
      'ManagePackagesRoute.ManifestDate',
      'ManagePackagesRoute.ClientCode',
      'ManagePackagesRoute.ClientFullName',
      'ManagePackagesRoute.ClientAddress',
      'ManagePackagesRoute.PackageID',
      'ManagePackagesRoute.PackageNumber',
      'ManagePackagesRoute.PackageDescription',
      'ManagePackagesRoute.PackageOrigin',
      'ManagePackagesRoute.PackageWeight',
      'ManagePackagesRoute.PackagePrice',
      'ManagePackagesRoute.PackageType',
      'ManagePackagesRoute.AreaCode',
      'ManagePackagesRoute.StopName',
      'ManagePackagesRoute.ZoneCode',
      'ManagePackagesRoute.ZoneName'
    ]).subscribe(translations => {
      this.translations.actoin = translations['Labels.Actions'];
      this.translations.manifestNumber = translations['ManagePackagesRoute.ManifestNumber'];
      this.translations.manifestDate = translations['ManagePackagesRoute.ManifestDate'];
      this.translations.clientCode = translations['ManagePackagesRoute.ClientCode'];
      this.translations.clientFullName = translations['ManagePackagesRoute.ClientFullName'];
      this.translations.clientAddress = translations['ManagePackagesRoute.ClientAddress'];
      this.translations.packageID = translations['ManagePackagesRoute.PackageID'];
      this.translations.packageNumber = translations['ManagePackagesRoute.PackageNumber'];
      this.translations.packageDescription = translations['ManagePackagesRoute.PackageDescription'];
      this.translations.packageOrigin = translations['ManagePackagesRoute.PackageOrigin'];
      this.translations.packageWeight = translations['ManagePackagesRoute.PackageWeight'];
      this.translations.packagePrice = translations['ManagePackagesRoute.PackagePrice'];
      this.translations.packageType = translations['ManagePackagesRoute.PackageType'];
      this.translations.areaCode = translations['ManagePackagesRoute.AreaCode'];
      this.translations.stopName = translations['ManagePackagesRoute.StopName'];
      this.translations.zoneCode = translations['ManagePackagesRoute.ZoneCode'];
      this.translations.zoneName = translations['ManagePackagesRoute.ZoneName'];
    });
  }
  ngOnInit(): void {
    this.loadAttributes();
    this.setDefaultCompany();
    this.loadCompany();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'action', label: this.translations.actoin, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.columns.push({ field: 'manifestNumber', label: this.translations.manifestNumber, sortable: true });
    this.columns.push({ field: 'manifestDate', label: this.translations.manifestDate, type: "date", sortable: true });
    this.columns.push({ field: 'clientCode', label: this.translations.clientCode, sortable: true });
    this.columns.push({ field: 'clientFullName', label: this.translations.clientFullName, sortable: true });
    this.columns.push({ field: 'clientAddress', label: this.translations.clientAddress, sortable: true });
    this.columns.push({ field: 'packageID', label: this.translations.packageID.toString(), sortable: true });
    this.columns.push({ field: 'packageNumber', label: this.translations.packageNumber, sortable: true });
    this.columns.push({ field: 'packageDescription', label: this.translations.packageDescription, sortable: true });
    this.columns.push({ field: 'packageOrigin', label: this.translations.packageOrigin, sortable: true });
    this.columns.push({ field: 'packageWeight', label: this.translations.packageWeight.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'packagePrice', label: this.translations.packagePrice.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'packageType', label: this.translations.packageType, sortable: true });
    this.columns.push({ field: 'areaCode', label: this.translations.areaCode, sortable: true });
    this.columns.push({ field: 'stopName', label: this.translations.stopName, sortable: true });
    this.columns.push({ field: 'zoneCode', label: this.translations.zoneCode, sortable: true });
    this.columns.push({ field: 'zoneName', label: this.translations.zoneName, sortable: true });

    this.changeDetectorRef.detectChanges();
  }

  setDefaultCompany() {
    this.loading.show();
    this.companies$.subscribe(companies => {
      if (this.credentailsService.isGatewayUser() && companies.length > 0) {
        const userCia = companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectedCompany = userCia.id;
          this.selectedCompanyName = userCia.name;
          this.performSearch();
        }
      }
    });
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

  private performSearch(): void {
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this.pagination.ps = 1000;
    this._entities.next([]);
    const countryId = this.selectedCountry?.id ?? 0;
    const stateId = this.selectedState?.id ?? 0;
    this.zoneService.getPaged$(this.pagination, this.selectedCompany, stateId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
          this.zonelist = res.data;
          this.loading.hide()
        },
        error: (error) => {
          console.error(error);
          this.loading.hide();
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

  filterData(): Zone[] {
    return this.zonelist
      .filter((zone: Zone) =>
        zone.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        zone.countryName.toLowerCase().includes(this.searchValue.toLowerCase())
      )
      .sort((a: Zone, b: Zone) => this.sortFunction(a, b))
      .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  toggleSelection(zone: Zone): void {
    if (this.selectedZoneIds.includes(zone.id)) {
      this.selectedZoneIds = this.selectedZoneIds.filter((id) => id !== zone.id);
    } else {
      this.selectedZoneIds.push(zone.id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedZoneIds.length === this.zonelist.length) {
      this.selectedZoneIds = [];
    } else {
      this.selectedZoneIds = this.zonelist.map((zone: { id: any; }) => zone.id);
    }
  }

  sortFunction(a: Zone, b: Zone): number {
    if (!this.sortColumn) return 0;
    const valueA = a[this.sortColumn as keyof Zone]?.toString().toLowerCase() || '';
    const valueB = b[this.sortColumn as keyof Zone]?.toString().toLowerCase() || '';

    if (this.sortDirection === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  }

  changeSorting(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.zonelist.length / this.pageSize);
  }

  openRouteModal(template: TemplateRef<any>) {
    if (this.selectedRows.length > 0) {
      this.routeDescription = "";
      this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No package selected!',
        text: 'Please select at least one package before proceeding.',
        confirmButtonText: 'OK'
      });
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  collapsePanel() {
    if (this.panel) {
      this.panel.nativeElement.classList.toggle('collapsed');
    }
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

    this.LoadPackage() 
  }

  LoadPackage() {
    this.loading.show();

    if (!this.selectedZoneIds.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No zones selected!',
        text: 'Please select at least one zone before proceeding.',
        confirmButtonText: 'OK'
      });
      this.loading.hide();
      return;
    }

    const zoneIds = this.selectedZoneIds.join(',');
    this.manifestService.GetFilterRouteSheet(this.manifestId ?? null, zoneIds,3,this.state.pageSize,this.state.page,this.state.searchTerm).subscribe({
      next: (response: PackageSheet[]) => {
        console.log("Merged API response:", response);
        this.packageData.next(response);
        this.totalPackages = response.length;
      },
      error: (err) => {
        console.error("Error fetching route sheets:", err);
      },
      complete: () => {
        this.loading.hide();
      }
    });
  }

  async onCheckboxChange(selectedRow: PackageSheet): Promise<void> {
    // Get current value directly instead of converting observable to promise
    const entities = this.packageData.value;

    // Use a Set for faster lookups if selectedRows grows large
    const selectedRowsSet = new Set(this.selectedRows);
    const packageId = selectedRow.packageID;
    const isSelected = selectedRowsSet.has(packageId);

    if (isSelected) {
      selectedRowsSet.delete(packageId);
    } else {
      selectedRowsSet.add(packageId);
    }
    this.selectedRows = Array.from(selectedRowsSet);

    const updatedEntities = [...entities];
    const index = updatedEntities.findIndex(row => row.packageID === packageId);
    if (index !== -1) {
      updatedEntities[index] = { ...updatedEntities[index], selected: !isSelected };
    }

    this.packageData.next(updatedEntities);
    console.log("Updated selected rows:", this.selectedRows);
  }

  async selectAllPackages(): Promise<void> {
    const entities = await firstValueFrom(this.packageData);
    const allSelected = this.selectedRows.length !== entities.length;
    const count = entities.length;

    const result = await Swal.fire({
      title: allSelected ? `Select All ${count} Packages?` : "Deselect All Packages?",
      text: allSelected ? `You are about to select ${count} packages.` : "This will clear all selected packages.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    this.selectedRows = allSelected ? entities.map(row => row.packageID) : [];

    const updatedEntities = entities.map(row => ({
      ...row,
      selected: allSelected,
    }));

    this.packageData.next(updatedEntities);

    Swal.fire({
      title: "Updated!",
      text: allSelected ? `${count} packages selected.` : "All selections cleared.",
      icon: "success",
    });

    console.log("Updated selected rows:", this.selectedRows);
  }

  saveRouteDescription() {
    if (!this.routeDescription) {
      Swal.fire({
        icon: 'warning',
        title: 'Route description required!',
        text: 'Please enter a description for the route.',
        confirmButtonText: 'OK'
      });
      return;
    }

    var obj: RouteInsertModel = {
      description: this.routeDescription,
      userId: this.credentailsService.credentials?.user.id ?? "",
      status: 0,
      zoneId: 0,
      deliveryTypeId: 1,
      PointOfSaleId: 1,
      companyId: this.credentailsService.credentials?.user.companyId?.toString() ?? "0",
      packageIds: this.selectedRows
    }
    this.loading.show();

    this.manifestService.insertRoute(obj).subscribe(async resp => {
      if (resp) {
        Swal.fire({
          icon: 'success',
          title: 'Route created!',
          text: `Route has been successfully created for ${this.selectedRows.length} packages and route Id is ${resp}.`,
          confirmButtonText: 'OK'
        });

        const entities = await firstValueFrom(this.packageData);
        const updatedEntities = entities.filter(row => !this.selectedRows.includes(row.packageID));
        this.packageData.next(updatedEntities);
        this.totalPackages = updatedEntities.length;
        this.selectedRows = [];
        this.modalRef.close();
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
}