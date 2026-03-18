
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { GenericAction } from '@app/models';

@Component({
  selector: 'app-price-image-maintenanc-modal',
  templateUrl: './price-image-maintenanc-modal.component.html',
})
export class PriceImageMaintenancModalComponent{
  @Input() openMode: string;
  @Input() file: string;
  showSincronized = false;
  constructor(
    public activeModal: NgbActiveModal,
  ) {}



  ngOnInit() {
  }


  onCancel() {
    this.activeModal.dismiss();
  }
}
