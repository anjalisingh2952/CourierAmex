import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { PackageService } from '@app/features/package/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-packing-packages-section-selection',
  templateUrl: './packing-packages-section-selection.component.html'
})
export class PackingPackagesSectionSelectionComponent {
  @Input() manifestId!: number;
  @Input() reference!: string;
  @Input() airGuideId!: string;
  @Input() isPackageList!: boolean;
  @Input() closePackage!: boolean;
  @Output() packageResponse = new EventEmitter<any>();
  @Output() childGuideId = new EventEmitter<any>();
  @Output() selectedCategory = new EventEmitter<any>();
  @Output() onPalletChange = new EventEmitter<any>();
  @Output() isPackagingStarted = new EventEmitter<any>();
  ancho = 0;
  alto = 0;
  largo = 0;
  peso = 0;
  actualVolumeWeight = 0;
  categorySelect = '';
  isIndividualRadio: boolean;
  componentType = '';
  packageListDetail: any[] = [];
  PackageDetail: any = {};
  request: any = {};
  pallet: any;
  typeChanged: boolean;
  packType: any;
  isClicked = false;
  isManifestConsolidatedType: boolean;

  constructor(
    private packageService: PackageService,
    private loadingService: LoadingService,
    private router: Router,
    private cred: CredentialsService,
    private messages: MessageService
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('packing-packages-consolidated')) {
      this.isManifestConsolidatedType = true;
    } else if (this.router.url.includes('packing-packages-courier')) {
      this.componentType = 'Courier';
      this.packType = "AIPE";
    } else if (this.router.url.includes('packing-packages-aeropost')) {
      this.componentType = 'Aeropost';
      this.packType = "AIPE";
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes['closePackage']);
    if (changes['closePackage']?.currentValue === true || changes['isPackageList']?.currentValue === true) {
      this.resetPackageData();
      this.isPackagingStarted.emit(false)
    }
  }

  resetPackageData(): void {
    this.isClicked = false;
    this.isPackageList = true;
    this.ancho = this.alto = this.largo = this.peso = this.actualVolumeWeight = 0;
  }

  calcularPesoVolumetrico(): string {
    this.actualVolumeWeight = (this.alto * this.ancho * this.largo) / 360;
    return this.actualVolumeWeight.toFixed(2);
  }

  startPackaging(packageType: any): void {
    if (packageType) {
      if (!this.airGuideId) {
        Swal.fire('Warning', 'Please select child Guide.', 'warning');
        return;
      }
      this.reference = this.airGuideId.toString();
    } else if (packageType && this.pallet === undefined) {
      Swal.fire('Warning', 'Please provide Pallet.', 'warning');
      return;
    } else if (this.pallet === 0) {
      Swal.fire('Warning', 'Please enter a valid Pallet number.', 'warning');
      return;
    }

    if (this.isManifestConsolidatedType && this.categorySelect === '') {
      this.categorySelect = "C";
    }

    if (this.componentType === "Aeropost") {
      if (!this.manifestId) {
        Swal.fire('Warning', 'Please select Manifest first.', 'warning');
        return;
      }
      if (!this.reference) {
        this.packageService.GetNextReferenceAsync("AIPE", 6).subscribe(resp => {
          this.reference = resp.data;
        });
      }
      if (!this.categorySelect) {
        this.categorySelect = "C";
      }
    } else {
      if (!this.manifestId || !this.reference) {
        Swal.fire('Warning', 'Please provide both Manifest and Reference.', 'warning');
        return;
      }
    }

    this.isPackagingStarted.emit(true)
    this.packageService.GetPackedPackagesForAirGuides(this.categorySelect, this.reference, this.manifestId, 1, this.pallet).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.isClicked = true;
          this.packageListDetail = response.data.packagedPackages || [];
          this.PackageDetail = response.data.packageDetails || {};

          if (this.packageListDetail.length === 0 && Object.keys(this.PackageDetail).length === 0) {
            this.isClicked = true;
            this.isPackageList = true;
            Swal.fire('Warning', 'No packages available.', 'warning');
            this.savePackageDetails();
          } else {
            this.isPackageList = false;
          }
          this.updatePackageDetails(this.PackageDetail);
          this.packageResponse.emit(this.packageListDetail);
        }
      },
      error: () => {
        Swal.fire('Error', 'Error loading the packages. Please try again.', 'error');
        this.loadingService.hide();
      },
      complete: () => this.loadingService.hide(),
    });
  }

  savePackageDetails(): void {
    const totalSystemVolumeWeight = this.packageListDetail.reduce((acc, curr) => acc + (curr.volumetricWeight || 0), 0);
    const totalSystemWeight = this.packageListDetail.reduce((acc, curr) => acc + (curr.weight || 0), 0);

    this.request = {
      ManifestId: this.manifestId,
      Bag: this.reference,
      TaxType: 0,
      Width: this.ancho,
      Height: this.alto,
      Length: this.largo,
      ActualVolumeWeight: this.actualVolumeWeight,
      ActualWeight: this.peso,
      SystemVolumeWeight: totalSystemVolumeWeight,
      SystemWeight: totalSystemWeight,
      Packages: this.packageListDetail.length,
      PackagingType: this.packType ?? "AIPE",
      Sequence: 0,
      Category: this.categorySelect,
      User: this.cred.credentials?.user.name,
      IsConsolidated: this.isManifestConsolidatedType ? 1 : 2,
      Pallet: this.pallet
    };

    this.packageService.RegisterBagPackaging(this.request).subscribe({
      next: () => Swal.fire('Success', 'Package registered successfully', 'success'),
      error: () => Swal.fire('Error', 'Error saving package details.', 'error'),
    });
  }

  savePackageDetailsOnUpdate(): void {
    if (!this.isClicked && !this.isPackageList) {
      Swal.fire(this.messages.getTranslate('Warning'), 'No packages available.', 'warning');
      return;
    }
    this.savePackageDetails();
  }

  updatePackageDetails(detail: any): void {
    if (!detail) return;
    this.ancho = detail.width || 0;
    this.alto = detail.height || 0;
    this.largo = detail.length || 0;
    this.peso = detail.actualWeight || 0;
    this.actualVolumeWeight = detail.actualVolumeWeight || 0;
  }

  onTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLInputElement).value;
    this.isIndividualRadio = selectedValue === '1';
    this.typeChanged = true;
    this.pallet = null;
  }

  changeCategory(): void {
    this.selectedCategory.emit(this.categorySelect);
  }

  setReference(): void {
    this.childGuideId.emit(this.reference);
  }

  onChangePallet(): void {
    this.onPalletChange.emit(this.pallet);
  }

}