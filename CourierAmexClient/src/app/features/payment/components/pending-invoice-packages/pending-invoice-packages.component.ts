import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pending-invoice-packages',
  templateUrl: './pending-invoice-packages.component.html'
})
export class PendingInvoicePackagesComponent {

  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @Input() packageListByInvoice: any;
  
  pagination: PaginationModel = defaultPagination;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    PackageNumber: '',
    CourierName: '',
    Origin: '',
    Description: '',
    Weight: '',
    action: ''
  };

  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal
  ) {
    this.translate.get([
      'PackageDetails.PackageNumber',
      'PackageCategory.CourierName',
      'Packages.Origin',
      'PackageDetails.Description',
      'PackageDetails.Weight',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.PackageNumber = translations['PackageDetails.PackageNumber'];
          this.translations.CourierName = translations['PackageCategory.CourierName'];
          this.translations.Origin = translations['Packages.Origin'];
          this.translations.Description = translations['PackageDetails.Description'];
          this.translations.Weight = translations['PackageDetails.Weight'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['packageListByInvoice']) {
      const prev = changes['packageListByInvoice'].previousValue;
      const curr = changes['packageListByInvoice'].currentValue;
      console.log("prev", prev);
      console.log("curr", curr);
    }
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'packageNumber', label: this.translations.PackageNumber, sortable: true });
    this.columns.push({ field: 'courierCode', label: this.translations.CourierName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.Origin, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.Description, sortable: true });
    this.columns.push({ field: 'width', label: this.translations.Weight, sortable: true });

    this.changeDetectorRef.detectChanges();
  }

  onCheckboxChange(row: any) {
    console.log("row", row);
  }
}
