import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CredentialsService } from '@app/@core';
import { NewPackageItemModel, PackageItemModel } from '@app/features/package/models/package-item.model';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ManifestModel } from '@app/models/manifest.model';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PackageItemService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-package-prestudy-additem',
  templateUrl: './package-prestudy-additem.component.html',
  styleUrls: ['./package-prestudy-additem.component.scss']
})
export class PackagePrestudyAdditemComponent {

  @Input() entity!: PackageItemModel;
  @Input() packageNumber!: number;
  isOpened: boolean = false
  submitted = false;
  CompanyId = 0;
  ManifestId = 0;
  criteria = "";
  selectAll: boolean = false;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  selectedCount = 0;
  manifestType: string = '';
  buttonClicked: boolean = false;
  additem: PackageItemModel = NewPackageItemModel;
  constructor(
    private credentailsService: CredentialsService,
    public activeModal: NgbActiveModal,
    private packageItemService: PackageItemService,
    private toastr: ToastrService

  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);
  }



  ngOnInit(): void {


  }

  ngOnChanges(changes: SimpleChanges): void {



  }


  openModalWithPendingData(form: any) {
    debugger
    if (form.invalid) {
      this.submitted = true;
      this.buttonClicked = true; // To trigger validation messages
      Swal.fire("Error","Please fill in all required fields.","error");
      return;
    }

    if (this.additem.id == 0 || this.additem.id == undefined) {
      this.additem.number = this.packageNumber;
    }

    const additemsModel = this.additem;
    console.log(additemsModel);
    debugger

    this.packageItemService.create(additemsModel).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Package Item created successfully:', response);
         
          this.closeModalWithResult(true);
        }
        else {
          console.error('Error creating package Item:', "");
          this.closeModalWithResult(false);
        }
      },
      error: (error) => {
        console.error('Error creating package Item:', error);
        this.closeModalWithResult(false);
      },
    });
  }
  onCancel(): void {
    this.activeModal.dismiss();
  }

  closeModalWithResult(isSuccess: boolean) {
    
    this.activeModal.close(isSuccess);
  }

  dismissModal() {
  
    this.activeModal.dismiss();
  }
}
