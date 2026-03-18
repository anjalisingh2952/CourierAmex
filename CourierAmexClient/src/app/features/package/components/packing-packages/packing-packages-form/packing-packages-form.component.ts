import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService } from '@app/@core';
import { CommodityModel, CompanyModel, packageDetailModel, PackageModel, PackageService } from '@app/features';
import { SearchCustomerComponent } from '@app/@shared';
import { Subject, takeUntil } from 'rxjs';
import { TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ManifestModel } from '@app/models/manifest.model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-packing-packages-form',
  templateUrl: './packing-packages-form.component.html',
  inputs: ['entity', 'companies', 'manifests', 'airGuides'],
  outputs: ['onCompanyChange', 'onManifestChange', 'onAirGuideChange'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PackingPackagesFormComponent {

  @ViewChild('form', { read: NgForm }) form!: NgForm;
  @ViewChild(SearchCustomerComponent) searchCustomer!: SearchCustomerComponent;
  bags: any;
  sortedPackage: any;
  airGuides: any;
  selectedManifest: any;
  isCompanyValid: boolean = false;
  isManifestConsolidatedType: boolean = false;
  entity!: ManifestModel;
  isRecordsForAirGuides: boolean = false;
  companies!: CompanyModel[];
  manifests!: ManifestModel[];
  selectedGuideId: number = 0;
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'ASC',
  };

  companyId: number;
  isLoading: boolean = false;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  customerSearch = {
    isValid: false,
    isInvalid: false,
    touched: false
  };

  onCompanyChange = new EventEmitter<number>();
  onManifestChange = new EventEmitter<number>();
  onAirGuideChange = new EventEmitter<string>();

  private destoy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private credentailsService: CredentialsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();

    this.loadingService.isLoading$
      .pipe(takeUntil(this.destoy$))
      .subscribe(val => this.isLoading = val);

    this.commonService.getCompanies$()
      .pipe(takeUntil(this.destoy$))
      .subscribe(companies => {
        this.companies = companies;
        this.setDefaultCompany();
      });
  }

  ngOnInit(): void {
    this.getContaninerType();
    if (this.credentailsService.isGatewayUser()) {
      //this.loadingService.show();
    }
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
    if (this.manifests && this.manifests.length > 0) {
      this.loadingService.hide();
      this.cdr.detectChanges();
    }
  }



  getContaninerType() {
    if (this.router.url.includes('packing-packages-consolidated')) {
      this.isManifestConsolidatedType = true;
      this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackingPackageConsolidate, PermissionActionEnum.Add);
      this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackingPackageConsolidate, PermissionActionEnum.Update);
    }
    else if (this.router.url.includes('packing-packages-aeropost')) {
      this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackingPackagesAeropost, PermissionActionEnum.Add);
      this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackingPackageAeropost, PermissionActionEnum.Update);
    }
    else if (this.router.url.includes('packing-packages-courier')) {
      this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackingPackageCourier, PermissionActionEnum.Add);
      this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackingPackageCourier, PermissionActionEnum.Update);
    }
  }

  ngOnDestroy(): void {
    this.destoy$.next();
    this.destoy$.complete();
  }

  onChangeOfCompany(event: Event | undefined): void {
    const target = event?.target as HTMLSelectElement;
    const companyId = parseInt(target.value, 10) || undefined;

    if (companyId) {
      this.companyId = companyId
      this.isCompanyValid = true;
      this.companyChange(companyId);
    }
  }

  companyChange(companyId: any | undefined): void {
    this.isCompanyValid = true;
    this.onCompanyChange.emit(companyId);
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser() && this.companies.length > 0) {
      const userCia = this.companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
      if (userCia) {
        this.companyChange(userCia.id);
        this.loadingService.show();
      }
    }
  }

  onChangeOfManifest(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value.trim();
    const selectedId = Number(value.split(':').pop());
    this.selectedManifest = selectedId
    this.commonService.getAirGuidesByManifest$(this.companyId, selectedId)
      .subscribe({
        next: (airGuides) => {
          this.airGuides = airGuides;
          this.isRecordsForAirGuides = this.airGuides.length > 0;
        }
      });
    const selectedManifest = this.manifests.find(manifest => manifest.id === selectedId);
    if (selectedManifest) {
      this.manifestChange(selectedManifest);
    } else {
      console.error('Selected manifest not found or invalid value:', value);
    }
  }

  onChangeOfAirGuide(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value.trim();
    const selectedId = value.split(': ').pop();
    this.commonService.getAirGuidesDetail$(selectedId, this.selectedManifest)
      .subscribe({
        next: (airGuides) => {
          console.log(airGuides);
          this.bags = airGuides.data?.totalPackage ?? 0;
          this.sortedPackage = airGuides.data?.sortedPackage ?? 0;
          console.log('Forced Change Detection:', this.bags, this.sortedPackage);
          this.cdr.detectChanges();
        }
      });
    if (selectedId) {
      this.airGuideChange(selectedId);
    }
  }

  manifestChange(manifestId: any): void {
    this.onManifestChange.emit(manifestId);
  }

  airGuideChange(airGuide: any): void {
    this.onAirGuideChange.emit(airGuide);
  }
}