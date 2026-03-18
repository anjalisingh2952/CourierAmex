import { ChangeDetectorRef, Component, Output } from '@angular/core';
import { CredentialsService, LoadingService } from '@app/@core';
import { AreaService, ZoneModel, ZoneService } from '@app/features/general';
import { ManifestService } from '@app/features/manifest/services';
import { PaymentService } from '@app/features/payment/services';
import { RouteInsertModel } from '@app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-route-sheet',
  templateUrl: './create-route-sheet.component.html',
  styleUrl: './create-route-sheet.component.scss'
})
export class CreateRouteSheetComponent {
  @Output() onListRefresh: any;

  zones: any[] = [];
  areas: any[] = [];
  deliveryTypes: any[] = [];
  pointOfSaleList: any[] = [];
  routeSheetName: string = '';
  selectedPointOfSale: any = 0;
  selectedDeliveryType: any = 0;
  selectedStop: any = 0;
  selectedZone: any = 0;
  selectedArea: any = 0;
  isBranch: boolean = false;
  constructor(public activeModal: NgbActiveModal,
    private zoneService: ZoneService,
    private crendentialService: CredentialsService,
    private cd: ChangeDetectorRef,
    private loading: LoadingService,
    private areaService: AreaService,
    private manifestService: ManifestService,
    private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loading.show();
    this.zoneService.getPaged$({ pi: 1, ps: 1000 }, this.crendentialService.credentials?.user.companyId, 0).subscribe((res) => {
      this.zones = res.data;
      this.loading.hide();
    })

    this.manifestService.GetDeliveryTypes().subscribe((res: any) => {
      this.deliveryTypes = res.data;
    });
  }

  saveAndClose() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.dismiss();
  }

  onZoneChange(event: Event) {
    this.loading.show();
    const selectElement = event.target as HTMLSelectElement;
    this.selectedZone = selectElement.value;
    this.areaService.getPaged$({ pi: 1, ps: 1000 }, this.crendentialService.credentials?.user.companyId, 0, this.selectedZone).subscribe((res) => {
      this.areas = res.data;
      this.loading.hide();
      this.cd.detectChanges();
    })
  }

  onDeliveryTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedDeliveryType = Number(selectedValue);

    if (this.selectedDeliveryType === 1) {
      this.isBranch = true;
      var companyId = this.crendentialService.credentials?.user.companyId ?? 0
      this.paymentService.getPointOfSale(companyId, this.crendentialService.credentials?.user.username ?? '', 1).subscribe({
        next: (list: any) => {
          this.pointOfSaleList = list;
          
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          this.loading.hide();
        }
      })
    }
    else {
      this.isBranch = false;
    }
  }

  onPointOfSaleChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedPointOfSale = Number(selectedValue);
  }

  onSelectStop(selectedArea: any) {
    this.areas.forEach(area => area.selected = false);
    selectedArea.selected = true;
    this.selectedStop = selectedArea;
  }

  createRoute() {
    if (!this.routeSheetName) {
      Swal.fire({
        icon: 'warning',
        title: 'Route description required!',
        text: 'Please enter a description for the route.',
        confirmButtonText: 'OK'
      });
      return;
    }

    var obj: RouteInsertModel = {
      description: this.routeSheetName,
      userId: this.crendentialService.credentials?.user.id ?? "",
      status: 0,
      zoneId: this.selectedZone,
      deliveryTypeId: this.selectedDeliveryType,
      PointOfSaleId: this.selectedPointOfSale,
      companyId: this.crendentialService.credentials?.user.companyId?.toString() ?? "0",
      packageIds: []
    }
    this.loading.show();

    this.manifestService.insertRoute(obj).subscribe(async resp => {
      if (resp) {
        Swal.fire({
          icon: 'success',
          title: 'Route created!',
          text: `Route has been successfully created with route Id is ${resp}.`,
          confirmButtonText: 'OK'
        });
        this.saveAndClose()
        this.onListRefresh.emit(true);

        this.loading.hide();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error creating route!',
          text: 'An error occurred while creating the route.',
          confirmButtonText: 'OK'
        });
        this.loading.hide();
      }
    })
  }
}
