import { ChangeDetectorRef, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { defaultPagination, PaginationModel, PermissionActionEnum, PermissionsEnum, RouteInsertModel } from '@app/models';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ManifestService } from '@app/features/manifest/services';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { is } from 'date-fns/locale';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reopen-roadmap',
  templateUrl: './reopen-roadmap.component.html'
})
export class ReopenRoadmapComponent {
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("actionWithCheckTemplate") actionWithCheckTemplate!: TemplateRef<any>;
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  pagination: PaginationModel = defaultPagination;

  rows: any[] = [];
  columns: ColDef[] = [];
  routeSheetDetails: any[] = [];
  selectedRouteSheetId: number;
  modalRef!: NgbModalRef;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  isGatewayUser: boolean = false;
  state: TableState = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    routeSheetID: '',
    description: '',
    zone: '',
    areas: '',
    creationDate: '',
    status: '',
    action: ''
  };

  packageTranslations = {
    select: '',
    zone: '',
    client: '',
    tracking: '',
    description: ''
  };

  constructor(private modalService: NgbModal,
    private translate: TranslateService,
    private manifestService: ManifestService,
    private messages: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private loading: LoadingService,
    private credentailsService: CredentialsService) {

    this.isGatewayUser = this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.ReOpenRoadmap, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.ReOpenRoadmap, PermissionActionEnum.Update);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;

    const routers = inject(Router);
    if (!this.hasUpdate || !this.isGatewayUser) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true });
    }

    this.translate.get([
      'Labels.Actions',
      'RouteSheet.ID',
      'RouteSheet.Description',
      'RouteSheet.Zone',
      'RouteSheet.Areas',
      'RouteSheet.CreationDate',
      'RouteSheet.Status'])
      .subscribe(
        translations => {
          this.translations.action = translations['Labels.Actions'];
          this.translations.routeSheetID = translations['RouteSheet.ID'];
          this.translations.description = translations['RouteSheet.Description'];
          this.translations.zone = translations['RouteSheet.Zone'];
          this.translations.areas = translations['RouteSheet.Areas'];
          this.translations.creationDate = translations['RouteSheet.CreationDate'];
          this.translations.status = translations['RouteSheet.Status'];
        });

    this.translate.get([
      'Labels.Actions',
      'RouteSheet.Zone',
      'RouteSheet.Client',
      'RouteSheet.Tracking',
      'RouteSheet.Description'
    ])
      .subscribe(
        translations => {
          this.packageTranslations.select = translations['Labels.Actions'];
          this.packageTranslations.zone = translations['RouteSheet.Zone'];
          this.packageTranslations.client = translations['RouteSheet.Client'];
          this.packageTranslations.tracking = translations['RouteSheet.Tracking'];
          this.packageTranslations.description = translations['RouteSheet.Description'];
        });
  }

  ngAfterViewInit(): void {
    this.loading.show();
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.columns.push({ field: 'routeSheetID', label: this.translations.routeSheetID, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.columns.push({ field: 'zone', label: this.translations.zone, sortable: true });
    this.columns.push({ field: 'areas', label: this.translations.areas, sortable: true });
    this.columns.push({ field: 'creationDate', label: this.translations.creationDate, type: "date", sortable: true });
    this.columns.push({ field: 'status', label: this.translations.status, sortable: true });
    this.loading.hide();
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.state.pageSize = this.pagination.ps = 25;
    this.getRouteSheetDetail();
  }

  getRouteSheetDetail() {
    this.loading.show();
    this.manifestService.GetRouteSheetDetail(0, 3, this.credentailsService.credentials?.user.companyId?.toString(), this.state.pageSize, this.state.page, this.state.searchTerm).subscribe((res: any) => {
      this.pagination.ti = res.total;
      this.routeSheetDetails = res.list.map((item: any) => ({
        ...item,
        selected: false
      }));
      this.loading.hide();

    });
  }

  onCheckboxChange(selectedItem: any): void {
    if (!selectedItem.selected) {
      return;
    }

    this.routeSheetDetails.forEach(item => {
      if (item.routeSheetID !== selectedItem.routeSheetID) {
        item.selected = false;
      }
    });
    selectedItem.selected = true;

    const selectedIds = [selectedItem.routeSheetID];

    Swal.fire({
      text: this.messages.getTranslate('RouteSheet.ConfirmReopenMessage'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.manifestService.UpdateRoadMapStatus(selectedIds).subscribe((res: any) => {
          if (res) {
            Swal.fire({
              icon: 'success',
              title: this.translations.action,
              text: this.messages.getTranslate('RouteSheet.ReopenRoadmapSuccess'),
              confirmButtonText: this.messages.getTranslate('Labels.Confirm')
            });
            this.removeRoadmapFromList(selectedIds[0]);
          } else {
            Swal.fire({
              icon: 'error',
              title: this.translations.action,
              text: this.messages.getTranslate('RouteSheet.ReopenRoadmapError'),
              confirmButtonText: this.messages.getTranslate('Labels.Confirm')
            });
          }
        });
      }
    });
  }

  removeRoadmapFromList(routeSheetId: number): void {
    this.routeSheetDetails = this.routeSheetDetails.filter((item) => item.routeSheetID !== routeSheetId);
  }

  onScannerEvent(event: any): void {
  }

  onListRefresh(event: any): void {
    if (event) {
      this.getRouteSheetDetail()
    }
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

    this.getRouteSheetDetail();
  }
}