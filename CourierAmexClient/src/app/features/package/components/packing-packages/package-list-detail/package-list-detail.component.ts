import { ChangeDetectorRef, Component, SimpleChanges, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { PackageService } from '@app/features/package/services';
import { defaultPagination, PaginationModel } from '@app/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-package-list-detail',
  templateUrl: './package-list-detail.component.html',
  inputs: ['manifestId']
})
export class PackageListDetailComponent implements OnInit {
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @Output() refreshList = new EventEmitter<void>();
  @Output() closePacking = new EventEmitter<boolean>();
  @Output() packageSearch = new EventEmitter<any>();
  @Output() pallet = new EventEmitter<any>();
  @Output() isPackageList = new EventEmitter<boolean>();
  @Input() packageList: any;
  @Input() pendingPackages: any;
  @Input() isPackagingStarted: any;
  isConsolidated: boolean;
  totalPackages: any;
  totalWeight: any;
  selectedId: any;
  totalVolume: any;
  isCancleClicked: boolean;
  searchPackage: any;
  manifests: any[] = [];
  columns: ColDef[] = [];
  rows: any[] = [];
  pagination: PaginationModel = defaultPagination;
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    action: '',
    packageNumber: '',
    clientCode: '',
    fullName: '',
    company: '',
    origin: '',
    description: ''
  };

  constructor(
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private packService: PackageService,
    private router: Router,
    private messages: MessageService
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    if (this.router.url.includes('packing-packages-consolidated')) {
      this.isConsolidated = true;
    }
  }

  ngOnInit(): void {
    this.translate.get([
      'Labels.Actions',
      'InvoiceHistory.Number',
      'InvoiceHistory.Customer',
      'InvoiceHistory.CustomerName',
      'InvoiceHistory.Company',
      'InvoiceHistory.Origin',
      'InvoiceHistory.Description'
    ]).subscribe(
      translations => {
        this.translations.action = translations['Labels.Actions'];
        this.translations.packageNumber = translations['InvoiceHistory.Number'];
        this.translations.clientCode = translations['InvoiceHistory.Customer'];
        this.translations.fullName = translations['InvoiceHistory.CustomerName'];
        this.translations.company = translations['InvoiceHistory.Company'];
        this.translations.origin = translations['InvoiceHistory.Origin'];
        this.translations.description = translations['InvoiceHistory.Description'];
      });
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-center', contentTemplate: this.actionTemplate });
    this.columns.push({ field: 'packageNumber', label: this.translations.packageNumber, sortable: true });
    this.columns.push({ field: 'clientCode', label: this.translations.clientCode, sortable: true });
    this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
    this.columns.push({ field: 'company', label: this.translations.company, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['packageList']?.currentValue) {
      this.updateInvoiceCreditDetails(changes['packageList'].currentValue);
    }
  }

  updateInvoiceCreditDetails(newDetails: any[]): void {
    this.totalPackages = newDetails.length;
    if (this.packageList.length > 0) {
      this.searchPackage = null
      this.isPackageList.emit(false);
    }
    else {
      this.isPackageList.emit(true);
    }
    this.totalWeight = newDetails.reduce((acc, curr) => acc + curr.weight, 0);
    this.totalVolume = newDetails.reduce((acc, curr) => acc + curr.volumetricWeight, 0);
  }

  onSearchPackageEnter() {
    this.packageSearch.emit(this.searchPackage);
  }

  async onCheckboxChange(selectedRow: any): Promise<void> {
    console.log(selectedRow);
    this.selectedId = selectedRow.packageNumber;
    const updatedEntities = this.packageList.map((row: any) => ({
      ...row,
      selected: row === selectedRow
    }));

    this.packageList = updatedEntities;
  }

  showAlert(icon: any, title: string, text: string) {
    Swal.fire({ icon, title, text });
  }

  confirmActionAlert(title: string, text: string, confirmCallback: () => void) {
    Swal.fire({
      title, text, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Yes', cancelButtonText: 'No',
    }).then(({ isConfirmed }) => isConfirmed && confirmCallback());
  }

  closeSection() {
    if (!this.startPackagingFirst()) return;
    this.confirmActionAlert(
      'Confirmation',
      'Are you sure you want to close the section?',
      () => this.emitClosePacking()
    );
  }

  finishPackaging() {
    if (!this.startPackagingFirst()) return;
    this.pendingPackages > 0
      ? this.showAlert('warning', 'Warning', 'Cannot finish packing because there are packages pending for the manifest.')
      : this.emitClosePacking();
  }

  open() {
    if (!this.startPackagingFirst()) return;
    this.selectedId
      ? this.confirmActionAlert('Unpack Package', `Are you sure you want to unpack the package with package number: ${this.selectedId}?`, () => this.confirmAction())
      : this.showAlert('warning', 'Warning', 'Please select a package to proceed.');
  }

  confirmAction() {
    if (!this.startPackagingFirst()) return;
    this.packService.UnpackPackage(+this.selectedId, this.isConsolidated).subscribe({
      next: () => this.successAction('Package unpacked successfully.'),
      error: () => this.showAlert('error', 'Error', 'Error un-packing package details.')
    });
  }

  startPackagingFirst(): boolean {
    if (!this.isPackagingStarted) {
      this.showAlert('error', 'Error', 'Packaging has not started yet.');
      return false;
    }
    return true; 
  }

  private emitClosePacking() {
    this.closePacking.emit(true);
    this.showAlert('success', 'Success', 'Section closed successfully.');
  }

  private successAction(message: string) {
    this.showAlert('success', 'Success', message);
    this.refreshList.emit();
  }
}