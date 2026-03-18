import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models/pagination.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Manifestdetail } from '../../models/detailed-billing.model';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-manifest-details',
  templateUrl: './manifest-details.component.html',
})
export class manifestdetailsComponent implements OnInit {

  @Input() entities: Manifestdetail[] = [];

  pagination: PaginationModel = defaultPagination;
  columns: ColDef[] = [];
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'ClientCode',
    sortDirection: 'ASC',
  };

  translations = {
    fullName: "",
    manifestNumber: "",
    invoiceNumber: "",
    date: "",
    freightVolume: "",
    internationFreightFlet: "",
    handling: "",
    customsTaxes: "",
    vat: "",
    crManagement: "",
    packageEvisionPreviousExam: "",
    packageWithoutInvoice: "",
    nonUseAccountCharge: "",
    total: ""
  };

  private readonly _paginatedEntities = new BehaviorSubject<Manifestdetail[]>([]);
  paginatedEntities$ = this._paginatedEntities.asObservable();


  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.pagination.ps = this.state.pageSize;
    this.translate.get([
      'DetailedBillingManifestDetails.FullName',
      'DetailedBillingManifestDetails.ManifestNumber',
      'DetailedBillingManifestDetails.InvoiceNumber',
      'DetailedBillingManifestDetails.Date',
      'DetailedBillingManifestDetails.FreightVolume',
      'DetailedBillingManifestDetails.InternationalFreightFlet',
      'DetailedBillingManifestDetails.Handling',
      'DetailedBillingManifestDetails.CustomsTaxes',
      'DetailedBillingManifestDetails.VAT',
      'DetailedBillingManifestDetails.CrManagement',
      'DetailedBillingManifestDetails.PackageEvisionPreviousExam',
      'DetailedBillingManifestDetails.PackageWithoutInvoice',
      'DetailedBillingManifestDetails.NonUseAccountCharge',
      'DetailedBillingManifestDetails.Total'
    ]).subscribe(translations => {
      this.translations.fullName = translations['DetailedBillingManifestDetails.FullName'];
      this.translations.manifestNumber = translations['DetailedBillingManifestDetails.ManifestNumber'];
      this.translations.invoiceNumber = translations['DetailedBillingManifestDetails.InvoiceNumber'];
      this.translations.date = translations['DetailedBillingManifestDetails.Date'];
      this.translations.freightVolume = translations['DetailedBillingManifestDetails.FreightVolume'];
      this.translations.internationFreightFlet = translations['DetailedBillingManifestDetails.InternationalFreightFlet'];
      this.translations.handling = translations['DetailedBillingManifestDetails.Handling'];
      this.translations.customsTaxes = translations['DetailedBillingManifestDetails.CustomsTaxes'];
      this.translations.vat = translations['DetailedBillingManifestDetails.VAT'];
      this.translations.crManagement = translations['PackageScDetailedBillingManifestDetailsanning.CrManagement'];
      this.translations.packageEvisionPreviousExam = translations['DetailedBillingManifestDetails.PackageEvisionPreviousExam'];
      this.translations.packageWithoutInvoice = translations['DetailedBillingManifestDetails.PackageWithoutInvoice'];
      this.translations.nonUseAccountCharge = translations['DetailedBillingManifestDetails.NonUseAccountCharge'];
      this.translations.total = translations['DetailedBillingManifestDetails.Total'];
    });

  }

  ngOnInit(): void {
    this.updatePaginatedEntities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entities']?.currentValue) {
      this.updatePaginatedEntities(); // This ensures the data is updated when `entities` changes
    }
  }

  ngAfterViewInit(): void {

    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'manifestNumber', label: this.translations.manifestNumber, sortable: true });
    this.columns.push({ field: 'invoiceNumber', label: this.translations.invoiceNumber, sortable: true });
    this.columns.push({ field: 'date', label: this.translations.date, sortable: true });
    this.columns.push({ field: 'freightVolume', label: this.translations.freightVolume, sortable: true });
    this.columns.push({ field: 'internationFreightFlet', label: this.translations.internationFreightFlet, sortable: true });
    this.columns.push({ field: 'handling', label: this.translations.handling, sortable: true });
    this.columns.push({ field: 'customsTaxes', label: this.translations.customsTaxes, sortable: true });
    this.columns.push({ field: 'vat', label: this.translations.vat, sortable: true });
    this.columns.push({ field: 'crManagement', label: this.translations.crManagement, sortable: true });
    this.columns.push({ field: 'packageEvisionPreviousExam', label: this.translations.packageEvisionPreviousExam, sortable: true });
    this.columns.push({ field: 'packageWithoutInvoice', label: this.translations.packageWithoutInvoice, sortable: true });
    this.columns.push({ field: 'nonUseAccountCharge', label: this.translations.nonUseAccountCharge, sortable: true });
    this.columns.push({ field: 'total', label: this.translations.total, sortable: true });

    this.changeDetectorRef.detectChanges();
  }

  private updatePaginatedEntities(): void {
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._paginatedEntities.next([]);
    const startIndex = (this.state.page - 1) * this.state.pageSize;
    const paginatedData = this.entities.slice(startIndex, startIndex + this.state.pageSize);
    this._paginatedEntities.next(paginatedData);
    this.pagination.ti = this.entities.length;
    this.updatePagination();
  }

  private updatePagination(): void {
    const entities = this._paginatedEntities.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }

  onStateChange(state: TableState): void {
    this.state = { ...state };
    this.pagination = {
      ...this.pagination,
      c: state.searchTerm,
      pi: state.page,
      ps: state.pageSize,
      s: `${state.sortColumn} ${state.sortDirection}`
    };
    this.updatePaginatedEntities();
  }

}
