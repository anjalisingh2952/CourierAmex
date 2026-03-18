import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigLoaderService, GenericService, LoadingService } from "@app/@core";
import { GenericResponse, PagedResponse, ManifestModel } from "@app/models";
import { finalize, Observable } from "rxjs";

@Injectable()
export class HomeService extends GenericService<any> {
    constructor(
        configService: ConfigLoaderService,
        http: HttpClient,
        private loading: LoadingService
    ) {
        super(configService, http, 'Dashboard');
    }

    public GetChartData(clientId: string, fromDate: string, toDate: string, filters: string, companyId: number, selectedMonth?: string, selectedfilter?: string): Observable<GenericResponse<any[]>> {
        return this.http.get<GenericResponse<ManifestModel[]>>(
            `${this.config?.apiUrl}v1/Dashboard/chart-data?clientId=${clientId}&fromDate=${fromDate}&toDate=${toDate}&filters=${filters}&idEmpresa=${companyId}&selectedMonth=${selectedMonth}&selectedfilter=${selectedfilter}`
        );
    }

    getProductChartDetail(idEmpresa: number, fechaInicio: string, fechaFin: string, invoiceId?: string, productId?: number, months: string = "Blank"
    ): Observable<GenericResponse<any>> {
        let url = `${this.config?.apiUrl}v1/Dashboard/GetProductChartDetail?idEmpresa=${idEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&months=${months}`;

        if (invoiceId) {
            url += `&invoiceId=${invoiceId}`;
        }

        if (productId !== undefined && productId !== null) {
            url += `&productId=${productId}`;
        }

        return this.http.get<any>(url);
    }

    getProductDetailsPaginated(idEmpresa: number, fechaInicio: string, fechaFin: string, pageNumber: number = 1, pageSize: number = 10, invoiceId?: string, productId?: number, months: string = "Blank"
    ): Observable<GenericResponse<any>> {
        let url = `${this.config?.apiUrl}v1/Dashboard/GetProductDetailsPaginated?idEmpresa=${idEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&pageNumber=${pageNumber}&pageSize=${pageSize}&months=${months}`;

        if (invoiceId) {
            url += `&invoiceId=${invoiceId}`;
        }

        if (productId !== undefined && productId !== null) {
            url += `&productId=${productId}`;
        }
        return this.http.get<any>(url);
    }
}