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

@Component({
  selector: 'app-modify-pre-study',
  templateUrl: './modify-pre-study.component.html'
})
export class ModifyPreStudyComponent {


  @ViewChild("quantityCellTemplate") quantityCellTemplate!: TemplateRef<any>;
  @ViewChild("unitCostCellTemplate") unitCostCellTemplate!: TemplateRef<any>;
  @ViewChild("characteristicsCellTemplate") characteristicsCellTemplate!: TemplateRef<any>;
  @ViewChild("descriptionCellTemplate") descriptionCellTemplate!: TemplateRef<any>;

  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  readonly packages$: Observable<PackageCategoryModel[]>;
  pagination: PaginationModel = defaultPagination;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  private readonly _entities = new BehaviorSubject<PackageItem_PreviousReport[]>([]);
  entities$ = this._entities.asObservable();

  companyId = 0;
  manifestId: string = ""
  closedPackageList: PackageItem_PreviousReport[] = [];
  manifestNumber: string;
  packageNumber: string = "";
  actionType: string = "modification";
  columns: ColDef[] = [];
  columnsReport: ColDef[] = [];
  isDownload: boolean = false;

  selectedPackageItem: any = null;

  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    fullName: '',
    packageNumber: '',
    origin: '',
    quantity: '',
    unitCost: '',
    description: '',
    characteristics: '',
    brand: '',
    model: '',
    totalPrice: '',
    packageDescription: '',
    packagePrice: '',
    bag: '',
    color: '',
    id: 0,
    serialNumber: '',
    composition: '',
    status: '',
    style: '',
    size: '',
    itemNumber: '',
    invoice: '',
    source: '',
    invoiceDate: '',
    isEdit: false
  };
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
    private toastr: ToastrService

  ) {

    this.translate.get([
      'Labels.CustomerName',
      'Labels.Number',
      'Labels.Origin',
      'PackagePreStudy.quantity',
      'PackagePreStudy.unitCost',
      'Labels.Description',
      'PackagePreStudy.characteristics',
      'DocumentPayTypeDetails.Brand',
      'Labels.Model',
      'Labels.Price',
      'Labels.packageDescription',
      'Labels.PackagePrice',
      'Labels.Bag',
      'Labels.color',
      'Labels.serialNumber',
      'Labels.composition',
      'Labels.status',
      'Labels.style',
      'Labels.size',
      'Labels.itemNumber',
      'Labels.invoice',
      'Labels.source',
      'Labels.invoiceDate',
    ])
      .subscribe(
        translations => {
          this.translations.fullName = translations['Labels.CustomerName'];
          this.translations.packageNumber = translations['Labels.Number'];
          this.translations.origin = translations['Labels.Origin'];
          this.translations.quantity = translations['PackagePreStudy.quantity'];
          this.translations.unitCost = translations['PackagePreStudy.unitCost'];
          this.translations.description = translations['Labels.Description'];
          this.translations.characteristics = translations['PackagePreStudy.characteristics'];
          this.translations.brand = translations['DocumentPayTypeDetails.Brand'];
          this.translations.model = translations['Labels.Model'];
          this.translations.totalPrice = translations['Labels.Price'];
          this.translations.packageDescription = translations['Labels.packageDescription'];
          this.translations.packagePrice = translations['Labels.PackagePrice'];
          this.translations.bag = translations['Labels.Bag'];
          this.translations.color = translations['Labels.color'];
          this.translations.serialNumber = translations['Labels.serialNumber'];
          this.translations.composition = translations['Labels.composition'];
          this.translations.status = translations['Labels.status'];
          this.translations.style = translations['Labels.style'];
          this.translations.size = translations['Labels.size'];
          this.translations.itemNumber = translations['Labels.itemNumber'];
          this.translations.invoice = translations['Labels.invoice'];
          this.translations.source = translations['Labels.source'];
          this.translations.invoiceDate = translations['Labels.invoiceDate'];

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

  private createOrUpdateEntity(id: number): Observable<ManifestModel> {
    return of({ ...newManifestModel, companyId: 0 });
  }


  ngAfterViewInit(): void {
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'packageNumber', label: this.translations.packageNumber, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'quantity', label: this.translations.quantity, sortable: true, contentTemplate: this.quantityCellTemplate });
    this.columns.push({ field: 'unitCost', label: this.translations.unitCost, sortable: true, contentTemplate: this.unitCostCellTemplate });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true, cssClass: 'text-end', contentTemplate: this.descriptionCellTemplate });
    this.columns.push({ field: 'characteristics', label: this.translations.characteristics, sortable: true, cssClass: 'text-end', contentTemplate: this.characteristicsCellTemplate });
    this.columns.push({ field: 'brand', label: this.translations.brand });
    this.columns.push({ field: 'model', label: this.translations.model });
    this.columns.push({ field: 'totalPrice', label: this.translations.totalPrice });
    this.columns.push({ field: 'packageDescription', label: this.translations.packageDescription });
    this.columns.push({ field: 'packagePrice', label: this.translations.packagePrice });
    this.columns.push({ field: 'bag', label: this.translations.bag });

    this.columnsReport.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columnsReport.push({ field: 'packageNumber', label: this.translations.packageNumber, sortable: true });
    this.columnsReport.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columnsReport.push({ field: 'quantity', label: this.translations.quantity, sortable: true });
    this.columnsReport.push({ field: 'unitCost', label: this.translations.unitCost, sortable: true });
    this.columnsReport.push({ field: 'description', label: this.translations.description, sortable: true, cssClass: 'text-end' });
    this.columnsReport.push({ field: 'characteristics', label: this.translations.characteristics, sortable: true, cssClass: 'text-end' });
    this.columnsReport.push({ field: 'brand', label: this.translations.brand });
    this.columnsReport.push({ field: 'model', label: this.translations.model });
    this.columnsReport.push({ field: 'totalPrice', label: this.translations.totalPrice });
    this.columnsReport.push({ field: 'packageDescription', label: this.translations.packageDescription });
    this.columnsReport.push({ field: 'packagePrice', label: this.translations.packagePrice });
    this.columnsReport.push({ field: 'bag', label: this.translations.bag });
    this.columnsReport.push({ field: 'color', label: this.translations.color });
    this.columnsReport.push({ field: 'serialNumber', label: this.translations.serialNumber });
    this.columnsReport.push({ field: 'composition', label: this.translations.composition });
    this.columnsReport.push({ field: 'status', label: this.translations.status });
    this.columnsReport.push({ field: 'style', label: this.translations.style });
    this.columnsReport.push({ field: 'size', label: this.translations.size });
    this.columnsReport.push({ field: 'itemNumber', label: this.translations.itemNumber });
    this.columnsReport.push({ field: 'invoice', label: this.translations.invoice });
    this.columnsReport.push({ field: 'source', label: this.translations.source });
    this.columnsReport.push({ field: 'invoiceDate', label: this.translations.invoiceDate });


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
    this.manifestId = id
    this._entityState.next({ ...this._entityState.value, id });

  }
  getPreReportPackageItems(): void {
    // debugger
    this.isDownload = true;
    console.log("packageNumber==", this.packageNumber, "manifestId", this.manifestId, "actionType", this.actionType);
    this.loading.show();
    this._entities.next([]);
    this.packageItemService.getPagedPackageItems_PreviousReport({ ...defaultPagination, ps: 5000 }, this.manifestId, this.packageNumber, this.companyId ?? -1).subscribe(res => {
      res.data;
      this.loading.hide();
      console.log("this.onManifestChange=========<<<", res.data);
      this.closedPackageList = res.data;
      //console.log("this.onManifestChange==", res);
      this._entities.next(res.data);
      //this.pagination.ti = res?.totalRows;
    })

    //this._entityState.next({ ...this._entityState.value, this.manifestId });
  }
  getPackageItems(): void {
    // debugger
    this.isDownload = this.actionType == 'report' ? true : false;
    this.packageNumber = '';
    this.selectedPackageItem = null;
    this._editingRow = new PackageItem_PreviousReport();
    console.log("packageNumber==", this.packageNumber, "manifestId", this.manifestId, "actionType", this.actionType);
    this.loading.show();
    this._entities.next([]);
    this.packageItemService.getPagedPackageItems_PreviousReport({ ...defaultPagination, ps: 5000 }, this.manifestId, this.packageNumber, this.companyId ?? -1).subscribe(res => {
      const data = res.data;
      this.loading.hide();
      console.log("this.onManifestChange=========<<<", res.data);
      const filteredData = data.filter(item => item.id !== 0);
      this.closedPackageList = filteredData;// res.data;
      //console.log("this.onManifestChange==", res);
      this._entities.next(filteredData);
      //this.pagination.ti = res?.totalRows;
    })

    //this._entityState.next({ ...this._entityState.value, this.manifestId });
  }

  exportToExcel(): void {
    this.loading.show();
    this.packageItemService.getExcel_PackageItems_PreviousReport(this.manifestId, this.packageNumber, this.companyId ?? -1).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'PackageItems_PreStudy.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

    });
  }


  //   enterEditMode(row: any, field: string) {
  //     row.isEdit = true;
  // }

  unitCostChange(row: any, value: number) {
    //row.isEdit = false; // Optionally, exit edit mode after change
    console.log("unitCostChange==>", row, value);
    row.unitCost = value;
    this.closedPackageList = [...this.closedPackageList];

    this.calculatePrice(row);
  }

  descriptionChange(row: any, value: string) {
    //row.isEdit = false;
    console.log("description==>", row, value);
    row.description = value;
    this.closedPackageList = [...this.closedPackageList];

  }

  characteristicsChange(row: any, value: string) {

    //row.isEdit = false;
    console.log("characteristicsChange==>", row, value);

    row.characteristics = value;
    this.closedPackageList = [...this.closedPackageList];
  }
  quantityChange(row: any, value: number) {
    row.quantity = value;
    this.closedPackageList = [...this.closedPackageList];

    this.calculatePrice(row);
  }

  private calculatePrice(row: any) {
    if (row.unitCost > 0 && row.quantity > 0) {
      row.totalPrice = row.quantity * row.unitCost;
      // Force change detection to update the table
      this.closedPackageList = [...this.closedPackageList];
    }
  }

  protected async cancelChanges() {
    this._editingRow = new PackageItem_PreviousReport();
    this.closedPackageList = this.closedPackageList?.map(val => ({
      ...val,
      isEdit: false,
      descriptionLabel: '',
      priceLabel: ''
    }));
    Swal.fire("Success","Changes cnacelled successfully","success");

  }
  //private _editingRow: any = undefined;
  private _editingRow: PackageItem_PreviousReport = new PackageItem_PreviousReport();

  protected enterEditModeTab(entity: PackageItem_PreviousReport, field: string): void {




    this.selectedPackageItem = { id: entity.id };
    this._editingRow = entity;

    console.log("enterEditModeTab==>", this.selectedPackageItem);

  }

  protected enterEditMode(entity: PackageItem_PreviousReport, field: string): void {

    // Update current editing row reference

    if (this._editingRow && field != 'characteristics' && entity.id != this._editingRow?.id) {
      this.saveCurrentRowData(this._editingRow, 'characteristics');
    }

    this._editingRow = entity;
    this.selectedPackageItem = { id: entity.id };




  }

  private saveCurrentRowData(row: PackageItem_PreviousReport, field: string): void {
    if (this._editingRow && this._editingRow.id > 0) {
      this.packageItemService.updateBillingDetails(row).subscribe({
        next: (res) => {
          if (field == 'characteristics') {
            Swal.fire("Success","Changes cnacelled successfully","success");
          }
          else {
            console.log("data for this field saved succesfully");
          }
        },
        error: (error) => {
          Swal.fire("Error","Error saving changes","error");
          console.error("Error saving changes:", error);
        }
      });
    }
  }

  protected exitEditMode(row: PackageItem_PreviousReport, field: string): void {
    // Only save data, don't exit edit mode
    this.saveCurrentRowData(row, field);
  }
}

