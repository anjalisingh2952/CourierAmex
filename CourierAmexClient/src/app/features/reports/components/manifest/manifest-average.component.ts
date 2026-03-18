import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models/pagination.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AverageManifest } from '../../models/detailed-billing.model';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-manifest-average',
  templateUrl: './manifest-average.component.html',
})
export class manifestaverageComponent implements OnInit {

  @Input() entities: AverageManifest[] = [];

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
    manifestNumber: '',
    weight: "",
    volume: "",
    quantity: "",
    totalBilled: "",
    totalCost: "",
    freightCost: "",
    parafiscalContribution: "",
    customsTax: "",
    averageKg: ""
  };

private readonly _paginatedEntities = new BehaviorSubject<AverageManifest[]>([]);
  paginatedEntities$ = this._paginatedEntities.asObservable();


  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.pagination.ps = this.state.pageSize;
    this.translate.get([
      'DetailedBillingManifestAverage.ManifestNumber',
      'DetailedBillingManifestAverage.Weight',
      'DetailedBillingManifestAverage.Volume',
      'DetailedBillingManifestAverage.Quantity',
      'DetailedBillingManifestAverage.TotalBilled',
      'DetailedBillingManifestAverage.TotalCost',
      'DetailedBillingManifestAverage.FreightCost',
      'DetailedBillingManifestAverage.ParafiscalContribution',
      'DetailedBillingManifestAverage.CustomsTax',
      'DetailedBillingManifestAverage.AverageKg'
    ]).subscribe(translations => {
      this.translations.manifestNumber = translations['DetailedBillingManifestAverage.ManifestNumber'];
      this.translations.weight = translations['DetailedBillingManifestAverage.Weight'];
      this.translations.volume = translations['DetailedBillingManifestAverage.Volume'];
      this.translations.quantity = translations['DetailedBillingManifestAverage.Quantity'];
      this.translations.totalBilled = translations['DetailedBillingManifestAverage.TotalBilled'];
      this.translations.totalCost = translations['DetailedBillingManifestAverage.TotalCost'];
      this.translations.freightCost = translations['DetailedBillingManifestAverage.FreightCost'];
      this.translations.parafiscalContribution = translations['DetailedBillingManifestAverage.ParafiscalContribution'];
      this.translations.customsTax = translations['DetailedBillingManifestAverage.CustomsTax'];
      this.translations.averageKg = translations['DetailedBillingManifestAverage.AverageKg'];
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

    this.columns.push({ field: 'manifestNumber', label: this.translations.manifestNumber, sortable: true });
    this.columns.push({ field: 'weight', label: this.translations.weight, sortable: true });
    this.columns.push({ field: 'volume', label: this.translations.volume, sortable: true });
    this.columns.push({ field: 'quantity', label: this.translations.quantity, sortable: true });
    this.columns.push({ field: 'totalBilled', label: this.translations.totalBilled, sortable: true });
    this.columns.push({ field: 'totalCost', label: this.translations.totalCost, sortable: true });
    this.columns.push({ field: 'freightCost', label: this.translations.freightCost, sortable: true });
    this.columns.push({ field: 'parafiscalContribution', label: this.translations.parafiscalContribution, sortable: true });
    this.columns.push({ field: 'customsTax', label: this.translations.customsTax, sortable: true });
    this.columns.push({ field: 'averageKg', label: this.translations.averageKg, sortable: true });

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
