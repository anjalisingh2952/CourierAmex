import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PackageService } from '@app/features/package/services';
import { defaultPagination, PageOptionsDefault, PaginationModel } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';

@Component({
  selector: 'app-packing-packages-packages-list',
  templateUrl: './packing-packages-packages-list.component.html'
})
export class PackingPackagesPackagesListComponent implements OnInit, OnChanges {
  @Input() packagedPackagesForAirGuides: any[] = [];
  @Input() data: any[] = [];
  pagination: PaginationModel = defaultPagination;
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
    trackingNumber: '',
    courierName: '',
    origin: '',
    packageStateName: '',
    action: ''
  };

  packageList: any[] = [];
  isPending = false;
  dataRecived = false;
  isPackageListPresent = false;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    public activeModal: NgbActiveModal,
    private packageService: PackageService,
    private changeDetectorRef: ChangeDetectorRef
  ) { 

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
  }

  ngOnInit(): void {
    this.initializeData();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'number', label: this.translations.number, sortable: true });
    this.columns.push({ field: 'customerCode', label: this.translations.customerCode, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'trackingNumber', label: this.translations.trackingNumber, sortable: true });
    this.columns.push({ field: 'courierName', label: this.translations.courierName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'packageStateName', label: this.translations.packageStateName, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end' });
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['packagedPackagesForAirGuides']) {
      this.initializeData();
    }
  }

  private initializeData(): void {
    if (this.data?.length) {
      this.isPending = false;
      this.dataRecived = true;
    } else if (this.packagedPackagesForAirGuides?.length) {
      this.isPending = true;
      this.dataRecived = true;
    } else {
      this.dataRecived = false;
    }
  }

  sortList(column: string, list: any[]): void {
    const direction = this.sortColumn === column
      ? this.sortDirection === 'asc' ? 'desc' : 'asc'
      : 'asc';

    this.sortColumn = column;
    this.sortDirection = direction;

    list.sort((a, b) => this.compareValues(a[column], b[column], direction));
  }

  private compareValues(valueA: any, valueB: any, direction: string): number {
    if (valueA === valueB) return 0;
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    return direction === 'asc' ? 1 : -1;
  }

  getSortIcon(column: string): string {
    return this.sortColumn === column
      ? this.sortDirection === 'asc' ? 'fa-solid fa-arrow-up-z-a' : 'fa-solid fa-arrow-down-z-a'
      : 'fa-solid fa-arrow-down-z-a';
  }

  OnClickList(pack: any): void {
    if (!pack?.airGuide || !pack?.manifestId) {
      return;
    }

    this.packageService.GetPackagedPackagesForAirGuides(pack.airGuide, pack.manifestId, 1)
      .subscribe(
        (res) => this.handlePackageListResponse(res),
        (error) => this.handlePackageListError(error)
      );
  }

  private handlePackageListResponse(res: any): void {
    if (res?.data?.length) {
      this.packageList = res.data;
      this.isPackageListPresent = true;
    } else {
      this.packageList = [];
      this.isPackageListPresent = false;
    }
  }

  private handlePackageListError(error: any): void {
    this.packageList = [];
    this.isPackageListPresent = false;
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}