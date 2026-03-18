import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { ProductModel } from '@app/features/company/models';
import { MessageService } from '@app/@core';

@Component({
  selector: 'select-products',
  templateUrl: './select-products.component.html',
  inputs: ['products']
})
export class SelectProductsModalComponent {
  products: ProductModel[] = [];
  selectedProducts: ProductModel[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private messages: MessageService
  ) { }

  close(): void {
    this.activeModal.close([]);
  }

  submit(form: NgForm): void {
    const entity = form.value;
    if (entity.products) {
      const prods = Object.keys(entity.products)
        .map(idx => {
          return { id: entity.products[idx].id, name: entity.products[idx].name, companyId: entity.products[idx].companyId, isSelected: entity.products[idx].isSelected }
        });

      const selected = prods.filter(x => x.isSelected);
      if (selected.length > 0) {
        this.activeModal.close(selected);
      } else {
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('ClientCategoryDetails.WarningSelectProducts'), 'warning');
      }
    }
  }
}
