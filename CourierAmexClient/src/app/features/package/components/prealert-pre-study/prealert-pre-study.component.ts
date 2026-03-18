import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
//import { BehaviorSubject, forkJoin, lastValueFrom, finalize,Observable } from 'rxjs';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap } from 'rxjs';

import { newPackageItemModel, newPackageModel, PackageModel, PackagePriceUpdate } from '@app/features/package/models/package.model';
import { PackageItem_PreviousReport, PackageItemModel } from '@app/features/package/models/package-item.model';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { PackageService, PackageItemService } from '../../services';
import Swal from 'sweetalert2';
import { PackageStatusModel } from '@app/features/general';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PackagePrestudyAdditemComponent } from '../../components/package-prestudy-additem/package-prestudy-additem.component';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { PackageCategoryModel, PackageItemDetail } from '@app/features/package/models';
import { ManifestService } from '@app/features/manifest/services/manifest.service';
import { ManifestPreAlert } from '../../models/PreStudy-PreAlert.model';
@Component({
  selector: 'app-prealert-pre-study',
  templateUrl: './prealert-pre-study.component.html',
})
export class PrealertPreStudyComponent {
  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  readonly packages$: Observable<PackageCategoryModel[]>;
  pagination: PaginationModel = defaultPagination;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  private readonly _entities = new BehaviorSubject<ManifestPreAlert[]>([]);
  entities$ = this._entities.asObservable();

  companyId = 0;
  manifestId: string = ""
  closedPackageList: ManifestPreAlert[] = [];
  manifestNumber: string;
  packageNumber: string="";

  columns: ColDef[] = [];
  columnsReport: ColDef[] = [];
  isDownload: boolean = false;

  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations ={
    gateway: '',
    account: '',
    aipe: '',
    crtrack: '',
    courierCode: '',
    description: '',
    shipper: '',
    consignee: '',
    company: '',
    identification: '',
    typeId: '',
    value: '',
    weight: '',
    invoice: '',
    xtn: '',
    address: '',
    city: '',
    country: '',
    telephone: '',
    exonerate: '',
  }
  constructor(
    private modalService: NgbModal,
    private NgbNavModule: NgbNavModule,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private packageItemService: PackageItemService,
    private messages: MessageService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private manifestService: ManifestService
  ){
    
    this.translate.get([
      'Labels.gateway',
      'Labels.account',
      'Labels.aipe',
      'Labels.crtrack',
      'Labels.courierCode',
      'Labels.description',
      'Labels.shipper',
      'Labels.consignee',
      'Labels.company',
      'Labels.identification',
      'Labels.typeId',
      'Labels.value',
      'Labels.weight',
      'Labels.invoice',
      'Labels.xtn',
      'Labels.address',
      'Labels.city',
      'Labels.country',
      'Labels.telephone',
      'Labels.exonerate:',
    ])
      .subscribe(
        translations => {
          this.translations.gateway = translations['Labels.gateway'];
          this.translations.account = translations['Labels.account'];
          this.translations.aipe = translations['Labels.aipe'];
          this.translations.crtrack = translations['Labels.crtrack'];
          this.translations.courierCode = translations['Labels.courierCode'];
          this.translations.description = translations['Labels.description'];
          this.translations.shipper = translations['Labels.shipper'];
          this.translations.consignee = translations['Labels.consignee'];
          this.translations.company = translations['Labels.company'];
          this.translations.identification = translations['Labels.identification'];
          this.translations.typeId = translations['Labels.typeId'];
          this.translations.value = translations['Labels.value'];
          this.translations.weight = translations['Labels.weight'];
          this.translations.invoice = translations['Labels.invoice'];
          this.translations.xtn = translations['Labels.xtn'];
          this.translations.address = translations['Labels.address'];
          this.translations.city = translations['Labels.city'];
          this.translations.country = translations['Labels.country'];
          this.translations.telephone = translations['Labels.telephone'];
          this.translations.exonerate = translations['Labels.exonerate'];
          this.translations.invoice = translations['Labels.invoice'];

        });
    const $selectedCompany = this._entityState.pipe(
      map((state: ManifestModel) => ({ companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId)
    );

    const $selectedManifest = this._entityState.pipe(
      map((state: ManifestModel) => ({ id: state.id, companyId: state.companyId })),
      distinctUntilChanged((prev, curr) => prev.id === curr.id)
    );

    this.manifests$ = $selectedCompany.pipe(
      distinctUntilChanged((prev, curr) => prev.companyId === curr.companyId),
      filter(state => state?.companyId !== 0),
      exhaustMap(state => this.commonService.getManifests$(this.pagination, state.companyId ?? -1, true, -1) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    this.packages$ = $selectedManifest.pipe(
      distinctUntilChanged((prev, curr) => prev.id === curr.id),
      filter(state => state?.id !== 0),
      exhaustMap(state => this.packageService.getPagedPriceByManifest$({ ...defaultPagination, ps: 5000 }, state.companyId ?? -1, state.id) //this.commonService.getManifests$(this.pagination, state.companyId ?? -1, false) //this.commonService.getCommodities$(state.companyId ?? 0)
        .pipe(
          finalize(() =>
            this.loading.hide()),
          map(xx => xx.data),
          catchError(_ => of([])))
      ));

    const entity$ = this.route.queryParams
      .pipe(
        tap(_ => this.loading.show()),
        switchMap(state => this.createOrUpdateEntity(state['id'] || 0)
          .pipe(
            finalize(() => this.loading.hide()),
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
  

  ngAfterViewInit(): void {

    this.columns.push({ field: 'gateway', label: this.translations.gateway, sortable: true });
    this.columns.push({ field: 'account', label: this.translations.account, sortable: true });
    this.columns.push({ field: 'aipe', label: this.translations.aipe, sortable: true });
    this.columns.push({ field: 'crtrack', label: this.translations.crtrack, sortable: true });
    this.columns.push({ field: 'courierCode', label: this.translations.courierCode, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'shipper', label: this.translations.shipper });
    this.columns.push({ field: 'consignee', label: this.translations.consignee });
    this.columns.push({ field: 'company', label: this.translations.company });
    this.columns.push({ field: 'identification', label: this.translations.identification });
    this.columns.push({ field: 'typeId', label: this.translations.typeId });
    this.columns.push({ field: 'value', label: this.translations.value });
    this.columns.push({ field: 'weight', label: this.translations.weight });
    this.columns.push({ field: 'invoice', label: this.translations.invoice });
    this.columns.push({ field: 'xtn', label: this.translations.xtn });
    this.columns.push({ field: 'address', label: this.translations.address });
    this.columns.push({ field: 'city', label: this.translations.city });
    this.columns.push({ field: 'country', label: this.translations.country });
    this.columns.push({ field: 'telephone', label: this.translations.telephone });
    this.columns.push({ field: 'exonerate', label: this.translations.exonerate });

    this.changeDetectorRef.detectChanges();



  }
  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
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
    //this.performSearch();
  }
  onCompanyChange(id: number): void {
    // debugger
    this.companyId = id;

    console.log("this.onCompanyChange=========<<<", this.companyId);

    this._entityState.next({ ...this._entityState.value, companyId: id });
  }
  onManifestChange(id: any): void {
    this.manifestId = id
    this._entityState.next({ ...this._entityState.value, id });

  }
  getPackageItems(): void {
    // debugger
    this.packageNumber = '';
    //console.log("packageNumber==", this.packageNumber, "manifestId", this.manifestId, "actionType", this.actionType);
    this.loading.show();
    this._entities.next([]);
    this.manifestService.GetManifestPreAlert(this.manifestId, this.companyId ?? -1).subscribe(res => {
      res.data;
      this.loading.hide();
      console.log("this.onManifestChange=========<<<", res.data);
      this.closedPackageList = res.data;
      this._entities.next(res.data);
    });
  }

  exportToExcel(): void {
    console.log("exportToExcel=========<<<");
    this.loading.show();
    this.manifestService.GetExcel_ManifestPreAlert(this.manifestId, this.companyId ?? -1).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'PreAlert_PreStudy.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    });
  }
}
