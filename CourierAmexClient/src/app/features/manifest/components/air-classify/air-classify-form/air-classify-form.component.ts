import { ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CredentialsService, LoadingService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { PackageCategoryModel } from '@app/features/package';
import { AirGuideModel, ManifestModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { GuideFormComponent } from '../guide-form/guide-form.component';
import { ManifestService } from '@app/features/manifest/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-air-classify-form',
  templateUrl: './air-classify-form.component.html',
  inputs: ['entity', 'manifests', 'companies', 'airGuides', 'isPackageAssigned'],
  outputs: ['onCompanyChange', 'onManifestChange', 'onStateChange', 'onAirGuideChange', 'onModelClick', 'onDeleteButtonClick'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirClassifyFormComponent {

  entity!: ManifestModel;
  companies!: CompanyModel[];
  manifests!: ManifestModel[];
  airGuides!: AirGuideModel[];
  isPackageAssigned: boolean;

  isLoading: boolean = false;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  selectedManifestId: number
  childGuide: any;

  onCompanyChange = new EventEmitter<number>();
  onManifestChange = new EventEmitter<number>();
  onStateChange = new EventEmitter<number>();
  onAirGuideChange = new EventEmitter<string>();
  onModelClick = new EventEmitter<string>();
  onDeleteButtonClick = new EventEmitter<boolean>();

  private destoy$ = new Subject<void>();

  constructor(
    private loadingService: LoadingService,
    private credentailsService: CredentialsService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.AirClassify, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.AirClassify, PermissionActionEnum.Update);

    this.loadingService.isLoading$
      .pipe(takeUntil(this.destoy$))
      .subscribe(val => this.isLoading = val);
  }

  ngOnInit(): void {
    this.setDefaultCompany();
  }

  handleSubmit(form: NgForm): void {
  }

  companyChange(companyId: any | undefined): void {
    this.onCompanyChange.emit(companyId);
  }

  manifestChange(manifestId: number): void {
    this.selectedManifestId = manifestId
    this.onManifestChange.emit(manifestId);
  }

  airGuideChange(guideNumber: string): void {
    this.childGuide = guideNumber;
    const selectedGuide = this.airGuides.find(p => p.id == Number(guideNumber));
    if (selectedGuide) {
      this.onAirGuideChange.emit(`${guideNumber}|${selectedGuide.guide}`);
    }
  }

  deleteChildGuide() {
    if (this.isPackageAssigned) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Cannot delete guide, package is assigned to it"
      });
      return;
    }

    if (!this.childGuide) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a child guide."
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this guide?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.airGuides = this.airGuides.filter(guide => guide.id !== this.childGuide);
        this.onDeleteButtonClick.emit(true);
      }
    });
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser() && this.companies.length > 0) {
      const userCia = this.companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
      if (userCia) {
        this.companyChange(userCia.id);
      }
    }
  }

  openMasterGuideModal() {
    this.onModelClick.emit("MasterGuide");
  }

  openChildGuideModal() {
    this.onModelClick.emit("ChildGuide");
  }

  modifyChildModel() {
    if (!this.childGuide) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a child guide."
      });
      return;
    }
    this.onModelClick.emit("ModifyChildGuide");
  }
}