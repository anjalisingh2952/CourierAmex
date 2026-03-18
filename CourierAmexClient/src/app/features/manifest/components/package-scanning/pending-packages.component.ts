import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PaginationModel } from '@app/models/pagination.interface';
import { newPendingPackages, PendingPackages } from '@app/models';
import { ManifestService } from '@app/features/manifest/services/manifest.service';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-pending-packages',
  templateUrl: './pending-packages.component.html',
})
export class PendingPackagesComponent implements OnInit {

  @Input() selectedManifestNumber: string = '';
  
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
    packageNumber: "",
    customerAccount: "",
    customerName: "",
    origin: "",
    description: "",
    bag: ""
  };

  private readonly _pendingPackages = new BehaviorSubject<PendingPackages[]>([]);
  pendingPackages$ = this._pendingPackages.asObservable();

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private manifestService: ManifestService,
    private messageService: MessageService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    public activeModal: NgbActiveModal,
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.pagination.ps = this.state.pageSize;
    this.translate.get([
      'PackageScanning.PackageNumber',
      'PackageScanning.CustomerAccount',
      'PackageScanning.CustomerName',
      'PackageScanning.Origin',
      'PackageScanning.Description',
      'PackageScanning.Bag'])
      .subscribe(
        translations => {
          this.translations.packageNumber = translations['PackageScanning.PackageNumber'];
          this.translations.customerAccount = translations['PackageScanning.CustomerAccount'];
          this.translations.customerName = translations['PackageScanning.CustomerName'];
          this.translations.origin = translations['PackageScanning.Origin'];
          this.translations.description = translations['PackageScanning.Description'];
          this.translations.bag = translations['PackageScanning.Bag'];
        });

  }

  ngOnInit(): void {
    if(this.selectedManifestNumber != undefined && this.selectedManifestNumber != '')
    {
    this.loadPendingPackages();
    }
  }

  ngAfterViewInit(): void {

    this.columns.push({ field: 'packageNumber', label: this.translations.packageNumber, sortable: true });
    this.columns.push({ field: 'customerAccount', label: this.translations.customerAccount, sortable: true });
    this.columns.push({ field: 'customerName', label: this.translations.customerName, sortable: true });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.columns.push({ field: 'bag', label: this.translations.bag, sortable: true });

    this.changeDetectorRef.detectChanges();
  }

  loadPendingPackages(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._pendingPackages.next([]);
    const manifestNumber = this.selectedManifestNumber || '';
    this.manifestService.GetPendingPackages(this.pagination, manifestNumber)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._pendingPackages.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private updatePagination(): void {
    const entities = this._pendingPackages.value;

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
    this.loadPendingPackages();
  }

  dismissModal(){
    this.activeModal.dismiss();
  }
}
