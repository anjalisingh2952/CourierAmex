import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonService, CredentialsService, LoadingService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CompanyModel } from '@app/features/company';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { AirGuideModel, defaultPagination, newAirGuideModel, PageOptionsDefault, PaginationModel } from '@app/models';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, forkJoin, map, merge, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { PackageCategoryModel } from '@app/features/package';
import { ActivatedRoute } from '@angular/router';
import { GuideFormComponent } from '../../components/air-classify/guide-form/guide-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManifestService } from '../../services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-air-classify',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './air-classify.component.html'
})
export class AirClassifyComponent {

  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  private readonly _guideState = new BehaviorSubject<AirGuideModel>({ ...newAirGuideModel, id: 0 });
  selectedCompany: CompanyModel | undefined = undefined;
  pagination: PaginationModel = defaultPagination;
  readonly companies$: Observable<CompanyModel[]>;
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  packagesAssigned$: Observable<PackageCategoryModel[]>;
  packagesUnAssigned$: Observable<PackageCategoryModel[]>;
  readonly airGuides$: Observable<AirGuideModel[]>;

  isLoading: boolean = false;
  guideCode: string;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  isPackageAssigned: boolean
  rows: any[] = [];
  protected filteredPackagesList: any = [];
  protected filteredPackagesListToRemove: any = [];

  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  private destoy$ = new Subject<void>();

  constructor(
    private commonService: CommonService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private manifestService: ManifestService,
    private credentialsService: CredentialsService,
    private cdr: ChangeDetectorRef
  ) {

    const $selectedCompany = this._entityState.pipe(
      map((state: ManifestModel) => ({ companyId: state.companyId }))
    );

    const $selectedManifest = this._entityState.pipe(
      map((state: ManifestModel) => ({ id: state.id, companyId: state.companyId }))
    );

    const $selectedAirGuide = this._entityState.pipe(
      map((state: ManifestModel) => ({ id: state.id, guideNumber: state.shippingWayName, companyId: state.companyId }))
    );

    this.manifests$ = $selectedCompany.pipe(
      filter(state => state?.companyId !== 0),
      exhaustMap(state => this.commonService.getManifests$(this.pagination, state.companyId ?? -1, false, -1) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loadingService.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.airGuides$ = $selectedManifest.pipe(
      filter(state => state?.id !== 0),
      exhaustMap(state => this.commonService.getAirGuidesByManifest$(state.companyId ?? -1, state.id) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loadingService.hide()),
          map(xx => xx),
          catchError(_ => of([])))
      ));

    this.packagesAssigned$ = $selectedAirGuide.pipe(
      filter(state => state?.guideNumber !== '0'),
      exhaustMap(state => this.commonService.getPackagesByAirGuideManifestId$(state.companyId ?? -1, state.id, state.guideNumber) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loadingService.hide()),
          map(xx => xx),
          catchError(_ => of([])))
      ));

    this.packagesAssigned$.pipe(
      map(packages => packages.length > 0)
    ).subscribe(isAssigned => {
      this.isPackageAssigned = isAssigned;
    });


    this.packagesUnAssigned$ = $selectedManifest.pipe(
      filter(state => state?.id !== 0),
      exhaustMap(state => this.commonService.getPackagesByAirGuideManifestId$(state.companyId ?? -1, state.id, '0') //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loadingService.hide()),
          map(xx => xx),
          catchError(_ => of([])))
      ));

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loadingService.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loadingService.hide()),
            catchError(_ => of({ ...newManifestModel })))
        ),
      );

    this.companies$ = this.commonService.getCompanies$();

    const merge$ = merge(entity$, this._entityState.asObservable());
    this.entity$ = combineLatest([merge$, this.companies$])
      .pipe(
        map(([entity]) => {
          return { ...entity };
        })
      );
  }

  ngOnInit(): void {
  }

  onCompanyChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, companyId: id });
  }

  onManifestChange(id: number): void {
    this._entityState.next({ ...this._entityState.value, shippingWayName: '', id: id });
  }

  onAirGuideChange(guide: string): void {
    const [guideNumber, guideCode] = guide.split('|');
    this.guideCode = guideNumber;
    console.log(guide);
    this._entityState.next({ ...this._entityState.value, shippingWayName: guideCode });
  }

  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
  }

  onFormSubmit(event: any) {
    console.log(event);
  }

  onPackageAssign(event: any) {
    this.filteredPackagesList = event;
    console.log(event);
  }

  onPackageRemove(event: any) {
    this.filteredPackagesListToRemove = event;
    console.log(event);
  }

  packagesRemoveFromGuide() {
    if (this.filteredPackagesListToRemove.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Operation',
        text: 'Please select a package from the list.',
      });
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove packages from this guide?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeManifestPackageToGuide();
      }
    });
  }

  assignManifestPackageToGuide() {
    this.loadingService.show();
    const masterId = this._entityState.value.id;
    const userId = this.credentialsService.credentials?.user.id ?? '';
    const packageIds = this.filteredPackagesList.map((pkg: any) => pkg.number);
    const guide = this._entityState.value.shippingWayName ?? '';
    this.manifestService.AssignManifestPackageToGuide(packageIds, masterId, guide, userId)
      .subscribe({
        next: (response) => {
          this.fetchValues()

          Swal.fire({
            icon: 'success',
            title: 'Assigned!',
            text: 'Packages have been successfully assigned.',
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to assign packages. Please try again.',
          });
          console.error("Error assigning packages:", err);
        }
      });
  }

  packagesAssignToGuide() {
    if (this.filteredPackagesList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Operation',
        text: 'Please select a package from the list.',
      });
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to assign the selected packages?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, assign',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assignManifestPackageToGuide();
      }
    });
  }

  removeManifestPackageToGuide() {
    this.loadingService.show();
    const masterId = this._entityState.value.id;
    const userId = this.credentialsService.credentials?.user.id ?? '';
    const packageIds = this.filteredPackagesListToRemove.map((pkg: any) => pkg.number);

    this.manifestService.AssignManifestPackageToGuide(packageIds, masterId, '0', userId)
      .subscribe({
        next: (response) => {
          this.fetchValues()
          Swal.fire({
            icon: 'success',
            title: 'Assigned!',
            text: 'Packages have been successfully removed.',
          });
        },
        error: (err) => {
          this.loadingService.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to assign packages. Please try again.',
          });
          console.error("Error assigning packages:", err);
        }
      });
  }

  onDeleteButtonClick(event: any) {
    if (event) {
      const shippingWayName = Number(this.guideCode);
      const masterId = this._entityState.value.id;
      const userId = this.credentialsService.credentials?.user.id ?? '';
      this.manifestService.DeleteAirGuide(shippingWayName, masterId, userId).subscribe({
        next: (response) => {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Master guide has been deleted successfully."
          });
          console.log("Fetched master guide:", response);
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to delete master guide. Please try again."
          });
          console.error("Error fetching master guide:", err);
        }
      });
    }
  }

  onModelClick(event: any) {
    if (event == "MasterGuide") {
      this.openGuideModal(event)
    }

    if (event == "ChildGuide") {
      this.openGuideModal(event)
    }

    if (event == "ModifyChildGuide") {
      this.openGuideModal(event)
    }
  }

  openGuideModal(guideType: any) {
    if (this._entityState.value.id == 0 || this._entityState.value.id == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Manifest',
        text: 'Please select manifest.',
      });
      return;
    }

    let dataPromise = guideType === "ModifyChildGuide" ? this.getChildGuide() : this.getMasterGuide();

    dataPromise.then((guideData) => {
      const modalRef = this.modalService.open(GuideFormComponent, {
        size: 'xl',
        backdrop: 'static',
        keyboard: false,
      });

      modalRef.componentInstance.guideType = guideType;
      modalRef.componentInstance.data = guideData;
      modalRef.componentInstance.manifestId = this._entityState.value.id;

      modalRef.componentInstance.onFormSubmit.subscribe((formData: any) => {
        this.submitToBackend(formData, guideType);
      });
    });
  }

  getMasterGuide(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.manifestService.GetMasterGuide(this._entityState.value.id).subscribe({
        next: (response) => {
          console.log('Fetched master guide:', response);
          resolve(response);
        },
        error: (err) => {
          console.error('Error fetching master guide:', err);
          reject(err);
        }
      });
    });
  }

  getChildGuide(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.manifestService.GetGuideDetailById(this.guideCode).subscribe({
        next: (response) => {
          console.log('Fetched master guide:', response);
          resolve(response);
        },
        error: (err) => {
          console.error('Error fetching master guide:', err);
          reject(err);
        }
      });
    });
  }

  fetchValues() {
    const companyId = this._entityState?.value?.companyId ?? -1;
    const manifestId = this._entityState?.value?.id ?? -1;
    const guide = this._entityState?.value?.shippingWayName ?? '';
    this._entityState.next({ ...this._entityState.value, shippingWayName: guide, id: manifestId });
    this.loadingService.hide();
    this.cdr.detectChanges();
  }


  submitToBackend(formData: any, guideType: any) {
    formData.manifestId = this._entityState.value.id;
    if (guideType === "MasterGuide") {
      this.manifestService.CreateOrUpdateMasterGuide(formData).subscribe({
        next: response => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Form submitted successfully.',
            confirmButtonColor: '#3085d6'
          });
          console.log('Form submitted successfully:', response);
        },
        error: error => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something went wrong. Please try again.',
            confirmButtonColor: '#d33'
          });
          console.error('Error:', error);
        }
      });
    }
    else {
      var childGuide = {
        ChildGuideId: Number(formData.childGuideId),
        ParentGuideId: this._entityState.value.id,
        Name: formData.customerName || "",
        Consignee: formData.customerNumber || "",
        Contact: formData.contact || "",
        IdentificationType: formData.identificationType ? String(formData.identificationType) : "",
        Identification: formData.identification || "",
        Status: formData.status || "",
        User: formData.userId || "",
        Type: formData.type,
        Consecutive: formData.consecutive !== undefined && formData.consecutive !== null ? Number(formData.consecutive) : null,
        ChildGuideCode: formData.childId || ""
      }

      this.manifestService.CreateOrUpdateChildGuide(childGuide).subscribe
        ({
          next: response => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: Number(formData.childGuideId)? 'Child guide updated!':'Child guide created!',
            });
            this._entityState.next({ ...this._entityState.value, id: childGuide.ParentGuideId });
            formData.childGuideId = response;
            console.log('Success:', response);
          },
          error: error => {
            let errorMessage = "Failed to create/update child guide.";
            if (error?.error?.errors) {
              const errorList = Object.values(error.error.errors).flat().join("\n");
              errorMessage = `Validation Errors:\n${errorList}`;
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
            });
            console.error('Error:', error);
          }
        });
    }
  }
}