import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerModel } from '@app/features';
import { PackageNotesModel, newPackageNotes} from '@app/features/package/models';
// import { SearchCustomerComponent } from '@app/@shared';
import { CommodityModel, CompanyModel, ProductModel } from '@app/features/company';
import { CommonService, MessageService } from '@app/@core';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { GenericAction } from '@app/models';

@Component({
  selector: 'app-package-note-modal',
  templateUrl: './package-notes-modal.component.html',
})
export class PackageNotesModalComponent {
  @ViewChild('form', { read: NgForm }) form!: NgForm;
  @Input() noteData: PackageNotesModel; // Datos iniciales
  @Input() openMode: string;
  @Input() customerCode: string;
  @Input() courierNumber: string;
  @Input() nombreCliente: string;
  @Input() companyId: number;

  @Output() save: EventEmitter<PackageNotesModel> =
    new EventEmitter<PackageNotesModel>(); // Evento para guardar
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>(); // Evento para cancelar
  today: Date = new Date();
  selectionVencimiento: string = 'vencimiento';
  items = [];
  showSincronized = false;
  
  customer?: CustomerModel;
  customerSearch = {
    isValid: false,
    isInvalid: false,
    touched: false
  };

  onCustomerChange = new EventEmitter<ProductModel>();

  constructor(
    public activeModal: NgbActiveModal,
    private commonService: CommonService,
    private messageService: MessageService
  ) {}

  setCustomer(customerCode: string): void {
    if (customerCode.length > 0) {
      this.commonService.getCustomerByCode$(customerCode).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.customer = res.data;
          } else {
            this.customer = undefined;
            Swal.fire(
              this.messageService.getTranslate('Labels.Error'),
              this.messageService.getTranslate('Labels.NotFound'),
              'error'
            );
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire(
            this.messageService.getTranslate('Labels.Error'),
            this.messageService.getTranslate('Labels.InternalError'),
            'error'
          );
        },
      });
    }
  }

  updateCreatedAtDate(dateString: string): void {
    this.noteData.createdAt = dateString ? new Date(dateString) : new Date();
  }

  updateDueDate(dateString: string): void {
    this.noteData.dueDate = dateString ? new Date(dateString) : new Date();
  }

  ngOnInit() {
    if (this.noteData && Object.keys(this.noteData).length > 0) {
      if (this.noteData.codigo && !this.noteData.courier) {
        if (!this.noteData.dueDate) {
          this.selectionVencimiento = 'vencimiento';
          this.noteData.dueDate = new Date(); // Asigna la fecha de hoy como valor por defecto
        }
      }
      // Si se recibe cliente y número de courier, la fecha de vencimiento se establece en 2099-01-01
      else if (this.noteData.codigo && this.noteData.courier) {
        this.selectionVencimiento = 'courier';
        this.noteData.dueDate = new Date('2099-01-01');
      }
    } else {
      this.noteData = {
        codigo: '',
        courier: '',
        createdAt: new Date(),
        dueDate: new Date(),
        message: '',
        idUser: '',
        sincronized: false,
        companyName: '',
        compannia: '',
        nombreCompleto: '',
        id: 0,
        status: 0,
        companyId: 0
      };
      this.noteData = { ...newPackageNotes };
      this.noteData.codigo = this.customerCode;
      this.noteData.courier = this.courierNumber;
      this.noteData.nombreCompleto = this.nombreCliente;
      this.noteData.message = '';
      //Si trae algo en el campo courier selecciona por default el radio de courier de lo contrario toma el default
      if (this.noteData.courier) {
        this.selectionVencimiento = 'courier';
      }
    }
  }

  onSelectionChange(choice: string) {
    this.selectionVencimiento = choice;
    if(choice === 'vencimiento'){
      this.noteData.courier = '';
    }
  }

  onSave(form: NgForm): void {
    if (form.valid) {
      this.save.emit(this.noteData);
      this.activeModal.close(); // Cierra el modal
    } else {
      form.form.markAllAsTouched();
    }
  }

  onSearchCustomer(action: GenericAction<CustomerModel>): void {
    switch (action.action) {
      case 'update':
        this.onCustomerChange.emit({
          id: 0,
          isSelected: false,
          name: '' + action.data?.code,
        });
        if(action.data){
          this.noteData.codigo = action.data.code;
          this.noteData.nombreCompleto = action.data.fullName ? action.data.fullName : action.data.name;
        }
        break;
      case 'click':
        this.onCustomerChange.emit({
          id: 0,
          isSelected: true,
          name: '' + action.data?.code,
        });
        if(action.data){
          this.noteData.codigo = action.data.code;
          this.noteData.nombreCompleto = action.data.fullName ? action.data.fullName : action.data.name;
        }
        break;
      case 'clear':
        this.onCustomerChange.emit({ id: 0, isSelected: false, name: '' });
        this.noteData.codigo = '';
        this.noteData.nombreCompleto = '';
        break;
    }
    
  }

  onCancel() {
    this.cancel.emit();
    this.activeModal.dismiss();
  }
}
