import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ManifestService } from '@app/features/manifest/services';
import { CompanyModel } from '@app/features/company/models';
import { SendDelayNotificationModalComponent } from '@app/features/manifest/components';
import { ManifestModel } from '@app/models/manifest.model';

@Component({
  selector: 'manifests-manifest-list',
  templateUrl: './manifest-list.container.html'
})
export class ManifestListContainer implements OnInit {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;
  showClosed: boolean = false;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<ManifestModel[]>([]);
  entities$ = this._entities.asObservable();

  hasAdd: boolean = false;
  hasDelete: boolean = false;
  hasUpdate: boolean = false;
  hasOpenManifest: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'manifestDate',
    sortDirection: 'DESC',
  };

  translations = {
    number: '',
    date: '',
    status: '',
    name: '',
    shippingWay: '',
    action: ''
  };

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private manifestService: ManifestService,
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();

    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Delete);
    this.hasOpenManifest = this.credentailsService.hasPermission(PermissionsEnum.OpenClosedManifests, PermissionActionEnum.Update);

    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(
      ['Manifests.Number',
        'Manifests.Date',
        'Labels.Status',
        'Manifests.Details',
        'Manifests.ShippingWay',
        'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.number = translations['Manifests.Number'];
          this.translations.date = translations['Manifests.Date'];
          this.translations.status = translations['Labels.Status'];
          this.translations.name = translations['Manifests.Details'];
          this.translations.shippingWay = translations['Manifests.ShippingWay'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'manifestNumber', label: this.translations.number, sortable: true });
    this.columns.push({ field: 'manifestDate', label: this.translations.date, sortable: true, type: 'date' });
    this.columns.push({ field: 'status', label: this.translations.status, sortable: true, contentTemplate: this.statusTemplate });
    this.columns.push({ field: 'name', label: this.translations.name, sortable: true });
    this.columns.push({ field: 'shippingWayName', label: this.translations.shippingWay, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
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

  protected addNew(): void {
    this.router.navigate(['manifest', 'details']);
  }

  protected editEntity(entity: ManifestModel): void {
    if (entity.id > 0) {
      this.router.navigate(['manifest', 'details'], { queryParams: { id: entity.id } });
    }
  }

  protected deleteEntity(entity: ManifestModel): void {
    Swal.fire({
      title: this.messageService.getTranslate('Labels.DeleteTitle'),
      text: this.messageService.getTranslate('Labels.DeleteMessage'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.messageService.getTranslate('Labels.Confirm'),
      cancelButtonText: this.messageService.getTranslate('Labels.Cancel')
    })
      .then((response: SweetAlertResult) => {
        if (response.isConfirmed) {
          this.confirmDeletion(entity.id);
        }
      });
  }

  protected selectEntity(entity: CompanyModel | undefined): void {
    this.selectedCompany = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  protected showCloseList(): void {
    this.showClosed = !this.showClosed;
    this.performSearch();
  }

  protected openEntity(entity: ManifestModel): void {
    Swal.fire({
      title: this.messageService.getTranslate('Manifests.OpenTitle'),
      text: this.messageService.getTranslate('Manifests.OpenMessage'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.messageService.getTranslate('Labels.Confirm'),
      cancelButtonText: this.messageService.getTranslate('Labels.Cancel')
    })
      .then((response: SweetAlertResult) => {
        if (response.isConfirmed) {
          this.confirmOpen(entity.id);
        }
      });
  }

  protected sendDelay(entity: ManifestModel): void {
    if (!this.credentailsService.isGatewayUser()) {
      Swal.fire(this.messageService.getTranslate('Labels.Warning'), "You don't have access to this page", 'warning');
      return;
    }

    const modalRef = this.modalService.open(SendDelayNotificationModalComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.entity = entity;

    modalRef.result
      .catch(reason => {
        console.error(reason);
      })
      .then((res: boolean) => {
      });
  }

  private confirmOpen(id: number): void {
    this.loading.show();

    this.manifestService.open$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.success && res.data) {
            const data = res.data;
            Swal.fire(this.messageService.getTranslate('Manifests.OpenTitle'), this.messageService.getTranslate('Manifests.OpenSuccessfully'), 'success')
              .then(() => {
                this.editEntity(data);
              });
          } else {
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.manifestService.delete$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.onStateChange({
            searchTerm: this.state?.searchTerm || '',
            page: 1,
            pageSize: this.state?.pageSize || defaultPagination.ps,
            sortColumn: this.state?.sortColumn,
            sortDirection: this.state.sortDirection
          });
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire(this.messageService.getTranslate('Labels.DeleteEntry'), this.messageService.getTranslate('Labels.DeleteSuccessfully'), 'success');
          } else {
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;

    this.commonService.getManifests$(this.pagination, companyId, this.showClosed, -1)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
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

    this.commonService.getCompanies$()
      .pipe(
        filter((res) => !!res && res.length > 0),
        finalize(() => {
          this.setDefaultCompany();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res ?? []);
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
          this.selectEntity(userCia);
          return;
        }
      }
    }
    this.performSearch();
  }
}
