import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CredentialsService, MessageService } from '@app/@core';
import { PackageCategoryModel } from '@app/features/package/models/package.model';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ManifestModel } from '@app/models/manifest.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PackingPackagesPackagesListComponent } from '../packing-packages-packages-list/packing-packages-packages-list.component';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-packing-packages-list',
  templateUrl: './packing-packages-list.component.html'
})
export class PackingPackagesListComponent {

  @Input() entity!: ManifestModel;
  @Input() packages: any;
  @Output() fetchModalData = new EventEmitter<{ manifestId: number; companyId: number, isPending: boolean }>();
  @Input() listDetailForModal: any;

  CompanyId = 0;
  ManifestId = 0;
  criteria = "";
  selectAll: boolean = false;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  selectedCount = 0;
  manifestType: string = '';
  buttonClicked: boolean = false;
  constructor(
    private credentailsService: CredentialsService,
    private messages: MessageService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);
  }

  ngOnInit(): void {
    if (!this.packages) {
      this.packages = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['packages'] && changes['packages'].currentValue) {
      const { manifestType, manifestId, companyId } = changes['packages'].currentValue;
      this.manifestType = manifestType
        ? (manifestType === 1 ? 'Arial' : 'Ship/Normal')
        : '';
      this.ManifestId = manifestId;
      this.CompanyId = companyId;
    }
    if (changes['listDetailForModal'] && changes['listDetailForModal'].currentValue) {
    }
  }

  openModal(isPending: boolean) {
    if (!this.isValidSelection()) {
      const title = this.messages.getTranslate('Labels.Warning');
      const message = this.messages.getTranslate(
        isPending ? 'warnings.SelectManifestPending' : 'warnings.SelectManifestSummary'
      );
      Swal.fire(title, message, 'warning');
      return;
    }
    this.fetchModalData.emit({ manifestId: this.ManifestId, companyId: this.CompanyId, isPending });
  }

  private isValidSelection(): boolean {
    return this.ManifestId > 0 && this.CompanyId > 0;
  }

  openModalWithData() {
    this.openModal(false);
  }

  openModalWithPendingData() {
    this.openModal(true);
  }
}
