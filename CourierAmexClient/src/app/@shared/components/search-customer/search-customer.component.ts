import { Component, EventEmitter, HostListener, Input, OnDestroy } from "@angular/core";

import { debounceTime, distinctUntilChanged, map, Observable, of, OperatorFunction, Subject, switchMap, tap } from "rxjs";
import { NgbModal, NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import Swal from 'sweetalert2';

import { GenericAction, PagedResponse, PaginationModel } from "@app/models";
import { CustomerModel } from "@app/features";
import { CommonService, MessageService } from "@app/@core";
import { SearchCustomerDialogComponent } from "../search-customer-dialog/search-customer-dialog.component";

@Component({
  selector: 'shared-search-customer',
  templateUrl: './search-customer.component.html',
  inputs: ['companyId'],
  outputs: ['executeAction']
})
export class SearchCustomerComponent implements OnDestroy {
  executeAction: EventEmitter<GenericAction<CustomerModel>> = new EventEmitter<GenericAction<CustomerModel>>();
  companyId: number = 0;
  @Input() isLocked: boolean = false;
  customerSearchValue: string = '';
  customerSearch = {
    loading: false,
    failed: false
  };
  customer?: CustomerModel;
  selectOnExact = true;

  get isCustomerSelected(): boolean {
    return typeof (this.customer) === 'object' && this.customer?.id > 0;
  }

  private destroy$ = new Subject<void>();

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.key === "F3")) {
      this.openDialog();
    } 
  }

  constructor(
    private dialog: NgbModal,
    private commonService: CommonService,
    private messageService: MessageService
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  init(): void {
    this.clearCustomer(false);
  }


  @Input()
  set customerCode(value) {
      this.setCustomer(value);
  }

  get customerCode() {
      return this.customerSearchValue;
  }

  setCustomer(customerCode: string): void {
    if (customerCode.length > 0) {
      this.customerSearchValue = customerCode;
      this.customerSearchbyTerm(customerCode)
        .subscribe({
          next: (res) => {
            if (res.length) {
              this.customer = res[0];
              this.executeAction.emit({
                action: "update",
                data: this.customer
              });
            } else {
              this.customer = undefined;
              Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.NotFound'), 'error');
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        })
    } else {
      this.clearCustomer();
    }
  }

  openDialog(): void {
    const modalRef = this.dialog.open(SearchCustomerDialogComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.companyId = this.companyId;

    modalRef.result
      .then((res: CustomerModel | undefined) => {
        if (res?.id) {
          this.customer = res;
          this.executeAction.emit({
            action: "click",
            data: this.customer
          });
        }
      });
  }

  searchCustomer: OperatorFunction<string, readonly CustomerModel[]> = text$ =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((term) => this.customerSearchbyTerm(term)),
      tap(items=>{
        if(items.length === 1){
          const entity = items[0];
          //this.customerTypeHead.nativeElement.value = this.customerResultFormatter(entity);
          this.customer = entity;
          this.executeAction.emit({
            action: "update",
            data: entity
          });
        }
      })
    );

  customerResultFormatter(entity: CustomerModel): string {
    const dni = entity.code && entity.code.length > 0 ? `${entity.code} - ` : '';
    return `${dni}${entity.fullName}`;
  }

  customerInputFormatter(entity: CustomerModel): string {
    if (entity) {
      const dni = entity.code && entity.code.length > 0 ? `${entity.code} - ` : '';
      return `${dni}${entity.fullName}`;
    } else {
      return '';
    }
  }

  onSelectCustomer($event: NgbTypeaheadSelectItemEvent): void {
    if ($event.item) {
      this.customer = $event.item as CustomerModel;
      this.executeAction.emit({
        action: "update",
        data: this.customer
      });
    } 
  }

  clearCustomer(emit: boolean = true): void {
    this.customer = undefined;
    this.customerSearchValue = '';
    if (emit) {
        this.executeAction.emit({
        action: 'clear'
      });
    }
  }

  private customerSearchbyTerm(term: string): Observable<CustomerModel[]> {
    if (term.length >= 3) {
      let pagination: PaginationModel = {
        c: term,
        ps: 9999,
        pi: 1,
        s: 'Name ASC',
        st: 2,
        ti: 0,
        tr: 0
      };

      return this.commonService.getCustomersPagedByCompany$(pagination, this.companyId)
        .pipe(
          map((value: PagedResponse<CustomerModel>) => value.data)
        );
    } else {
      return of([]);
    }
  }
}