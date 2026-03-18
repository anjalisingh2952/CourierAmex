import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, forkJoin, lastValueFrom, finalize } from 'rxjs';
import { newPackageModel, PackageModel, PackagePriceUpdate } from '@app/features/package/models/package.model';
import { PackageItemModel } from '@app/features/package/models/package-item.model';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { PackageService, PackageItemService } from '../../services';
import Swal from 'sweetalert2';
import { PackageStatusModel } from '@app/features/general';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PackagePrestudyAdditemComponent } from '../../components/package-prestudy-additem/package-prestudy-additem.component';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pre-study',
  templateUrl: './pre-study.component.html',
  styleUrls: ['./pre-study.component.scss']
})
export class PreStudyComponent implements OnInit {
  @ViewChild("deleteCellTemplate") deleteCellTemplate!: TemplateRef<any>;
  @ViewChild("editCellTemplate") editCellTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;

  @ViewChild('form', { read: NgForm }) form!: NgForm;
  @HostListener('window:keydown', ['$event'])

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F2' || event.key === 'F12') {
      event.preventDefault(); // Prevent default F2 action (like opening help)
      //this.handleSubmit(this.form);
    }
    else if (event.key === 'F4') {
      event.preventDefault(); // Prevent default F2 action (like opening help)
      //this.form.form.patchValue({ hasInvoice: true });
    }
  }
  active = 1;
  modalListDetail: any;

  pagination: PaginationModel = defaultPagination;
  selectedCompany = 0;
  selectedPackageNumber = 0;
  selectedStatus: PackageStatusModel | undefined = undefined;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();
  private readonly _PackageItems = new BehaviorSubject<PackageItemModel[]>([]);
  packageItems$ = this._PackageItems.asObservable();


  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  isGatewayUser: boolean = false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  packageItemList: PackageItemModel[] = [];
  package: PackageModel = newPackageModel;

  isPermission: boolean = false;
  isDocument: boolean = false;
  isHighPrice: boolean = false;
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  translations = {
    number: '',
    brandId: '',
    modelId: '',
    series: '',
    description: '',
    composition: '',
    quantity: '',
    unitCost: '',
    origin: '',
    state: '',
    style: '',
    color: '',
    size: '',
    item: '',
    invoice: '',
    edit: '',
    update: '',
    delete: '',
    action: '',
    isEdit: false
  };
  constructor(
    private modalService: NgbModal,
    private NgbNavModule: NgbNavModule,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private packageService: PackageService,
    private packageItemService: PackageItemService,
    private messages: MessageService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.PackagePreStudy, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.PackagePreStudy, PermissionActionEnum.Update);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.PackagePreStudy, PermissionActionEnum.Delete);

    this.translate.get([
      'Labels.Number',
      'PackagePreStudy.brandId',
      'PackagePreStudy.modelId',
      'PackagePreStudy.series',
      'PackagePreStudy.description',
      'PackagePreStudy.composition',
      'PackagePreStudy.quantity',
      'PackagePreStudy.unitCost',
      'PackagePreStudy.origin',
      'PackagePreStudy.state',
      'PackagePreStudy.style',
      'PackagePreStudy.color',
      'PackagePreStudy.item',
      'PackagePreStudy.invoice',
      'Labels.Actions',
      'PackagePreStudy.update',
      'PackagePreStudy.delete'
    ])
      .subscribe(
        translations => {
          this.translations.brandId = translations['PackagePreStudy.brandId'];
          this.translations.modelId = translations['PackagePreStudy.modelId'];
          this.translations.series = translations['PackagePreStudy.series'];
          this.translations.description = translations['PackagePreStudy.description'];
          this.translations.composition = translations['PackagePreStudy.composition'];
          this.translations.quantity = translations['PackagePreStudy.quantity'];
          this.translations.unitCost = translations['PackagePreStudy.unitCost'];

          this.translations.origin = translations['PackagePreStudy.origin'];
          this.translations.state = translations['PackagePreStudy.state'];
          this.translations.style = translations['PackagePreStudy.style'];
          this.translations.color = translations['PackagePreStudy.color'];
          this.translations.item = translations['PackagePreStudy.item'];
          this.translations.invoice = translations['PackagePreStudy.invoice'];

          this.translations.action = translations['Labels.Actions'];
          this.translations.update = translations['PackagePreStudy.update'];
          this.translations.delete = translations['PackagePreStudy.delete'];
        });



  }
  ngOnInit(): void {
    this.loadAttributes();
    this.setDefaultCompany();
  }

  setDefaultCompany() {
    this.companies$.subscribe(companies => {
      if (this.credentailsService.isGatewayUser() && companies.length > 0) {
        const userCia = companies.find(c => c.id === this.credentailsService.credentials?.user.companyId);

        if (userCia) {
          this.selectedCompany = userCia.id;
        }
      }
    });
  }

  ngAfterViewInit(): void {

    // this.columns.push({ field: 'edit', label: this.translations.edit, contentTemplate: this.editCellTemplate });
    //this.columns.push({ field: 'delete', label: this.translations.delete, contentTemplate: this.deleteCellTemplate });
    this.columns.push({ field: 'brandId', label: this.translations.brandId, sortable: true });
    this.columns.push({ field: 'modelId', label: this.translations.modelId, sortable: true });
    this.columns.push({ field: 'series', label: this.translations.series, sortable: true });
    this.columns.push({ field: 'description', label: this.translations.description, sortable: true });
    this.columns.push({ field: 'composition', label: this.translations.composition, sortable: true });
    this.columns.push({ field: 'quantity', label: this.translations.quantity, sortable: true });
    this.columns.push({ field: 'unitCost', label: this.translations.unitCost, sortable: true, cssClass: 'text-end' });
    this.columns.push({ field: 'origin', label: this.translations.origin, sortable: true });
    this.columns.push({ field: 'state', label: this.translations.state, sortable: true });
    this.columns.push({ field: 'style', label: this.translations.style, sortable: true });
    this.columns.push({ field: 'color', label: this.translations.color, sortable: true });
    this.columns.push({ field: 'item', label: this.translations.item, sortable: true });
    this.columns.push({ field: 'invoice', label: this.translations.invoice, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, contentTemplate: this.actionTemplate });


    this.changeDetectorRef.detectChanges();
  }

  onPackageNumberChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.selectedPackageNumber = parseInt(inputValue);
    // Example: Updating the packageItemList with a new entry
    //debugger
    this.loading.show();

    this.packageService.GetByPackageNumber(this.selectedCompany, this.selectedPackageNumber).subscribe(res => {
      if (res.success) {
        this.loading.hide();
        this.package = res.data || {} as PackageModel;
        this.loading.show();
        this.packageItemService.getPaged$({ ...defaultPagination, ps: 5000 }, this.selectedPackageNumber).subscribe(res => {
          this.packageItemList = res.data;
          this.loading.hide();
        })
      }
      else {
        this.loading.hide();
        Swal.fire("Error",res.message,"error")
      }
    })



    // this._entityState.next({ ...this._entityState.value, id });
  }

  private loadAttributes(): void {
    this.loading.show();
    this._companies.next([]);
    companies: this.commonService.getCompanies$(),
      forkJoin({
        companies: this.commonService.getCompanies$(),
        //packageStatus: this.commonService.getPackageStatus$()
      }).pipe(
        finalize(() => {
          this.loading.hide();
        })
      )
        .subscribe({
          next: (res) => {
            if (res.companies && res.companies.length > 0) {
              this._companies.next(res.companies ?? []);
            }
          },
          error: (error) => {
            console.error(error);
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          }
        });
  }

  protected selectCompany(id: number): void {
    console.log(id);
    this.selectedCompany = id;
  }

  protected editrow(entity: PackageItemModel, field: string): void {
    this.loading.show();
    const selectedPackageItemId = entity.id;
    this.packageItemService.getById(selectedPackageItemId).subscribe({
      next: (response) => {
        if (response) {
          console.log('Package Item fetched successfully:', response);

          //debugger
          const modalRef = this.modalService.open(PackagePrestudyAdditemComponent, {
            size: 'xl',
            backdrop: 'static',
            keyboard: false,
          });

          modalRef.componentInstance.additem = response.data;
          this.loading.hide();
          modalRef.result.then(
            (result: boolean) => {
              if (result) {
                Swal.fire("Success", "Package Item updated successfully!", "success");
                this.loading.show();
                this.packageItemService.getPaged$({ ...defaultPagination, ps: 5000 }, this.selectedPackageNumber).subscribe(res => {
                  this.loading.hide();
                  this.packageItemList = res.data;
                  console.log("this.onPackageNumberChange", res);
                })
              } else {
                Swal.fire("Error","Error Occured while adding Package Item.","error")
              }
            },
            () => {
              console.log('Modal dismissed.');
            }
          );




        }
        else {
          console.error('Error fetching package Item:', "");

        }
      },
      error: (error) => {
        console.error('Error fetching package Item:', error);

      },
    });
  }

  protected deleterow(entity: PackageItemModel, field: string): void {

    if (confirm('Do you want to delete this Package Item ?')) {
      const selectedPackageItemId = entity.id;
      this.loading.show();
      this.packageItemService.delete$(selectedPackageItemId).subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire("Success", "Package Item Deleted successfully.", "success");
            this.loading.hide();
          }
          else {
            Swal.fire("Error", "Error Deleting package Item.", "success");
            this.loading.hide();
          }
        },
        error: (error) => {
          Swal.fire("Error", "Error Deleting package Item.", "success");
          this.loading.hide();
        },
      });
    }
  }

  protected async UpdatePrice() {

    if (this.selectedCompany == 0 || this.selectedCompany == undefined) {
      Swal.fire("Error", "Please Select A Company and enter Package Number to proceed.", "error");
    }

    if (this.selectedPackageNumber == 0 || this.selectedPackageNumber == undefined) {
      Swal.fire("Error", "Please Enter Package Number to proceed.", "error");
    }

    if (this.package.price > 100.00 && !this.isHighPrice) {
      Swal.fire("Error", "Please Select the option 'Has a price greater than $100.' to proceed.", "error");
      return;
    }

    //debugger
    const priceUpdateModel: PackagePriceUpdate = {
      description: this.package.description,
      price: this.package.price,
      isDocument: this.isDocument,
      isPermission: this.isPermission,
      packageNumber: this.package.number ?? 0
    }
    this.loading.show();
    this.packageService.PackagePriceUpdateByNumber$(priceUpdateModel).subscribe(res => {
      if (res.success) {
        this.loading.hide();
        Swal.fire("Success", "Price and Description updated successfully.", "success");
      }
      else {
        this.loading.hide();
        Swal.fire("Error", "Error Occured while updating Price and Description.", "error");
      }
    })
  }

  protected additems() {

    if (this.selectedPackageNumber == 0 || this.selectedPackageNumber == undefined) {
      Swal.fire("Warning", "Please enter a Package Number.", "warning")
    }
    else {

      const modalRef = this.modalService.open(PackagePrestudyAdditemComponent, {
        size: 'xl',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.packageNumber = this.selectedPackageNumber;

      modalRef.result.then(
        (result: boolean) => {
          if (result) {
            Swal.fire("Success", "Package Item added successfully!", "success")
            // You can refresh data or perform other actions
            this.packageItemService.getPaged$({ ...defaultPagination, ps: 5000 }, this.selectedPackageNumber).subscribe(res => {
              this.loading.hide();
              this.packageItemList = res.data;
              console.log("this.onPackageNumberChange", res);
            })
          } else {
            console.log('Package addition cancelled.');
            Swal.fire("Error", "Error Occured while adding Package Item.", "error")
          }
        },
        () => {
          console.log('Modal dismissed.');
        }
      );
    }
  }
}
