import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models/pagination.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ManifestProvoider } from '../../models/detailed-billing.model';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-manifest-supplier',
  templateUrl: './manifest-supplier.component.html',
})
export class manifestsupplierComponent implements OnInit {

  @Input() entities: ManifestProvoider[] = [];

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
    supplierCOD: "",
    supplier: "",
    currency: "",
    amount: ""    
  };

private readonly _paginatedEntities = new BehaviorSubject<ManifestProvoider[]>([]);
  paginatedEntities$ = this._paginatedEntities.asObservable();


  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.pagination.ps = this.state.pageSize;
    this.translate.get([
      'DetailedBillingManifestSupplier.supplierCOD',
      'DetailedBillingManifestSupplier.supplier',
      'DetailedBillingManifestSupplier.currency',
      'DetailedBillingManifestSupplier.amount'      
    ]).subscribe(translations => {
      this.translations.supplierCOD = translations['DetailedBillingManifestSupplier.supplierCOD'];
      this.translations.supplier = translations['DetailedBillingManifestSupplier.supplier'];
      this.translations.currency = translations['DetailedBillingManifestSupplier.currency'];
      this.translations.amount = translations['DetailedBillingManifestSupplier.amount'];      
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

    this.columns.push({ field: 'supplierCOD', label: this.translations.supplierCOD, sortable: true });
    this.columns.push({ field: 'supplier', label: this.translations.supplier, sortable: true });
    this.columns.push({ field: 'currency', label: this.translations.currency, sortable: true });
    this.columns.push({ field: 'amount', label: this.translations.amount, sortable: true });    

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
