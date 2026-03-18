import { ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { CredentialsService, LoadingService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { PaymentService } from '@app/features/payment/services';
import { PageOptionsDefault } from '@app/models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CashierModel } from '../../models';
import { ClientCashierService } from '../../services';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cashier-payment',
  templateUrl: './cashier-payment.component.html',
  styleUrl: './cashier-payment.component.scss'
})
export class CashierPaymentComponent {
  @Input() users: any[] = [];
  @ViewChild('openModalRef') openModalRef!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplateForselected") actionTemplateForselected!: TemplateRef<any>;
  @ViewChild("actionTemplateForList") actionTemplateForList!: TemplateRef<any>;
  @Input() entity!: CashierModel;
  @Input() emptyLabel: string = 'No Data';
  subPaymentTypesList: any[] = [];
  selectedSubPaymentTypesList: any[] = [];
  userList: any[] = [];
  columns: ColDef[] = [];
  rows: any[] = [];
  columnsSelectedType: ColDef[] = [];
  rowsSelectedType: any[] = [];
  columnsAllType: ColDef[] = [];
  rowsAllType: any[] = [];

  modalRef!: NgbModalRef;
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'ASC',
  };

  translations = {
    action: '',
    user: '',
    userNumber: '',
    description: '',
    SelectedType: '',
  };

  selectedCashier = 0;
  selectAll: boolean = false;
  selectAlllForAllList: boolean = false;
  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private paymentService: PaymentService,
    private creditCardService: CredentialsService,
    private cashierService: ClientCashierService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private loading: LoadingService
  ) {
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.initSelectedCashierFromRoute();
    this.getSubPaymentTypes();
  }

  ngAfterViewInit(): void {
    this.initializeColumns();
    this.cd.detectChanges();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.open(template, {
      centered: true,
      backdrop: 'static',
      windowClass: 'modal-xl'
    });
  }

  closeModal() {
    this.modalRef?.close();
  }

  private loadTranslations() {
    this.translate
      .get(['Labels.Actions', 'Labels.Name'])
      .subscribe(translations => {
        this.translations = {
          action: translations['Labels.Actions'],
          SelectedType: translations['Labels.Actions'],
          user: translations['Labels.Name'],
          userNumber: translations['Labels.Name'],
          description: translations['Labels.Name']
        };
        this.initializeColumns();
      });
  }

  private initSelectedCashierFromRoute() {
    this.route.queryParams
      .pipe(
        tap(params => console.log('Query params:', params)),
        switchMap((params: { id?: string }) => {
          this.selectedCashier = +(params.id ?? 0);
          return of(null);
        })
      )
      .subscribe();
  }

  private initializeColumns() {
    this.columns = [
      {
        field: 'action',
        label: this.translations.action,
        sortable: false,
        cssClass: 'text-end',
        contentTemplate: this.actionTemplate
      },
      {
        field: 'userNumber',
        label: this.translations.userNumber,
        sortable: true
      }
    ];

    this.columnsSelectedType = [
      {
        field: 'action',
        label: this.translations.SelectedType,
        sortable: false,
        cssClass: 'text-end',
        contentTemplate: this.actionTemplateForselected
      },
      {
        field: 'description',
        label: this.translations.description,
        sortable: true
      }
    ];

    this.columnsAllType = [
      {
        field: 'action',
        label: this.translations.SelectedType,
        sortable: false,
        cssClass: 'text-end',
        contentTemplate: this.actionTemplateForList
      },
      {
        field: 'description',
        label: this.translations.description,
        sortable: true
      }
    ];
  }

  assignedSubPayment() {
    const selectedType = this.subPaymentTypesList.filter(item => item.selected);
    if (selectedType.length > 0) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to assign selected sub payment types.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, assign',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          selectedType.forEach(item => {
            item.selected = false;
            this.selectedSubPaymentTypesList.push(item);
          });
          this.subPaymentTypesList = this.subPaymentTypesList.filter(item => !selectedType.includes(item));  
          Swal.fire('Assigned!', 'Sub payment types have been assigned to cashier.', 'success');
        }
      });
    } else {
      Swal.fire('Warning', 'Please select sub payment types.', 'warning');
    }
  }
  
  removeSubPayment() {
    debugger
    const fromAll = this.selectedSubPaymentTypesList.filter(item => item.selected);
    if (fromAll.length > 0) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to remove selected sub payment types.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          fromAll.forEach(item => {
            item.selected = false;
            this.subPaymentTypesList.push(item);
          });
            this.selectedSubPaymentTypesList = this.selectedSubPaymentTypesList.filter(item => !fromAll.includes(item));
  
          Swal.fire('Removed!', 'Sub payment types have been removed from Cashier.', 'success');
        }
      });
    } else {
      Swal.fire('Warning', 'Please select sub payment types.', 'warning');
    }
  }
  
  getSubPaymentTypes() {
    const companyId = this.creditCardService.credentials?.user.companyId ?? 0;
    
    this.paymentService.getSubPaymentTypeByPaymentId(companyId, 0, 0).subscribe((response: any) => {
      this.subPaymentTypesList = response.map((item: any) => ({ ...item, selected: false }));
      
      this.paymentService.getSubPaymentTypeByPaymentId(companyId, 0, this.selectedCashier).subscribe((response: any) => {
        this.selectedSubPaymentTypesList = response.map((item: any) => ({ ...item, selected: false }));

        this.subPaymentTypesList = this.subPaymentTypesList.filter(
          item => !this.selectedSubPaymentTypesList.some(selected => selected.subPaymentId === item.subPaymentId)
        );
      });
    });
  }

  toggleSelectAll() {
    this.selectedSubPaymentTypesList.forEach(row => {
      row.selected = this.selectAll;
    });
  }

  toggleSelectAllForAllList(){
    this.subPaymentTypesList.forEach(row => {
      row.selected = this.selectAlllForAllList;
    });
  }
}