import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CredentialsService, LoadingService } from '@app/@core';
import { CustomerService } from '@app/features/customer';
import { PackageService } from '@app/features/package';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-guide-form',
  templateUrl: './guide-form.component.html',
  outputs: ['onFormSubmit'],
  inputs: ['data', 'manifestId', 'guideType']
})
export class GuideFormComponent {
  onFormSubmit = new EventEmitter<any>();

  guideType: any;
  data: any;
  manifestId: any;
  formData: any = {};
  isChildComponent: boolean;
  childModification: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private credentailsService: CredentialsService,
    private packageService: PackageService,
    private loading: LoadingService,
    private customerService: CustomerService) { }

  ngOnInit() {
    this.formData.type = 'AIPE';
    if (this.guideType !== "ModifyChildGuide") {
      this.getChildGuige("AIPE");
    }
    if (this.guideType == "ChildGuide") {
      this.isChildComponent = true
      console.log(this.guideType);
    }

    if (this.guideType == "ModifyChildGuide") {
      this.isChildComponent = true
      this.childModification = true;
      console.log(this.guideType);
    }

    if (this.data && this.data.length > 0) {

      this.formData = { ...this.formData, ...this.data[0] };
      this.formData.manifestId = this.manifestId;

      if (this.data[0].flightDate) {
        this.formData.flightDate = this.data[0].flightDate.split('T')[0];
      }
      if (this.guideType == "ModifyChildGuide") {
        this.formData.type = this.data[0].type;
        this.formData.contact = this.data[0].contact;
        this.formData.customerName = this.data[0].name;
        this.formData.customerNumber = this.data[0].consignee;
        this.formData.childGuideId = this.data[0].id;
        this.formData.childId = this.data[0].guide;
      }
    }
  }

  onKeep(): void {
    this.formData.userId = this.credentailsService.credentials?.user.id as string;
    this.onFormSubmit.emit(this.formData);
  }

  getChildGuige(type: any) {
    this.loading.show();
    if (type == 'AIPE') {
      this.packageService.GetNextReferenceAsync(type, 6).subscribe(resp => {
        console.log(resp.data);
        this.formData.childId = resp.data;
        this.formData.consecutive = this.extractNumbers(resp.data)
        this.loading.hide();
      });
    }
    else {
      this.packageService.GetNextReferenceAsync(type, 4).subscribe(resp => {
        console.log(resp.data);
        this.formData.childId = resp.data;
        this.formData.consecutive = this.extractNumbers(resp.data)
        this.loading.hide();
      });
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  getCustomerDetail() {
    this.loading.show();
    this.customerService.getCustomerByCode$(this.formData.customerNumber).subscribe(resp => {
      this.formData.customerName = resp.data.fullName;
      this.formData.identificationType = resp.data.identificationType;
      this.formData.identification = resp.data.identification;
      this.formData.contact =
        `${resp.data.companyName}
${resp.data.addressLine1 + resp.data.addressLine2}
${resp.data.billableEmail}
${resp.data.email}`;
      this.loading.hide();
    });
  }

  extractNumbers(input: string): string {
    return input.replace(/\D/g, '');
  }
}