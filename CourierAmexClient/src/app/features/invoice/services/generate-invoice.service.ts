import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigLoaderService, GenericService, LoadingService } from "@app/@core";
import { GenericResponse, PagedResponse, ManifestModel } from "@app/models";
import { finalize, Observable } from "rxjs";
import { CompanyInvoiceHeader, CompanyInvoiceData, CompanyInvoiceDetail, InvoiceArticle, ElectronicInvoiceInformation, SaveElectronicInvoiceInformation, saveMiamiInvoice, saveManifestInvoice, CompanyExchangeRate } from "../models";

@Injectable()
export class CompanyInvoiceService extends GenericService<any> {
    constructor(
        configService: ConfigLoaderService,
        http: HttpClient,
        private loading: LoadingService
    ) {
        super(configService, http, 'CompanyInvoice');
    }


    public GetManifests(companyid: number) {
        return this.http.get<GenericResponse<ManifestModel[]>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetManifest?companyid=${companyid}`
        );
    }

    public GetInvoiceArticlesJamaica(zone: string, weight: number, value: number, volume: number, shippingType: number, packageNumber: number) {
        return this.http.get<GenericResponse<InvoiceArticle[]>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetInvoiceArticlesJamaica?zone=${zone}&weight=${weight}&value=${value}&volume=${volume}&shippingType=${shippingType}&package=${packageNumber}`
        );
    }

    public GetInvoiceArticles(customer: string, type: number, weight: number, volume: number, shippingType: number, packageNumbers: number) {
        return this.http.get<GenericResponse<InvoiceArticle[]>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetInvoiceArticles?customer=${customer}&type=${type}&weight=${weight}&volume=${volume}&shippingType=${shippingType}&packages=${packageNumbers}`
        );
    }

    public GetInvoiceDataByCustomer(clientid: string, packagenumber: string) {
        const pn = packagenumber != '' ? `&packagenumber=${packagenumber}` : '';
        return this.http.get<GenericResponse<CompanyInvoiceData>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetInvoiceDataByCustomer?clientid=${clientid}${pn}`
        );
    }

    public GetInvoiceDataByManifest(manifestid: number, packagenumber: string) {
        const pn = packagenumber != '' ? `&packagenumber=${packagenumber}` : '';
        return this.http.get<GenericResponse<CompanyInvoiceData>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetInvoiceDataByManifest?manifestid=${manifestid}${pn}`
        );
    }

    public VerifyPackageNumberAndManifestIdAsync(manifestid: number, packagenumber: string) {
        return this.http.get<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/VerifyPackageNumberAndManifestIdAsync?manifestid=${manifestid}&packagenumber=${packagenumber}`
        );
    }

    public CreateInvoiceHeader(entity: CompanyInvoiceHeader): Observable<GenericResponse<any>> {
        return this.http.post<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/CreateInvoiceHeader`, entity);

    }

    public CreateInvoiceDetail(entity: CompanyInvoiceDetail): Observable<GenericResponse<any>> {
        return this.http.post<GenericResponse<any>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/CreateInvoiceDetail`, entity);

    }

    public GetNewInvoiceNumber() {
        return this.http.get<GenericResponse<number>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/GetNewInvoiceNumber`
        );
    }

    public UpdatePackageInvoiceStatus(entity: { packages: string }): Observable<GenericResponse<number>> {
        return this.http.post<GenericResponse<number>>(
            `${this.config?.apiUrl}v1/CompanyInvoice/UpdateInvoiceStatus`, entity);

    }

    public SaveElectronicInvoiceInformation(entity: SaveElectronicInvoiceInformation): Observable<GenericResponse<number>> {
        return this.http.post<GenericResponse<number>>(`${this.config?.apiUrl}v1/CompanyInvoice/SaveElectronicInvoiceInformation`, entity);
    }

    public GetElectronicInvoiceInformation(customerCode: string): Observable<GenericResponse<ElectronicInvoiceInformation>> {
        return this.http.get<GenericResponse<ElectronicInvoiceInformation>>(`${this.config?.apiUrl}v1/CompanyInvoice/GetElectronicInvoiceInformation?customerCode=${customerCode}`);
    }

    public SaveMiamiInvoice(entity: saveMiamiInvoice): Observable<GenericResponse<number>> {
        return this.http.post<GenericResponse<number>>(`${this.config?.apiUrl}v1/CompanyInvoice/SaveMiamiInvoice`, entity);
    }

    public ManifestInvoice(entity: saveManifestInvoice): Observable<GenericResponse<number>> {
        return this.http.post<GenericResponse<number>>(`${this.config?.apiUrl}v1/CompanyInvoice/ManifestInvoice`, entity);
    }

    public GetCompanyExchangeRate(companyId: number,invoiceNumber:number): Observable<GenericResponse<CompanyExchangeRate>> {
        return this.http.get<GenericResponse<CompanyExchangeRate>>(`${this.config?.apiUrl}v1/CompanyInvoice/GetCompanyExchangeRate?companyId=${companyId}&invoiceNumber=${invoiceNumber}`);
    }

}