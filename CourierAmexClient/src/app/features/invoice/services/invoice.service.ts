import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigLoaderService, GenericService, LoadingService } from "@app/@core";
import { ClientCategoryModel } from "@app/features/company";
import { GenericResponse, PagedResponse, PaginationModel } from "@app/models";
import { finalize, Observable } from "rxjs";
import { AccountingDetail, CreditNoteInsertRequestModel } from "../models";

@Injectable()
export class InvoiceService extends GenericService<any> {
    constructor(
        configService: ConfigLoaderService,
        http: HttpClient,
        private loading: LoadingService
    ) {
        super(configService, http, 'Invoice');
    }

    public CustomerDetailsByClientId(
        clientId: any,
        fromDate: any,
        toDate: any,
        filters: any,
        pageSize?: number,
        pageNumber?: number
    ): Observable<GenericResponse<any>> {
        let params = new HttpParams()
            .set('clientId', clientId ?? '')
            .set('fromDate', fromDate ?? '')
            .set('toDate', toDate ?? '')
            .set('filters', filters ?? '');
        if (pageSize != null) {
            params = params.set('pageSize', pageSize.toString());
        }
        if (pageNumber != null) {
            params = params.set('pageNumber', pageNumber.toString());
        }

        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/Invoice/CustomerDetailsByClientId`, { params });
    }

    public InvoicesPendingByCustomer(clientId: any): Observable<GenericResponse<any>> {
        this.loading.show();
        const url = `${this.config?.apiUrl}v1/Invoice/InvoicesPendingByCustomer?clientId=${clientId}`;
        return this.http.get<GenericResponse<any>>(url).pipe(
            finalize(() => this.loading.hide())
        );
    }


    public GetPackagesByInvoice(invoiceNumber: any) {
        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/Invoice/GetPackagesByInvoice?invoiceNumber=${invoiceNumber}`
        );
    }

    public GetPaymentInfoByInvoiceId(companyId: any, invoiceNumber: any) {
        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/Invoice/GetPaymentInfoByInvoiceId?companyId=${companyId}&invoiceNumber=${invoiceNumber}`
        );
    }

    public IsElectronicInvoiceProcessed(companyId: any, invoiceNumber: any) {
        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/Invoice/IsElectronicInvoiceProcessed?companyId=${companyId}&invoiceNumber=${invoiceNumber}`
        );
    }

    public insertCreditNote(request: CreditNoteInsertRequestModel): Observable<GenericResponse<number>> {
        return this.http.post<GenericResponse<number>>(`${this.config?.apiUrl}v1/Invoice/InsertCreditNote`, request);
    }

    public cancelInvoice(invoiceId: number, companyId: number, userId: string): Observable<GenericResponse<number>> {
        const params = new HttpParams()
            .set('companyId', companyId)
            .set('invoiceId', invoiceId)
            .set('userId', userId);
        return this.http.post<GenericResponse<number>>(`${this.config?.apiUrl}v1/Invoice/CancelInvoice`, null, { params });
    }

    public GetPaymentDetails(companyId: any, paymentId: any) {
        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/Invoice/GetPaymentDetails?companyId=${companyId}&paymentId=${paymentId}`
        );
    }

    public GetPaymentDetailsForLabel(companyId: any, paymentId: any) {
        return this.http.get<any>(
            `${this.config?.apiUrl}v1/Invoice/GetPaymentDetailsForLabel?companyId=${companyId}&paymentId=${paymentId}`
        );
    }

    public FullInvoiceDetailsById(invoiceId: any) {
        return this.http.get<any>(
            `${this.config?.apiUrl}v1/Invoice/FullInvoiceDetailsById?invoiceId=${invoiceId}`
        );
    }

    public PrepareInvoice(invoiceId: any, downloadPDF: any) {
        return this.http.get(`${this.config?.apiUrl}v1/Invoice/PrepareInvoice?invoiceId=${invoiceId}&downloadPDF=${downloadPDF}`, {
            responseType: downloadPDF ? 'blob' : 'text' as any
        });
    }

    public getAllCashier$(pagination: PaginationModel, companyId: number = 0): Observable<PagedResponse<ClientCategoryModel>> {
        const c = pagination.c && pagination.c?.length > 0 ? `&c=${pagination.c}` : '';
        const s = pagination.s && pagination.s?.length > 0 ? `&s=${pagination.s}` : '';
        const cid = companyId > 0 ? `&cid=${companyId}` : '';
        return this.http.get<PagedResponse<ClientCategoryModel>>(`${this.config?.apiUrl}v1/Cashier/Paged?ps=${pagination.ps}&pi=${pagination.pi}${c}${s}${cid}`);
    }

    public exportAeropostMassUploadReport(companyId: number, startDate: string, endDate: string, providerId: number): Observable<Blob> {
        return this.http.get(
            `${this.config?.apiUrl}v1/Invoice/GetExcel_AeropostMassUploadReport?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}&providerId=${providerId}`,
            { responseType: 'blob' }
        );
    }

    public generateAccountingEntry(
        companyId: number,
        periodDate: string,
        entryDate: string,
        entryDescription: string,
        statusIndicator: string,
        sourceSystemCode: string,
        systemIndicator: string,
        inclusionDate: string,
        inclusionUser: number
    ): Observable<any> {
        const params = new HttpParams()
            .set('companyId', companyId.toString())
            .set('periodDate', periodDate)
            .set('entryDate', entryDate)
            .set('entryDescription', entryDescription)
            .set('statusIndicator', statusIndicator)
            .set('sourceSystemCode', sourceSystemCode)
            .set('systemIndicator', systemIndicator)
            .set('inclusionDate', inclusionDate)
            .set('inclusionUser', inclusionUser.toString());

        return this.http.post(`${this.config?.apiUrl}v1/Invoice/GenerateAccountingEntry`, null, { params });
    }

    public GenerateAccountingEntryInvoice(companyId: number, entryCode: string, invoiceNumber: number): Observable<any> {
        const params = new HttpParams()
            .set('companyId', companyId)
            .set('entryCode', entryCode)
            .set('invoiceNumber', invoiceNumber);

        return this.http.post(`${this.config?.apiUrl}v1/Invoice/GenerateAccountingEntryInvoice`, null, { params });
    }

    public selectTemplateAccount(companyId: number, moduleCode: string, templateCode: number): Observable<any> {
        return this.http.get<any>(
            `${this.config?.apiUrl}v1/Invoice/SelectTemplateAccount?companyId=${companyId}&moduleCode=${moduleCode}&templateCode=${templateCode}`
        );
    }

    public insertAccountingDetail(data: AccountingDetail[]): Observable<any> {
        return this.http.post(`${this.config?.apiUrl}v1/Invoice/InsertAccountingDetail`, data);
    }


    public validateAndApplyAccountEntry(companyId: any, entryCode: any): Observable<any> {
        const params = new HttpParams()
            .set('companyId', companyId)
            .set('entryCode', entryCode)
        return this.http.post(`${this.config?.apiUrl}v1/Invoice/ValidateAndApplyAccountEntry`, null, {params});
    }
}