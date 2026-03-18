import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap } from 'rxjs';
import { PackageCategoryModel, packageDetailModel, PackageModel } from '@app/features/package/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { GenericResponse, PaginationModel, defaultPagination } from '@app/models';
import { PackageService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { PackingPackagesPackagesListComponent } from '../../components/packing-packages/packing-packages-packages-list/packing-packages-packages-list.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-packing-packages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './packing-packages.component.html',
})
export class PackingPackagesComponent {
  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0, });
  pagination: PaginationModel = defaultPagination;
  readonly companies$: Observable<CompanyModel[]>;
  readonly entity$: Observable<ManifestModel> = of({ ...newManifestModel });
  readonly manifests$: Observable<ManifestModel[]>;
  packages$: Observable<any>;
  readonly packageDetailModel: packageDetailModel[];
  readonly airGuidesDetails: packageDetailModel[];
  manifestId: number = 0;
  closePackage: boolean;
  manifestNumber: any;
  airGuideId: any;
  modalListDetail: any;
  palet: any;
  selectedCategory: any;
  packageType: string = "";
  packageSubType: any;
  isManifestConsolidatedType: boolean = false;
  selectedManifest!: ManifestModel;
  packageList: any = [];
  isPackagingStarted: boolean;
  isPackageList: boolean;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private toastr: ToastrService,
    private credentailsService: CredentialsService,
    private changeDetect: ChangeDetectorRef
  ) {
    const $selectedCompany = this._entityState.pipe(
      map((state: ManifestModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    const $selectedManifest = this._entityState.pipe(
      map((state: ManifestModel) => ({ id: state.id, companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.id === curr.id)

    );

    if (this.router.url.includes('packing-packages-consolidated')) {
      this.packageType = "consolidated";
      this.isManifestConsolidatedType = true;
    }
    else if (this.router.url.includes('packing-packages-aeropost')) {
      this.packageType = "aeropost";
      this.selectedCategory = "C"
    }

    this.manifests$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0),
      exhaustMap(state =>
        this.commonService
          .getManifestsByPackageType$(
            state.companyId!.toString(),
            1,
            1,
            this.isManifestConsolidatedType ? "Consolidado" : "Courier"
          )
          .pipe(
            map(response => response.data),
            catchError(() => of([]))
          )
      ),
      finalize(() => this.loading.hide())
    );

    this.packages$ = $selectedManifest.pipe(
      filter(state => state && state.id !== 0),
      exhaustMap(state =>
        this.packageService.getPackageDetailByManifestId(state.id).pipe(
          map(response => response.data),
          catchError(() => of([])),
          finalize(() => this.loading.hide())
        )
      )
    );

    const entity$ = this.route.queryParams.pipe(
      tap(() => this.loading.show()),
      switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(() => of({ ...newManifestModel }))
        ))
    );
    this.companies$ = this.commonService.getCompanies$();

    const merge$ = merge(entity$, this._entityState.asObservable());
    this.entity$ = combineLatest([merge$, this.companies$]).pipe(
      map(([entity]) => entity)
    );
  }

  onCompanyChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, companyId: id });
  }

  onManifestChange(manifest: any): void {
    debugger
    this.manifestId = manifest?.id;
    this.manifestNumber = manifest?.manifestNumber;
    this._entityState.next({ ...this._entityState.value, id: manifest?.id });
  }

  onFetchModalData(event: { manifestId: number; companyId: number, isPending: boolean }) {
    const { manifestId, companyId, isPending } = event;
    if (!(manifestId)) {
      return
    }
    if (!isPending) {
      this.packageService.getAirGuideListByManifestIdAndCompanyId(manifestId).subscribe(data => {
        console.log('Fetched data:', data);
        this.modalListDetail = data;
        {
          const modalRef = this.modalService.open(PackingPackagesPackagesListComponent, {
            size: 'xl',
            backdrop: 'static',
            keyboard: false,
          });
          modalRef.componentInstance.data = this.modalListDetail.data;
        };
      });
    }
    else {
      this.packageService.GetPackagedPackagesForAirGuides(null, manifestId, 0).subscribe(data => {
        console.log('Fetched data:', data);
        this.modalListDetail = data;
        {
          const modalRef = this.modalService.open(PackingPackagesPackagesListComponent, {
            size: 'xl',
            backdrop: 'static',
            keyboard: false,
          });

          modalRef.componentInstance.packagedPackagesForAirGuides = this.modalListDetail.data;
        };
      });
    }
  }

  handlePackageResponse(response: any): void {
    this.packageList = response;
  }

  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
  }

  onAirGuideChange(event: any) {
    this.airGuideId = event;
  }

  handleChildGuideId(event: any): void {
    this.airGuideId = event;
  }

  packPackage(event: any): void {
    if (this.airGuideId === '' || this.airGuideId === undefined) {
      Swal.fire("Warning","Please select child Guide.","warning");
      return;
    }
    this.packageService.PackPackage(event, this.airGuideId,
      this.palet, this.manifestNumber, 1, this.credentailsService.credentials?.user.name, this.packageType
    ).pipe(
      finalize(() => {
        this.changeDetect.detectChanges();
        this.loading.hide();
      })
    ).subscribe({
      next: (response) => {
        if (response.data === 0) {

          this.refreshPackages();
        } else {
          this.handleResponse(response.data);
        }
      },
      error: (err) => {
        Swal.fire("Error", "Error packing the package. Please try again.", "error")
      }
    });
  }

  handleSelectedCategory(event: any): void {
    this.selectedCategory = event;
  }

  handlePalletChange(event: any): void {
    this.palet = event;
  }

  handleClosePacking(isClosed: any) {
    console.log("isClosed", isClosed);

    if (isClosed) {
      this.closePackage = false;
      this.closePackage = true;
      this.packageList = [];
      this.isPackageList = false;
      this.airGuideId = '',
        this.manifestNumber = '';
    }
  }

  refreshPackages(): void {
    this.loading.show();
    this.packages$ = this.packageService.getPackageDetailByManifestId(this.manifestId).pipe(
      map(response => response.data),
      catchError(() => of([]))
    )
    if (this.packageType === "consolidated" && this.selectedCategory === undefined) {
      this.selectedCategory = "C";
    }
    this.packageService.GetPackedPackagesForAirGuides(this.selectedCategory, this.airGuideId, this.manifestId, 1, this.palet).subscribe({
      next: (response: any) => {
        if (response?.data) {

          this.packageList = response.data.packagedPackages || [];
          this.isPackageList = this.packageList.length > 0 ? true : false;

          this.changeDetect.detectChanges();
        }
      },
      error: () => {
        Swal.fire("Error", "Error loading the packages. Please try again.", "error")
        this.loading.hide();
      },
      complete: () => this.loading.hide(),
    });
    Swal.fire("Success", "Package packed successfully!", "success");
    this.changeDetect.detectChanges();
  }

  handlePackageList(event: any): void {
    debugger
    this.isPackageList = event;
  }

  handlePackagingStarted(event: any) {
    this.isPackagingStarted = event
    console.log(event)
  }

  handleResponse(response: any): void {
    if (response !== undefined && response !== null) {
      switch (response) {
        case -1:
          Swal.fire("Warning", "The package was not located.", "warning")
          break;
        case -2:
          Swal.fire("Warning", "The type of bag does not match the classified one!", "warning")
          break;
        case -3:
          Swal.fire("Warning", "The package is already packed!", "warning")
          break;
        case -4:
          Swal.fire("Warning", `The package belongs to another manifest: ${this.manifestId}, and to the guide: ${this.airGuideId}`, "warning")
          break;
        case -5:
          Swal.fire("Warning", "Package not manifested! Please check!", "warning")
          break;
        case -6:
          Swal.fire("Warning", "The package category does NOT match the bag category! Please check, as they must match!", "warning")
          break;
        default:
          Swal.fire("Warning", "An unknown error occurred. Please try again.", "warning")
      }
    }
  }
}