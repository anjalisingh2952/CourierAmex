import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse } from "@app/models";
import { InvoiceCreditPending, ManifestBillingInfo, ManifestGeneralInfo } from "../models/reports-manifest.model";
import { DetailedBilling, Manifestdetail, ManifestProducts } from "../models/detailed-billing.model";
import { start } from "repl";

@Injectable()
export class ReportsService extends GenericService<any> {
  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'Reports');
  }

  /**
 * Get general information of a manifest
 * @param companyId The ID of the company
 * @param manifestNumber The manifest number
 * @returns Observable of GenericResponse containing ManifestGeneralInfo
 */
  public getManifestGeneralInfo(companyId: number, manifestNumber: string): Observable<GenericResponse<ManifestGeneralInfo>> {

    return this.http.get<GenericResponse<ManifestGeneralInfo>>(`${this.config?.apiUrl}v1/Manifest/GetManifestGenralInformation?companyId=${companyId}&manifestNumber=${manifestNumber}`);
  }

  /**
   * Get billing information of a manifest
   * @param companyId The ID of the company
   * @param manifestNumber The manifest number
   * @returns Observable of GenericResponse containing a list of ManifestBillingInfo
   */
  public getManifestBillingInfo(companyId: number, manifestNumber: string): Observable<GenericResponse<ManifestBillingInfo[]>> {

    return this.http.get<GenericResponse<ManifestBillingInfo[]>>(`${this.config?.apiUrl}v1/Manifest/GetManifestBillingInformation?companyId=${companyId}&manifestNumber=${manifestNumber}`);
  }

  public Get_OutstandingCreditCustomerInvoices(companyId: number,
    startDate: Date,
    endDate: Date,
    zoneIds: string): Observable<InvoiceCreditPending[]> {

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    return this.http.get<InvoiceCreditPending[]>(`${this.config?.apiUrl}v1/${this.endpoint}/Get_OutstandingCreditCustomerInvoices?companyId=${companyId}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&zoneIds=${zoneIds}`);
  }

  public GetExcel_OutstandingCreditCustomerInvoices(companyId: number,
    startDate: Date,
    endDate: Date,
    zoneIds: string): Observable<Blob> {

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    return this.http.get(`${this.config?.apiUrl}v1/CompanyInvoice/GetExcel_OutstandingCreditCustomerInvoices?companyId=${companyId}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&zoneIds=${zoneIds}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }
  public PendingManifestOrPreStudy(companyId: number,
    startDate: Date,
    endDate: Date,
    reportType: string): Observable<Blob> {
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    return this.http.get(`${this.config?.apiUrl}v1/PendingManifestOrPreStudy/GetExcel_ManifestReportInvoices?companyId=${companyId}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&reportType=${reportType}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public generateCourierDeconsolidationReportExcel(companyId: number, manifestNumber: number, freightValue: any, category: boolean): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/Manifest/GetExcel_DeconsolidationReport?companyId=${companyId}&manifestId=${manifestNumber}&freightValue=${freightValue}&category=${category}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }
  public GetExcel_ManifestDetailedBilingInvoices(companyId: number, manifestNumber: string): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/ManifestDetailedBiling/GetExcel_ManifestDetailedBilingInvoices?companyId=${companyId}&manifestNumber=${manifestNumber}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }

  public getManifestDetailedBilingData(companyId: number, manifestNumber: string): Observable<GenericResponse<DetailedBilling>> {
    return this.http.get<GenericResponse<DetailedBilling>>(`${this.config?.apiUrl}v1/ManifestDetailedBiling/GetManifestDetailedBilingData?companyId=${companyId}&manifestNumber=${manifestNumber}`);
  }

  public GetManifestProducts(companyId: number): Observable<GenericResponse<ManifestProducts[]>> {
    return this.http.get<GenericResponse<ManifestProducts[]>>(`${this.config?.apiUrl}v1/ManifestDetailedBiling/GetManifestProducts?companyId=${companyId}`);
  }

  public GetExcel_SalesSummaryReport(startDate: Date,
    endDate: Date,customerCode: string): Observable<Blob> {

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    return this.http.get(`${this.config?.apiUrl}v1/CompanyInvoice/GetExcel_SalesSummaryReport?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&customerCode=${customerCode}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });

  }

  public GetExcel_PendingInvoicesReport(startDate: Date,endDate: Date,companyId: number,paymentType:number,zoneId:number): Observable<Blob> {

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
    return this.http.get(`${this.config?.apiUrl}v1/Invoice/GetExcel_PendingInvoicesReport?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&companyId=${companyId}&paymentType=${paymentType}&zoneId=${zoneId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }  
  public exportSalesReport(startDate: Date,endDate: Date,companyId: number,customerCode:string): Observable<Blob> {

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
    return this.http.get(`${this.config?.apiUrl}v1/Invoice/GetExcel_SalesReport?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&companyId=${companyId}&customerCode=${customerCode}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }  

  public exportReportBag(companyId: number, manifestNumber: string): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/Manifest/GetExcel_ManifestReportByBag?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }  
  public exportReportCourierReport(companyId: number, manifestNumber: string): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/Manifest/GetExcel_PackagingCourierReport?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
  }  
  public exportReportConsolidatedReport(companyId: number, manifestNumber: string): Observable<Blob> {
    return this.http.get(`${this.config?.apiUrl}v1/Manifest/GetExcel_PackagingConsolidatedReport?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
      responseType: 'blob' // Expecting a binary file (Excel)
    });
   
    // return this.http.get(`${this.config?.apiUrl}v1/Manifest/GetExcel_PackagingConsolidatedReport?manifestNumber=${manifestNumber}&companyId=${companyId}`, {
    //   responseType: 'blob' // Expecting a binary file (Excel)
    // });
  }  

public getPurchasesReportExcel(companyId: number, startDate: string, endDate: string): Observable<Blob> {
  return this.http.get(`${this.config?.apiUrl}v1/Supplier/GetExcel_PurchasesReport?startDate=${startDate}&endDate=${endDate}&companyId=${companyId}`, {
    responseType: 'blob'
  });
}

  public getExcel_CustomsTaxesReport(customerCode: string, startDate: string, endDate: string,DUA:string,manifest:string): Observable<Blob> {
  return this.http.get(`${this.config?.apiUrl}v1/Invoice/GetExcel_CustomsTaxesReport?startDate=${startDate}&endDate=${endDate}&customerCode=${customerCode}&manifestNumber=${manifest}&bag=${DUA}`, {
    responseType: 'blob'
  });
}
}
