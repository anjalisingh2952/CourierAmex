import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BehaviorSubject, lastValueFrom, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap } from 'rxjs';

import { PackageCategoryModel, PackageItemDetail, PackageModel } from '@app/features/package/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { GenericResponse, PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { PackageService } from '../../services';
import Swal from 'sweetalert2';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { PackageStatusModel, ShippingWayTypeModel } from '@app/features/general';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assign-prices',
  templateUrl: './assign-prices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignPricesComponent {

  @ViewChild("priceCellTemplate") priceCellTemplate!: TemplateRef<any>;
  @ViewChild("descriptionCellTemplate") descriptionCellTemplate!: TemplateRef<any>;

  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  pagination: PaginationModel = defaultPagination;
  readonly companies$: Observable<CompanyModel[]>;
  readonly courierName$: Observable<string>;
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  readonly packages$: Observable<PackageCategoryModel[]>;
  readonly packagesMain$: Observable<PackageCategoryModel[]>;
  readonly packagesSearch$: Observable<PackageCategoryModel[]>;


  selectedCompany: CompanyModel | undefined = undefined;
  selectedManifest: ManifestModel | undefined = undefined
  selectedStatus: PackageStatusModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);

  private readonly _packageStatus = new BehaviorSubject<PackageStatusModel[]>([]);
  packageStatus$ = this._packageStatus.asObservable();

  private readonly _entities = new BehaviorSubject<PackageModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _manifiests = new BehaviorSubject<ManifestModel[]>([]);
  manifiests$ = this._manifiests.asObservable();

  private readonly _shippingWays = new BehaviorSubject<ShippingWayTypeModel[]>([]);
  shippingWays$ = this._shippingWays.asObservable();

  description: string = ""
  price: number = 0.00
  companyId = 0;

  manifestId: string = ""
  hasAdd: boolean = false;
  //activeSearch: boolean=false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  packageList: PackageItemDetail[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    number: '',
    customerCode: '',
    customerName: '',
    origin: '',
    trackingNumber: '',
    description: '',
    weight: '',
    volumetricWeight: '',
    price: '',
    Kgs: '',
    Lbs: '',
    ClassifyMsg1: '',
    ClassifyMsg2: '',
    ClassifyMsg3: '',
    ClassifyMsg4: '',
    isEdit: false
  };

  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private messages: MessageService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService


  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Delete);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'Labels.Number',
      'PackageClassify.CustomerCode',
      'PackageClassify.CustomerName',
      'Labels.Origin',
      'Labels.TrackingNumber',
      'Labels.Description',
      'PackageClassify.Weight',
      'PackageClassify.VolumetricWeight',
      'Labels.Price',
      'Labels.Kgs',
      'Labels.Lbs',
      'Labels.ClassifyMsg1',
      'Labels.ClassifyMsg2',
      'Labels.ClassifyMsg3',
      'Labels.ClassifyMsg4',

    ])
      .subscribe(
        translations => {
          this.translations.number = translations['Labels.Number'];
          this.translations.customerCode = translations['PackageClassify.CustomerCode'];
          this.translations.customerName = translations['PackageClassify.CustomerName'];
          this.translations.origin = translations['Labels.Origin'];
          this.translations.trackingNumber = translations['Labels.TrackingNumber'];
          this.translations.description = translations['Labels.Description'];
          this.translations.weight = translations['PackageClassify.Weight'];
          this.translations.volumetricWeight = translations['PackageClassify.VolumetricWeight'];
          this.translations.price = translations['Labels.Price'];
          this.translations.Kgs = translations['Labels.Kgs'];
          this.translations.Lbs = translations['Labels.Lbs'];
          this.translations.ClassifyMsg1 = translations['Labels.ClassifyMsg1'];
          this.translations.ClassifyMsg2 = translations['Labels.ClassifyMsg2'];
          this.translations.ClassifyMsg3 = translations['Labels.ClassifyMsg3'];
          this.translations.ClassifyMsg4 = translations['Labels.ClassifyMsg4'];

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
      exhaustMap(state => this.commonService.getManifests$(this.pagination, state.companyId ?? -1, false, -1) //this.commonService.getCommodities$(state.companyId ?? 0)
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
    this.columns.push({ field: 'number', label: this.translations.number, sortable: true });
    this.columns.push({ field: 'customerCode', label: this.translations.customerCode, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'trackingNumber', label: this.translations.trackingNumber, sortable: true });
    this.columns.push({ field: 'weight', label: this.translations.weight, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'volumetricWeight', label: this.translations.volumetricWeight, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'description', label: this.translations.description, contentTemplate: this.descriptionCellTemplate });
    this.columns.push({ field: 'price', label: this.translations.price, contentTemplate: this.priceCellTemplate });

    this.changeDetectorRef.detectChanges();
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
    // debugger
    this.manifestId = id
    this.loading.show();
    this.packageService.getPagedPriceByManifest$({ ...defaultPagination, ps: 5000 }, this.companyId ?? -1, id).subscribe(res => {
      res.data
      this.loading.hide();
      this.packageList = res.data;
      console.log("this.onManifestChange=========<<<", id);

    })

    this._entityState.next({ ...this._entityState.value, id });
  }


  protected descriptionChange(row: any, value: number) {
    row.description = +value;
  }
  protected manifestChange(row: any, value: number) {
    row.manifestId = +value;
  }

  save(entity: PackageCategoryModel[]): void {

    // Se crea una clase en vuelo ya que solo se utiliza en esa sección.
    const bulkRequest = {
      companyId: entity[0].companyId,
      category: entity[0].category,
      numbers: entity.map(entity => entity.number)
    }

    this.loading.show();

    const observer = {
      next: (res: GenericResponse<PackageCategoryModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');

          const id = this._entityState.value.id;

          this._entityState.next({ ...this._entityState.value, id: 0 });
          this._entityState.next({ ...this._entityState.value, id: id });

        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    this.packageService.CategoryUpdate$(bulkRequest)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe(observer);

  }
  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
  }

  protected typeChange(row: any, value: number) {
    row.issueTypeId = +value;
  }

  private performSearch(): void {
    // debugger
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);

    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : this.companyId;
    const statusId = this.selectedStatus !== undefined ? this.selectedStatus.id : 0;
    const company = this._companies.value.find(v => v.id === companyId);
    const manifestID = this.selectedManifest !== undefined ? this.selectedManifest.id : parseInt(this.manifestId);
    this.packageService.getPagedPriceByManifest$({ ...defaultPagination, ps: 5000 }, this.companyId ?? -1, manifestID).subscribe(res => {
      res.data
      this.loading.hide();
      this.packageList = res.data;
      //console.log("this.onManifestChange==", res);
      this._entities.next(res.data);
      this.pagination.ti = res?.totalRows;
    })
  }

  protected async saveChanges() {
    const values = this.editedRows;
    const sources = [];
    for (let index = 0; index < values.length; index++) {
      const record: any = values[index];
      console.log("saveChanges==", record);
      debugger;
      if ((record['priceLabel'] >= 0 || record['descriptionLabel'] !== '') && record['id'] !== 0) {
        sources.push({
          PackageNumber: (record['id']),
          Price: record['priceLabel'],
          Description: record['descriptionLabel'] ?? ''
        });
      }
    }
    console.log("saveChanges==sources==", sources);

    if (sources.length > 0) {
      // debugger

      const assetTypes$ = this.packageService.PackagePriceUpdate$(sources);

      const response = await lastValueFrom(assetTypes$);
      // debugger
      //const manifestID = this.selectedManifest !== undefined ? this.selectedManifest.id : parseInt(this.manifestId);
      //console.log("manifestID=>",manifestID)
      Swal.fire("Success","Changes cnacelled successfully","success");
      this.editedRows = []
      this.performSearch();

    } else {
      alert('Please select all options to continue');
    }
  }
  protected async cancelChanges() {
    this.editedRows = []
    this.packageList = this.packageList?.map(val => ({
      ...val,
      isEdit: false,
      descriptionLabel: '',
      priceLabel: ''
    }));
    Swal.fire("Success","Changes cnacelled successfully","success");

  }
  private _editingRow: any = undefined;

  // Declare an array to hold updated rows
  editedRows: { id: string, descriptionLabel?: string, priceLabel?: number }[] = [];

  protected enterEditMode(entity: PackageItemDetail, field: string): void {
    this.packageList = this.packageList?.map(val => ({
      ...val,
      isEdit: val.id === entity.id && field === 'description' ? !val.isEdit : val.id === entity.id && field === 'price' ? !val.isEdit : val.isEdit,
    }));

    // Find the specific entity that needs editing
    const transient = this.packageList?.find(e => e.id === entity.id);
    if (entity.id > 0 && transient) {
      this._editingRow = transient;
    }
  }

  protected descriptionRowChange(row: PackageItemDetail, event: any): void {
    // debugger
    const existingRow = this.editedRows.find(r => parseInt(r.id) === row.number);
    if (existingRow) {
      existingRow.descriptionLabel = event;
    } else {
      this.editedRows.push({ id: row.number.toString(), priceLabel: row.price, descriptionLabel: event });
    }
    console.log(this.editedRows);

  }

  protected priceChange(row: PackageItemDetail, event: any): void {
    // debugger
    // Push the updated row into the array with price change
    const existingRow = this.editedRows.find(r => parseInt(r.id) === row.number);
    if (existingRow) {
      // Update existing row if it's already in the array
      existingRow.priceLabel = event;
    } else {
      // Add new row to the array if it's not present yet
      this.editedRows.push({ id: row.number.toString(), priceLabel: event, descriptionLabel: row.description });
    }
  }
}