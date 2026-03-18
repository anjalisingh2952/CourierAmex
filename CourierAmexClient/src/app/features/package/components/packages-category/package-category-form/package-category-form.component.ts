import { AfterViewChecked, ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CredentialsService, LoadingService } from '@app/@core';
import { CompanyModel } from '@app/features';
import { SearchCustomerComponent } from '@app/@shared';
import { Subject, takeUntil } from 'rxjs';
import { TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { ManifestModel } from '@app/models/manifest.model';

@Component({
  selector: 'app-package-category-form',
  templateUrl: './package-category-form.component.html',
  inputs: ['entity', 'manifests', 'companies'],
  outputs: ['onCompanyChange', 'onManifestChange', 'onStateChange'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PackageCategoryFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('form', { read: NgForm }) form!: NgForm;
  @ViewChild(SearchCustomerComponent) searchCustomer!: SearchCustomerComponent;

  entity!: ManifestModel;
  companies!: CompanyModel[];
  manifests!: ManifestModel[];

  pagination: PaginationModel = defaultPagination;

  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'ASC',
  };

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
  onStateChange = new EventEmitter<number>();

  private destoy$ = new Subject<void>();

  constructor(
    private loadingService: LoadingService,
    private credentailsService: CredentialsService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);
    console.log(this.entity);

    this.loadingService.isLoading$
      .pipe(takeUntil(this.destoy$))
      .subscribe(val => this.isLoading = val);
  }

  ngOnInit(): void {
    this.setDefaultCompany();
  }

  ngAfterViewChecked(): void {
  }

  ngOnDestroy(): void {
    this.destoy$.next();
    this.destoy$.complete();
  }


  handleSubmit(form: NgForm): void {
  }

  companyChange(companyId: any | undefined): void {
    this.onCompanyChange.emit(companyId);
  }

  manifestChange(manifestId: number): void {
    this.onManifestChange.emit(manifestId);
  }

  stateChange(manifestId: number): void {
    this.onStateChange.emit(manifestId);
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser() && this.companies.length > 0) {
      const userCia = this.companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);
      if (userCia) {
        this.companyChange(userCia.id);
      }
    }
  }
}
