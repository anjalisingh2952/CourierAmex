import { Component, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

import { PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ClientCategoryModel, CompanyModel, ProductModel } from '@app/features/company/models';
import { CredentialsService, MessageService } from '@app/@core';
import { SelectProductsModalComponent } from '../select-products/select-products.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'company-client-category-form',
  templateUrl: './client-category-form.component.html',
  inputs: ['entity', 'companies', 'products', 'pagination'],
  outputs: ['onSave', 'onCompanyChange', 'onAddIncludedProducts', 'onRemoveIncludedProducts', 'onAddExcludedProducts', 'onRemoveExcludedProducts', 'onGoBack']
})
export class ClientCategoryFormComponent implements OnInit {
  entity!: ClientCategoryModel;
  companies!: CompanyModel[];
  products: ProductModel[] = [];
  includedProducts: ProductModel[] = [];
  excludedProducts: ProductModel[] = [];
  pagination!: PaginationModel;
  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  onSave = new EventEmitter<ClientCategoryModel>();
  onCompanyChange = new EventEmitter<number>();
  onAddIncludedProducts = new EventEmitter<ProductModel[]>();
  onRemoveIncludedProducts = new EventEmitter<ProductModel[]>();
  onAddExcludedProducts = new EventEmitter<ProductModel[]>();
  onRemoveExcludedProducts = new EventEmitter<ProductModel[]>();
  onGoBack = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private config: NgbModalConfig,
    private messages: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.config.backdrop = 'static';
    this.config.keyboard = false;
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.ClientCategories, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.ClientCategories, PermissionActionEnum.Update);
  }

  ngOnInit(): void {
    const ciaId = this.credentailsService.credentials?.user.companyId ?? 0;
    if (!this.showCompanies && ciaId > 0) {
      this.companyChange(ciaId);
    }
  }

  goBack(): void {
    this.onGoBack.emit();
  }

  companyChange(companyId: number): void {
    this.onCompanyChange.emit(companyId);
  }
  
  selectProducts(type: 'included' | 'excluded'): void {
    const modalRef = this.modalService.open(SelectProductsModalComponent);
    modalRef.componentInstance.products = this.products;

    modalRef.result
      .catch(reason => {
        console.error(reason);
      })
      .then((res: ProductModel[]) => {
        if (res && res.length > 0) {
          if (type === 'excluded') {
            this.onAddExcludedProducts.emit(res);
          } else if (type === 'included') {
            this.onAddIncludedProducts.emit(res);
          }
        }
      });
  }

  removeProducts(type: 'included' | 'excluded'): void {
    if (type === 'excluded') {
      if (this.excludedProducts) {
        this.onRemoveExcludedProducts.emit(this.excludedProducts);
      } else {
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('ClientCategoryDetails.WarningSelectProducts'), 'warning');
      }
    } else if (type === 'included') {
      if (this.includedProducts) {
        this.onRemoveIncludedProducts.emit(this.includedProducts);
      } else {
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('ClientCategoryDetails.WarningSelectProducts'), 'warning');
      }
    }
  }

  onCheckChanged($event: Event, item: ProductModel, type: 'included' | 'excluded'): void {
    const checkbox = $event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (type === 'excluded') {
        this.excludedProducts.push(item);
      } else if (type === 'included') {
        this.includedProducts.push(item);
      }
    } else {
      if (type === 'excluded') {
        const idx = this.excludedProducts.findIndex(x => x.id === item.id);
        if (idx >= 0) {
          this.excludedProducts.splice(idx, 1);
        }
      } else if (type === 'included') {
        const idx = this.includedProducts.findIndex(x => x.id === item.id);
        if (idx >= 0) {
          this.includedProducts.splice(idx, 1);
        }
      }
    }
  }

  handleSubmit(form: NgForm): void {
    if (form.valid) {
      this.onSave.emit(form.value);
    } else {
      form.form.markAllAsTouched();
    }
  }
}
