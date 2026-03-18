import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CashierModel } from '../../models/cashier.model';
import { CompanyModel } from '../../models';
import { CredentialsService } from '@app/@core/services/credentials.service';
import { PermissionActionEnum, PermissionsEnum } from '@app/models/permission.enum';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'cashier-form',
  templateUrl: './cashier-form.component.html',
  styleUrls: ['./cashier-form.component.scss']
})
export class CashierFormComponent {

  @Input() entity!: CashierModel;
  @Input() companies: Array<CompanyModel> = [];
  @Output() onSave = new EventEmitter<CashierModel>();
  @Output() onCompanyChange = new EventEmitter<number>();
  @Output() onGoBack = new EventEmitter<void>();

    hasAdd: boolean = false;
    hasUpdate: boolean = false;
    showCompanies: boolean = false;
  
    constructor(private credentailsService: CredentialsService) {
      this.showCompanies = !this.credentailsService.isGatewayUser();
      this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Add);
      this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Update);
    }
  
    goBack(): void {
      this.onGoBack.emit();
    }
  
    handleSubmit(form: NgForm): void {
      if (form.valid) {
        this.onSave.emit(Object.assign(this.entity,form.value));
      } else {
        form.form.markAllAsTouched();
      }
    }
}
