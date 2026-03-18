import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CredentialsService, LoadingService } from '@app/@core';
import { ManifestService } from '@app/features/manifest/services';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-route-sheet-report',
  templateUrl: './route-sheet-report.component.html',
  styleUrls: ['./route-sheet-report.component.scss']
})
export class RouteSheetReportComponent {
  selectedInvoiceId: string | null = null;
  pdfSrc: SafeResourceUrl | undefined;
  pdfSrcParcel: SafeResourceUrl | undefined;
  roadMapId: number;

  constructor(private manifestService: ManifestService,
    private toastr: ToastrService,
    private loading: LoadingService,
    private sanitizer: DomSanitizer,
    private cred: CredentialsService
  ) {
    this.roadMapId = 0;
  }

  loadReport() {
    this.loading.show();
    this.manifestService.PrepareRoadMapReport(this.roadMapId, this.cred.credentials?.user.companyId ?? 0).subscribe(
      (response: any) => {
        if (!response?.roadMapReport || !response?.parcelDeliveryReport) {
          Swal.fire('Error', 'Invalid or empty PDF data.', 'error');
          this.loading.hide();
          return;
        }

        this.handlePdfResponse(response.roadMapReport.fileContents, false);
        this.handlePdfResponse(response.parcelDeliveryReport.fileContents, true);
      },
      (error) => {
        console.error("Error fetching the report:", error);
        Swal.fire('Error', 'Failed to generate the reports.', 'error');
        this.loading.hide();
      }
    );
  }

  private handlePdfResponse(pdfBase64: string, isParcel: boolean): void {
    try {
      const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');
      const url = window.URL.createObjectURL(pdfBlob);

      if (isParcel) {
        this.pdfSrcParcel = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }

    } catch (error) {
      console.error("Error processing PDF:", error);
      Swal.fire('Error', `Failed to load the PDF.`, 'error');
    } finally {
      this.loading.hide();
    }
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Uint8Array([...slice].map(char => char.charCodeAt(0)));
      byteArrays.push(byteNumbers);
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}