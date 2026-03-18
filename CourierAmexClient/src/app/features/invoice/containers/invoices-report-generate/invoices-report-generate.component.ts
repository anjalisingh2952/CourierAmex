import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingService } from '@app/@core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoices-report-generate',
  templateUrl: './invoices-report-generate.component.html'
})
export class InvoicesReportGenerateComponent {
  selectedInvoiceId: string | null = null;
  pdfSrc: SafeResourceUrl | undefined;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private sanitizer: DomSanitizer,
    private loading: LoadingService,
    private toastr: ToastrService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.selectedInvoiceId = params.get('id');
      if (this.selectedInvoiceId) {
        this.loadInvoice();
      }
    });
  }

  loadInvoice(): void {
    if (!this.selectedInvoiceId) {
      Swal.fire("Warning", "No document selected. Please enter an Invoice ID.", "warning")
      return;
    }

    this.loading.show();
    this.invoiceService.PrepareInvoice(this.selectedInvoiceId, true).subscribe(
      (response: any) => {
        this.loading.hide();
        if (typeof response === 'string') {
          this.handleHtmlResponse(response);
        } else {
          this.handlePdfResponse(response);
        }
      },
      (error) => {
        this.loading.hide();
        Swal.fire("Error", "Error loading the invoice. Please try again.", "error")
      }
    );
  }

  handlePdfResponse(blob: Blob): void {
    if (blob.size === 0) {
      Swal.fire("Warning", "Invoice dose not exist.", "warning");
      return;
    }

    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  handleHtmlResponse(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.srcdoc = html;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    const container = document.getElementById('html-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }
  }
}
