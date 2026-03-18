import { Component } from '@angular/core';
import { PaymentService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService, LoadingService } from '@app/@core';
import { CustomerService } from '@app/features/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generate-delivery-proof',
  templateUrl: './generate-delivery-proof.component.html'
})
export class GenerateDeliveryProofComponent {
  pdfSrc: any;
  packageNumber: number;
  selectedPackageId: number;
  email: string = "";
  customerName: string | null = null;
  htmlTemplate: any;
  constructor(
    private paymentService: PaymentService,
    private sanitizer: DomSanitizer,
    private loading: LoadingService,
    private customerService: CustomerService
  ) { }

  async loadInvoice(): Promise<void> {
    if (!this.selectedPackageId) {
      await Swal.fire('Error', 'Please enter a valid package number to load delivery proof.', 'error');
      return;
    }

    this.loading.show();

    try {
      const response = await this.paymentService.DetailsForDeliveryProof(this.selectedPackageId).toPromise();

      if (!response || !Object.keys(response).length) {
        this.loading.hide();
        await Swal.fire('Warning', 'No details found for the selected package ID.', 'warning');
        return;
      }

      const { pdfBase64, htmlTemplate, customer } = response;

      if (pdfBase64) {
        this.handlePdfResponse(pdfBase64);
      } else {
        await Swal.fire('Warning', 'No PDF data found!', 'warning');
      }

      if (htmlTemplate) this.htmlTemplate = htmlTemplate;

      await this.getDetail(customer);
    } catch (error) {
      await Swal.fire('Error', 'Failed to load invoice. Please try again.', 'error');
    } finally {
      this.loading.hide();
    }
  }

  async getDetail(customerCode: string | undefined) {
    if (!customerCode) {
      Swal.fire('Warning', 'Customer code is missing.', 'warning');
      return;
    }

    try {
      const response = await this.customerService.getCustomerByCode$(customerCode).toPromise();
      this.email = response?.data?.email || null;
      this.customerName = response?.data?.fullName || null;
    } catch (error) {
      Swal.fire('Error', 'Failed to load customer details.', 'error');
      console.error('Error fetching customer details:', error);
    }
  }

  handlePdfResponse(pdfBase64: string): void {
    if (!pdfBase64?.trim()) {
      Swal.fire('Error', 'Invalid or empty PDF data.', 'error');
      return;
    }

    const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');
    const url = window.URL.createObjectURL(pdfBlob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = Array.from(slice, char => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  sendEmail() {
    if (this.email && this.email.trim() !== "") {
      setTimeout(() => {
        this.loading.show();
        setTimeout(() => {
          this.loading.hide();
          Swal.fire({
            icon: 'success',
            title: 'Email Sent!',
            text: 'The email is successfully sent.',
            showConfirmButton: false
          });
        }, 2000);
      }, 2000);

      this.paymentService.sendEmail(this.htmlTemplate, this.email).subscribe({
        next: () => {
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Send Email',
            text: 'There was an error sending the email. Please try again later.',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please load delivery proof before sending email.',
      });
    }
  }
}