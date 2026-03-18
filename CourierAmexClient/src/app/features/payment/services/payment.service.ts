import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigLoaderService, GenericService } from "@app/@core";
import { GenericResponse } from "@app/models";
import { Observable } from "rxjs";

@Injectable()
export class PaymentService extends GenericService<any> {
    constructor(
        configService: ConfigLoaderService,
        http: HttpClient
    ) {
        super(configService, http, 'Payment');
    }

    public DetailsForDeliveryProof(packageNumber: number) {
        return this.http.get<{ pdfBase64: string; customer: any; htmlTemplate: any; }>(
            `${this.config?.apiUrl}v1/Payment/PrepareDeliveryProof?packageNumber=${packageNumber}`
        );
    }

    public sendEmail(htmlTemplate: string, email: string) {
        const payload = { htmlTemplate, email };
        return this.http.post(`${this.config?.apiUrl}v1/Payment/SendEmail`, payload);
    }

    public getPointOfSale(companyId: number, user: string, state: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/GetPointOfSale?CompanyId=${companyId}&User=${user}&State=${state}`);
    }

    public startPointOfSale(companyId: number, user: string, pointOfSaleId: number, inDollars: number, inLocal: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/StartPointOfSale?CompanyId=${companyId}&User=${user}&pointOfSaleId=${pointOfSaleId}&inDollars=${inDollars}&inLocal=${inLocal}`);
    }

    public CashInOut(companyId: number, user: string, pointOfSaleId: number, inDollars: number, inLocal: number, openingId: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/CashInOut?CompanyId=${companyId}&User=${user}&pointOfSaleId=${pointOfSaleId}&inDollars=${inDollars}&inLocal=${inLocal}&openingId=${openingId}`);
    }

    public getPaymentType(companyId: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/GetPaymentType?CompanyId=${companyId}`);
    }

    public closePointOfSale(openingId: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/ClosePointOfSale?openingId=${openingId}`);
    }

    public getSubPaymentTypeByPaymentId(companyId: number, paymentId: number, pointOfSaleId: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/GetSubPaymentTypeByPaymentId?companyId=${companyId}&paymentId=${paymentId}&pointOfSaleId=${pointOfSaleId}`);
    }

    public getPointOfSaleDailySummary(companyId: number, OpeningCode: number) {
        return this.http.get(`${this.config?.apiUrl}v1/Payment/GetPointOfSaleDailySummary?CompanyId=${companyId}&OpeningCode=${OpeningCode}`);
    }

    public GetPointOfSaleDailyExcelReport(companyId: number, OpeningCode: number, pointOfSaleId: any, ChooseDate: any): Observable<Blob> {
        return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetPointOfSaleDailyExcelReport?companyId=${companyId}&OpeningCode=${OpeningCode}&pointOfSaleId=${pointOfSaleId}&ChooseDate=${ChooseDate}`, {
            responseType: 'blob'
        });
    }

    public GetPointOfDetailByOpeningCode(companyId: number, OpeningCode: number, pointOfSaleId: any, ChooseDate: any): Observable<any> {
        return this.http.get(`${this.config?.apiUrl}v1/${this.endpoint}/GetPointOfDetailByOpeningCode?companyId=${companyId}&OpeningCode=${OpeningCode}&pointOfSaleId=${pointOfSaleId}&ChooseDate=${ChooseDate}`);
    }

    public GetFullPaymentDetailsById(paymentId: any, invoiceNumber: any) {
        return this.http.get<any>(
            `${this.config?.apiUrl}v1/Invoice/GetFullPaymentDetailsById?paymentId=${paymentId}&&invoiceNumber=${invoiceNumber}`
        );
    }

    public getPayById$(id: number): Observable<GenericResponse<any>> {
        return this.http.get<GenericResponse<any>>(`${this.config?.apiUrl}v1/Cashier/?id=${id}`);
    }

    public paymentForInvoice(
        customerId: number,
        invoiceCSV: string,
        localAmount: number,
        dollarAmount: number,
        paidAmount: number,
        changeAmount: number,
        currencyCode: number,
        paymentType: string,
        subPaymentTypeId: number,
        reference: string,
        pointOfSaleId: number,
        companyId: number,
        partialPayment: boolean,
        creditPayment: boolean,
        user: string
    ) {
        const params = new HttpParams()
            .set('customerId', customerId.toString())
            .set('invoiceCSV', invoiceCSV)
            .set('localAmount', localAmount.toString())
            .set('dollarAmount', dollarAmount.toString())
            .set('paidAmount', paidAmount.toString())
            .set('changeAmount', changeAmount.toString())
            .set('currencyCode', currencyCode.toString())
            .set('paymentType', paymentType)
            .set('subPaymentTypeId', subPaymentTypeId.toString())
            .set('reference', reference)
            .set('pointOfSaleId', pointOfSaleId.toString())
            .set('companyId', companyId.toString())
            .set('partialPayment', partialPayment.toString())
            .set('creditPayment', creditPayment.toString())
            .set('user', user);

        return this.http.get(`${this.config?.apiUrl}v1/Payment/PaymentForInvoices`, { params });
    }

    public cancelPayment(companyId: number, paymentId: number, userId: string) {
        const params = new HttpParams()
            .set('CompanyId', companyId)
            .set('PaymentId', paymentId)
            .set('UserId', userId);
        return this.http.post(`${this.config?.apiUrl}v1/Payment/CancelPayment`, null, { params });
    }
}