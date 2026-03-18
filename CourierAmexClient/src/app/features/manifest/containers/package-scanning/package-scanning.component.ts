import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, finalize, filter, lastValueFrom } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models/pagination.interface';
import { BagInfo, CountManifestScanner, ManifestScanner, newBagInfo, newCountManifestScanner, newPackageReassign, newScannedPackageInfo, newScanPackage, PackageReassign, PackageStatus, PermissionActionEnum, PermissionsEnum, ScanLog, ScannedPackageInfo, ScanPackage } from '@app/models';
import { ManifestService } from '../../services';
import { PendingPackagesComponent } from '@app/features/manifest/components/package-scanning/pending-packages.component';
import { tr } from 'date-fns/locale';

@Component({
  selector: 'app-package-scanning',
  templateUrl: './package-scanning.component.html'
})
export class PackageScanningComponent implements OnInit {

  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild('packageNumberInput') packageNumberInputField!: ElementRef<HTMLInputElement>;
  @ViewChild('bagNumberInput') bagNumberInput!: ElementRef<HTMLInputElement>;
  isCollapsed1: boolean = true;
  isCollapsed2: boolean = true;
  isCollapsed3: boolean = true;
  isCollapsed4: boolean = true;

  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  isGatewayUser: boolean = false;

  selectedManifestRow: any = null;

  showBox = false;

  pagination: PaginationModel = defaultPagination;
  selectedManifestNumber: string = "";
  selectedManifestId: number = 0;
  selectedCompany = 0;
  selectedCompanyName = "";
  columns: ColDef[] = [];
  countManifestScanner: CountManifestScanner = newCountManifestScanner;

  historyScannedPackages: ScannedPackageInfo[] = [];

  startScanning: boolean = false;
  startScanningBag: boolean = false;
  startScanningPackage: boolean = false;

  scannedPackageNumber: string = "";
  scannedBagNumber: string = "";
  scannedPackageInfo: ScannedPackageInfo = newScannedPackageInfo;
  scannedBagInfo: BagInfo = newBagInfo;

  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'ManifestDate',
    sortDirection: 'DESC',
  };

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<ManifestScanner[]>([]);
  entities$ = this._entities.asObservable();

  translations = {
    Actions: '',
    ManifestNumber: '',
    Packages: '',
    ManifestDate: '',
    ManifestId: '',
    isEdit: false
  };
  isPackageNumberInputEnabled: boolean;

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private manifestService: ManifestService,
    private messageService: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackageScanning, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackageScanning, PermissionActionEnum.Update);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.pagination.ps = this.state.pageSize;
    this.translate.get([
      'PackageScanning.ManifestNumber',
      'PackageScanning.Packages',
      'PackageScanning.ManifestDate',
      'PackageScanning.ManifestId',
      'Labels.Actions'
    ])
      .subscribe(
        translations => {
          this.translations.ManifestNumber = translations['PackageScanning.ManifestNumber'];
          this.translations.Packages = translations['PackageScanning.Packages'];
          this.translations.ManifestDate = translations['PackageScanning.ManifestDate'];
          this.translations.ManifestId = translations['PackageScanning.ManifestId'];
          this.translations.Actions = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
    this.setDefaultCompany();
  }

  setDefaultCompany() {
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

  ngAfterViewInit(): void {
    this.columns.push({ field: 'manifestNumber', label: this.translations.ManifestNumber, sortable: true });
    this.columns.push({ field: 'packages', label: this.translations.Packages, sortable: true });
    this.columns.push({ field: 'manifestDate', label: this.translations.ManifestDate, sortable: true });
    this.columns.push({ field: 'manifestId', label: this.translations.ManifestId, sortable: true, hidden: true });
    this.columns.push({ field: 'action', label: this.translations.Actions, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });

    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewChecked() {
    if ((this.startScanningBag && this.isPackageNumberInputEnabled && this.packageNumberInputField) || (this.startScanning && this.packageNumberInputField) || (this.startScanningPackage && this.packageNumberInputField)) {
      this.packageNumberInputField.nativeElement.focus();
    }

    if (this.startScanningBag && !this.isPackageNumberInputEnabled && this.bagNumberInput) {
      this.bagNumberInput.nativeElement.focus();
    }
  }

  viewDetail(param: any) {
    this.selectedManifestNumber = param.manifestNumber.toString();
    this.selectedManifestRow = { id: param.id };
    this.selectedManifestId = parseInt(param.id);
    this.loading.show();
    this.GetSelectedmanifestScanningSummary();
    this.historyScannedPackages = [];

    this.ResetVariablesForNewBag();
    this.startScanning = false;
    this.startScanningBag = false;
    this.startScanningPackage = false;
    this.ResetVariablesForNewManifest();
  }

  private GetSelectedmanifestScanningSummary(hideLoading: boolean = false) {
    this.manifestService.GetCountManifestScanner(this.selectedManifestNumber).subscribe({
      next: async (response) => {
        this.countManifestScanner = response.data ?? newCountManifestScanner;
      },
      error: (err) => {
        console.error('Error fetching Pending Packages:', err);
      },
      complete: () => {
        console.log('Request completed successfully');
        this.loading.hide();

        if (hideLoading)
          this.loading.hide();
      }
    });
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
    this.performSearch();
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany : 0;

    this.manifestService.GetManifestScanner(this.pagination, companyId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
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
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        });
  }

  protected selectCompany(id: number): void {
    this.selectedCompany = id;

    this.selectedManifestNumber = "";
    this.countManifestScanner = newCountManifestScanner;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  protected ViewPending(): void {
    const modalRef = this.modalService.open(PendingPackagesComponent, { size: 'xl', centered: true });
    modalRef.componentInstance.selectedManifestNumber = this.selectedManifestNumber;
  }

  protected OpenHistory(): void {
    this.showBox = !this.showBox
  }

  protected StartBag(): void {
    if (this.startScanningBag && this.scannedBagInfo.pending > 0) {
      if (confirm("Current Bag In Progress have pending Packages. Do you still want to start a new Bag ?")) {
        this.ResetVariablesForNewBag();
        this.ResetVariablesForNewManifest();
      }
    } else {
      this.ResetVariablesForNewBag();
      this.ResetVariablesForNewManifest();
    }

    this.startScanning = false;
    this.startScanningBag = true;
  }

  protected StartPackage(): void {
    this.startScanningPackage = true;

    this.selectedManifestRow = null;
    this.selectedManifestNumber = '';
    this.selectedManifestId = 0;

    this.countManifestScanner = newCountManifestScanner;

    this.ResetVariablesForNewBag();
    this.startScanningBag = false;

    this.ResetVariablesForNewManifest();
    this.startScanning = false;
  }

  protected ClearBagAndPackage(): void {
    this.ResetVariablesForNewBag();
    this.ResetVariablesForNewManifest();
    this.startScanning = false;
    this.startScanningBag = false;
    this.startScanningPackage = false;
  }

  protected StartManifest(): void {
    if (this.countManifestScanner.pending > 0) {
      if (this.scannedBagInfo.pending && this.scannedBagInfo.pending > 0) {
        if (confirm("Current Bag In Progress have pending Packages. Do you want to keep Bag ?")) {
          this.ResetVariablesForNewManifest();
        } else {
          this.ResetVariablesForNewManifest();
          this.ResetVariablesForNewBag();
        }
      } else {
        this.ResetVariablesForNewManifest();
        this.ResetVariablesForNewBag();
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'No Pending Package Found'
      });
    }

    this.startScanning = true;
    this.startScanningBag = false;
  }

  protected onBagNumberChange() {
    this.loading.show();

    this.manifestService.GetBagInfo(this.scannedBagInfo.bag).subscribe(res => {
      if (res.success) {
        this.loading.hide();
        this.scannedBagInfo = res.data || newBagInfo;
        this.scannedBagNumber = this.scannedBagInfo.bag;
      } else {
        this.loading.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message
        });
      }
    });

    this.isPackageNumberInputEnabled = true;
  }

  protected async onPackageNumberChange(): Promise<void> {
    if (this.startScanningPackage) {
      this.GetSelectedPackageManifest();
    } else {
      if (!this.startScanningBag) {
        this.startScanning = true;
        this.scannedPackageInfo = newScannedPackageInfo;
      }

      this.loading.show();
      this.GetPackageDetailsAndValidate();
    }
  }

  private GetPackageDetailsAndValidate() {
    this.manifestService.GetScannedPackage(this.scannedPackageNumber, this.selectedManifestNumber).subscribe(async (res) => {
      if (res.success) {
        this.loading.hide();

        if (res.message != '' && res.message == 'Package Does Not Exist') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'The entered package was not found or is assigned to an open manifest; please verify on the packages screen!'
          });

          this.SaveLog("GATEWAY", "", "", "", "", parseInt(this.scannedPackageNumber), "");

          this.scannedPackageNumber = '';
          return;
        } else {
          const packageInfo = res.data ?? newScannedPackageInfo;

          if (packageInfo.packageCompanyId && packageInfo.packageCompanyId != this.selectedCompany) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'The package does not belong to the Company: ' + this.selectedCompanyName + ', please verify!'
            });

            this.scannedPackageNumber = '';
            return;
          }

          if (this.startScanning || this.startScanningPackage) {
            if (packageInfo.manifestId == 0) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'The scanned package is not manifested. To automatically assign it to a manifest, you must have scanned a package that initiates the package scanning process. Please scan a valid package so that unmanifested packages can later be assigned to the manifest in progress.'
              });

              this.SaveLog("NO MANIFESTADO", "", "", "", "", parseInt(this.scannedPackageNumber), "");

              this.scannedPackageNumber = '';
              return;
            } else {
              if (this.scannedBagInfo.bag == '' || this.scannedBagInfo.bag == packageInfo.bag) {
                this.scannedPackageInfo = packageInfo;
                this.GetScannedpackageBagInfo();

                this.UpdatePackageStatusToScanned();
                return;
              } else {
                if (this.scannedBagInfo.pending > 0 && !this.scannedPackageNumber) {
                  if (confirm('The Bag In Progress is not same as the Bag for scanned package, do you want to continue ?')) {
                    this.scannedPackageInfo = packageInfo;
                    this.GetScannedpackageBagInfo();

                    this.UpdatePackageStatusToScanned();
                    return;
                  } else {
                    this.scannedPackageNumber = '';
                    return;
                  }
                } else {
                  this.scannedPackageInfo = packageInfo;
                  this.GetScannedpackageBagInfo();

                  this.UpdatePackageStatusToScanned();
                  return;
                }
              }
            }
          }

          if (this.startScanningBag && this.scannedBagInfo.bag) {
            if (packageInfo.manifestId == 0) {
              if (confirm("Assign the package to the manifest and bag in progress ?")) {
                this.scannedPackageInfo = packageInfo;
                await this.AddPackageToManifest(packageInfo.packageNumber, this.scannedBagInfo.bag, this.selectedManifestId);
              } else {
                this.scannedPackageNumber = '';
                return;
              }
            } else {
              if (packageInfo.bag == this.scannedBagInfo.bag) {
                this.scannedPackageInfo = packageInfo;

                this.UpdatePackageStatusToScanned();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'The package does not belong to the Bag: ' + this.scannedBagNumber + ', please verify!'
                });
                this.scannedPackageNumber = '';
                return;
              }
            }
          }
        }
      } else {
        this.loading.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message
        });
      }
    });
  }

  GetSelectedPackageManifest() {
    this.manifestService.GetManifestId(this.scannedPackageNumber).subscribe({
      next: async (response) => {
        if (response.success) {
          this.selectedManifestId = response.data ?? 0;
          await this.entities$.subscribe(manifests => {
            if (manifests.length > 0) {
              const selectedManifest = manifests.find(m => m.id === this.selectedManifestId);

              if (selectedManifest?.manifestNumber) {
                this.selectedManifestNumber = selectedManifest.manifestNumber.toString();
                this.selectedManifestRow = selectedManifest;
                this.GetSelectedmanifestScanningSummary();
                this.GetPackageDetailsAndValidate();
              }
            }
          });
        }
      },
      error: (err) => {
        console.error('Error in request "GetManifestId":', err);
      },
      complete: () => {
        console.log('Request "GetManifestId" completed successfully');
      }
    });
  }

  SaveLog(logtype: string, newBag: string, previousBag: string, newManifest: string, previousManifest: string, packageNumber: number, scanType: string) {
    let scanLoginput: ScanLog = {
      date: new Date,
      logType: logtype,
      newBag: newBag,
      newManifest: newManifest,
      packageNumber: packageNumber,
      previousBag: previousBag,
      previousManifest: previousManifest,
      scanType: scanType,
      user: '',
      id: 0
    }
    this.manifestService.CreateScanLog(scanLoginput).subscribe(res => {
      if (res.success) {
      } else {
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: res.message
        // });
      }
    });
  }

  private GetScannedpackageBagInfo() {
    this.manifestService.GetBagInfo(this.scannedPackageInfo.bag).subscribe(res => {
      if (res.success) {
        this.scannedBagInfo = res.data || newBagInfo;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message
        });
      }
    });
  }

  private ResetVariablesForNewBag(): void {
    this.scannedBagInfo.bag = '';
    this.scannedBagInfo.customs = 0;
    this.scannedBagInfo.pending = 0;
    this.scannedBagInfo.normal = 0;
    this.scannedBagInfo.total = 0;
    this.scannedBagNumber = '';
    this.isPackageNumberInputEnabled = false;
  }

  private ResetVariablesForNewManifest(): void {
    this.scannedPackageInfo = newScannedPackageInfo;
    this.scannedPackageNumber = '';
  }

  private async AddPackageToManifest(packageNumber: number, bagNumber: string, manifestId: number): Promise<boolean> {
    const packageReassignInput: PackageReassign = {
      bagNumber: bagNumber,
      manifestId: manifestId,
      packageNumber: packageNumber,
      modifiedby: ""
    };
    try {
      const res = await lastValueFrom(this.manifestService.PackageReassignUpdate(packageReassignInput));

      if (res.success) {
        return this.handlePackageStatus(res.data ?? -1);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error adding the package to the Bag.'
        });
        return false;
      }
    } catch (error) {
      console.error("API Error:", error);
      return false;
    }
  }

  handlePackageStatus(status: number): boolean {
    const packageMessages: Record<PackageStatus, string> = {
      [PackageStatus.Reassigned]: 'Package Reassigned Successfully.',
      [PackageStatus.AlreadyManifested]: 'Package already manifested.',
      [PackageStatus.CountryMismatch]: 'Country of the manifest is not the same as the Country of the client.',
      [PackageStatus.GatewayMismatch]: 'Gateway does not have the country of the manifest as its destination.',
      [PackageStatus.Unknown]: 'Unknown status.'
    };

    const packageStatus = (Object.values(PackageStatus) as number[]).includes(status)
      ? status as PackageStatus
      : PackageStatus.Unknown;

    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: packageMessages[packageStatus]
    });

    if (packageStatus === PackageStatus.Reassigned) {
      this.SaveLog("MANIFESTADO", this.scannedBagInfo.bag, "", this.selectedManifestNumber, "", parseInt(this.scannedPackageNumber), "");
      this.manifestService.GetScannedPackage(this.scannedPackageNumber, this.selectedManifestNumber).subscribe(res => {
        if (res.success) {
          this.scannedPackageInfo = res.data ?? newScannedPackageInfo;
          this.GetScannedpackageBagInfo();
          this.GetSelectedmanifestScanningSummary();
          this.historyScannedPackages.push(this.scannedPackageInfo);
        } else {
          console.log('An Error occurred while updating package info after reassigning');
        }
      });
      return true;
    } else {
      return false;
    }
  }

  ShowPackageScanHistory() {
  }

  private UpdatePackageStatusToScanned() {
    const packageStatus = this.scannedPackageInfo.estId;
    this.scannedPackageInfo.type = packageStatus == 3 ? 1 : (packageStatus == 4 ? 2 : 0);
    this.manifestService.PackageScanUpdate(this.scannedPackageInfo).subscribe(res => {
      if (res.success) {
        this.GetScannedpackageBagInfo();
        this.GetSelectedmanifestScanningSummary();
        this.SaveLog("ESCANEADO", this.scannedBagInfo.bag, this.scannedBagInfo.bag, this.selectedManifestNumber, this.selectedManifestNumber, parseInt(this.scannedPackageNumber), "ESCANEAR");
        this.historyScannedPackages.push(this.scannedPackageInfo);
        this.scannedPackageNumber = "";
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Manifest updated successfully!'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message
        });
      }
    });
  }
}