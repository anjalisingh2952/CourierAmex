import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, filter, finalize, forkJoin, lastValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { PackageService } from '@app/features/package/services';
import { CompanyModel } from '@app/features/company/models';
import { PackageModel } from '@app/features/package/models';
import { PackageStatusModel, ShippingWayTypeModel } from '@app/features/general';
import { ManifestModel } from '@app/models/manifest.model';

@Component({
  selector: 'app-package-classify',
  templateUrl: './package-classify.component.html'
})
export class PackageClassifyComponent implements OnInit {
  @ViewChild("typeCellTemplate") typeCellTemplate!: TemplateRef<any>;
  @ViewChild("shipTypeCellTemplate") shipTypeCellTemplate!: TemplateRef<any>;
  @ViewChild("manifestCellTemplate") manifestCellTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;
  selectedStatus: PackageStatusModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _packageStatus = new BehaviorSubject<PackageStatusModel[]>([]);
  packageStatus$ = this._packageStatus.asObservable();

  private readonly _entities = new BehaviorSubject<PackageModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _manifiests = new BehaviorSubject<ManifestModel[]>([]);
  manifiests$ = this._manifiests.asObservable();

  private readonly _shippingWays = new BehaviorSubject<ShippingWayTypeModel[]>([]);
  shippingWays$ = this._shippingWays.asObservable();

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
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
    shipType: '',
    type: '',
    manifestId: '',
    dimension: '',
    placedDate: '',
    Kgs: '',
    Lbs: '',
    ShipByAir: '',
    ShipBySea: '',
    ClassifyMsg1: '',
    ClassifyMsg2: '',
    ClassifyMsg3: '',
    ClassifyMsg4: ''
  };

  constructor(
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private packageService: PackageService
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Delete);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'PackageClassify.Number',
      'PackageClassify.CustomerCode',
      'PackageClassify.CustomerName',
      'PackageClassify.Origin',
      'PackageClassify.TrackingNumber',
      'PackageClassify.Description',
      'PackageClassify.Weight',
      'PackageClassify.VolumetricWeight',
      'PackageClassify.Type',
      'PackageClassify.ShipType',
      'PackageClassify.ManifestId',
      'PackageClassify.Dimension',
      'PackageClassify.PlacedDate',
      'PackageClassify.ClassifyMsg1',
      'PackageClassify.ClassifyMsg2',
      'PackageClassify.ClassifyMsg3',
      'PackageClassify.ClassifyMsg4',
      'Labels.Kgs',
      'Labels.Lbs',
      'ManifestDetails.ShipByAir',
      'ManifestDetails.ShipBySea'])
      .subscribe(
        translations => {
          this.translations.number = translations['PackageClassify.Number'];
          this.translations.customerCode = translations['PackageClassify.CustomerCode'];
          this.translations.customerName = translations['PackageClassify.CustomerName'];
          this.translations.origin = translations['PackageClassify.Origin'];
          this.translations.trackingNumber = translations['PackageClassify.TrackingNumber'];
          this.translations.description = translations['PackageClassify.Description'];
          this.translations.weight = translations['PackageClassify.Weight'];
          this.translations.volumetricWeight = translations['PackageClassify.VolumetricWeight'];
          this.translations.shipType = translations['PackageClassify.ShipType'];
          this.translations.type = translations['PackageClassify.Type'];
          this.translations.manifestId = translations['PackageClassify.ManifestId'];
          this.translations.dimension = translations['PackageClassify.Dimension'];
          this.translations.placedDate = translations['PackageClassify.PlacedDate'];
          this.translations.Kgs = translations['Labels.Kgs'];
          this.translations.Lbs = translations['Labels.Lbs'];
          this.translations.ShipByAir = translations['ManifestDetails.ShipByAir'];
          this.translations.ShipBySea = translations['ManifestDetails.ShipBySea'];
          this.translations.ClassifyMsg1 = translations['PackageClassify.ClassifyMsg1'];
          this.translations.ClassifyMsg2 = translations['PackageClassify.ClassifyMsg2'];
          this.translations.ClassifyMsg3 = translations['PackageClassify.ClassifyMsg3'];
          this.translations.ClassifyMsg4 = translations['PackageClassify.ClassifyMsg4'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    //Numero,Cliente,Procedencia,Courier,Description,Peso,PsoVolumetrico,ModoEnvio,Manifiesto,Tipo,Dimensiones,Fecha
    this.columns.push({ field: 'number', label: this.translations.number, sortable: true });
    this.columns.push({ field: 'customerCode', label: this.translations.customerCode, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'trackingNumber', label: this.translations.trackingNumber, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.columns.push({ field: 'weight', label: this.translations.weight, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'volumetricWeight', label: this.translations.volumetricWeight, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'shipType', label: this.translations.shipType, contentTemplate: this.shipTypeCellTemplate });
    this.columns.push({ field: 'issueTypeId', label: this.translations.type, contentTemplate: this.typeCellTemplate });
    this.columns.push({ field: 'manifestId', label: this.translations.manifestId, contentTemplate: this.manifestCellTemplate });
    this.columns.push({ field: 'dimension', label: this.translations.dimension, sortable: true });
    this.columns.push({ field: 'placedDate', label: this.translations.placedDate, sortable: true });
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
    this.performSearch();
  }

  protected shipTypeChange(row: any, value: number) {
    this._manifiests.next([]);
    row.shipType = +value;
    row.manifestId = 0;
    row.issueTypeId = 0;
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    const newPagination = { ...defaultPagination, ps: 500 };
    this.commonService.getManifests$(newPagination, companyId, false, row.shipType)
      .subscribe(val => {
        this._manifiests.next(val.data)
      });

    this.commonService.getShippingWayTypeList$(newPagination)
      .subscribe(val => {
        if (row.shipType === 1)
          this._shippingWays.next(val.data)
        else
          this._shippingWays.next(val.data.filter(i => i.shipType === 0))
      });
  }

  protected manifestChange(row: any, value: number) {
    row.manifestId = +value;
  }

  protected typeChange(row: any, value: number) {
    row.issueTypeId = +value;
  }

  protected copyValues(): void {

    const shipType = this._editingRow ? this._editingRow.shipType : -1;
    const issueTypeId = this._editingRow ? this._editingRow.issueTypeId : 0;
    const manifestId = this._editingRow ? this._editingRow.manifestId : 0;

    if (this._editingRow && shipType !== -1 && issueTypeId !== 0 && manifestId !== 0) {
      const values = this._entities.value;
      const index = values.indexOf(this._editingRow);
      const manifest = this._manifiests.value.find(m => m.id === manifestId);
      const shipWay = this._shippingWays.value.find(sw => sw.id === issueTypeId);

      if (index > -1) {
        const followingItem: any = values[(index + 1)];
        const curremtItem: any = values[index];
        const shipTypeLabel = shipType === 1 ? this.translations.ShipByAir : this.translations.ShipBySea;
        this._editingRow.isEdit = false;

        curremtItem['manifestLabel'] = manifest?.manifestNumber;
        curremtItem['shipTypeLabel'] = shipTypeLabel;
        curremtItem['issueTypeLabel'] = shipWay?.name;

        followingItem['manifestLabel'] = manifest?.manifestNumber;
        followingItem['shipTypeLabel'] = shipTypeLabel;
        followingItem['issueTypeLabel'] = shipWay?.name;
        followingItem['shipType'] = shipType;
        followingItem['issueTypeId'] = issueTypeId;
        followingItem['manifestId'] = manifestId;

        this._entities.next(values);
      }
    } else {
      alert('Please select all options to continue');
    }
  }

  protected copyAllValues(): void {
    const shipType = this._editingRow ? this._editingRow.shipType : -1;
    const issueTypeId = this._editingRow ? this._editingRow.issueTypeId : 0;
    const manifestId = this._editingRow ? this._editingRow.manifestId : 0;

    if (this._editingRow && shipType !== -1 && issueTypeId !== 0 && manifestId !== 0) {
      const values = this._entities.value;
      const manifest = this._manifiests.value.find(m => m.id === manifestId);
      const shipWay = this._shippingWays.value.find(sw => sw.id === issueTypeId);

      const shipTypeLabel = shipType === 1 ? this.translations.ShipByAir : this.translations.ShipBySea;
      this._editingRow.isEdit = false;

      for (let index = 0; index < values.length; index++) {
        const followingItem: any = values[index];
        followingItem['manifestLabel'] = manifest?.manifestNumber;
        followingItem['shipTypeLabel'] = shipTypeLabel;
        followingItem['issueTypeLabel'] = shipWay?.name;
        followingItem['shipType'] = shipType;
        followingItem['issueTypeId'] = issueTypeId;
        followingItem['manifestId'] = manifestId;
      }

      this._entities.next(values);
    } else {
      alert('Please select all options to continue');
    }
  }

  protected async saveChanges() {
    const values = this._entities.value;
    const sources = [];
    for (let index = 0; index < values.length; index++) {
      const record: any = values[index];
      if (record['shipType'] !== -1 && record['issueTypeId'] !== 0 && record['manifestId'] !== 0) {
        sources.push({
          id: record['number'],
          shipTypeId: record['shipType'],
          issueTypeId: record['issueTypeId'],
          manifestId: record['manifestId']
        });
      }
    }

    if (sources.length > 0) {
      let successCount = 0;
      for (let index = 0; index < sources.length; index++) {
        const record: any = sources[index];
        const assetTypes$ = this.packageService.classifyPackage(record);
        const response = await lastValueFrom(assetTypes$);
        const packageNumber = record['id'];
        if (response.data?.id! > 0) {
          let message = '';
          switch (response.data?.id!) {
            case 1:
              message = this.translations.ClassifyMsg1.replace('@-@',packageNumber);
              break;
            case 2:
              message = this.translations.ClassifyMsg2.replace('@-@',packageNumber);
              break;
            case 3:
              message = this.translations.ClassifyMsg3.replace('@-@',packageNumber);
              break;
            case 4:
              message = this.translations.ClassifyMsg4.replace('@-@',packageNumber);
              break;
          }
          alert(message);
        }else {
          successCount++;
        }
      }

      if(successCount > 0) {
        this.performSearch();
      }

    } else {
      alert('Please select all options to continue');
    }
  }

  private _editingRow: any = undefined;
  protected enterEditMode(entity: any): void {
    const values = this._entities.value?.map(val => ({ ...val, isEdit: false }));
    const transient: any = values.find(e => e.id === entity.id);
    this._editingRow = undefined;
    this._entities.next(values);
    if (entity.id > 0 && transient) {
      transient.isEdit = !transient.isEdit;
      this._editingRow = transient;
    }
  }

  protected selectCompany(entity: CompanyModel | undefined): void {
    this.selectedCompany = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  protected selectStatus(entity: PackageStatusModel | undefined): void {
    this.selectedStatus = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  private getWeightUnitLabel(input: number, company: any) {
    const weightUnit = (company?.weightUnit || 1);

    if (weightUnit === 1)
      return `${input} ${this.translations.Kgs}`;

    return `${input} ${this.translations.Lbs}`;
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    const statusId = this.selectedStatus !== undefined ? this.selectedStatus.id : 0;
    const company = this._companies.value.find(v => v.id === companyId);

    this.packageService.getPaged$({ ...this.pagination, ps: 5000 }, companyId, statusId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {

          const packageList = res.data?.map(
            (val: any) =>
            ({
              ...val,
              weight: this.getWeightUnitLabel(val.weight, company),
              volumetricWeight: this.getWeightUnitLabel(val.volumetricWeight, company),
              type: undefined,
              shipType: -1,
              isEdit: false,
              manifestId: 0,
              issueTypeId: 0,
              shipTypeLabel: '',
              issueTypeLabel: '',
              manifestLabel: ''
            })
          );
          this._entities.next(packageList);
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

    forkJoin({
      companies: this.commonService.getCompanies$(),
      packageStatus: this.commonService.getPackageStatus$()
    }).pipe(
      finalize(() => {
        this.loading.hide();
        this.setDefaultCompany();
      })
    )
      .subscribe({
        next: (res) => {
          if (res.companies && res.companies.length > 0) {
            this._companies.next(res.companies ?? []);
            this.selectCompany(res.companies[0]);
          }
          if (res.packageStatus && res.packageStatus.length > 0) {
            this._packageStatus.next(res.packageStatus);
            this.selectStatus(res.packageStatus[0]);
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      const cias = this._companies.value;
      if (cias && cias.length > 0) {
        const userCia = cias.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectCompany(userCia);
          return;
        }
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  }
}
