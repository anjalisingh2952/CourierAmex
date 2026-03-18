import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigLoaderService, GenericService, LoadingService } from "@app/@core";
import { GenericResponse } from '@app/models'; // Assuming this is your generic response model
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadCustomsTaxexService extends GenericService<any>  {

  constructor(
      configService: ConfigLoaderService,
        http: HttpClient,
  ) {
     super(configService, http, 'Invoice'); 
  }

  public insertCustomsTaxLoad(taxLoadList: any[]): Observable<GenericResponse<any>> {
    return this.configService.config$.pipe(
      take(1), // Ensure only the first emission of config is used
      switchMap(config => {
        const url = `${config?.apiUrl ?? ''}v1/Invoice/InsertCustomsTaxLoad`; 
        return this.http.post<GenericResponse<any>>(url, taxLoadList); 
      })
    );
  }

 
public getPackage(packageNumber: string): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(
        `${this.config?.apiUrl}v1/Invoice/GetPackage?packageNumber=${packageNumber}`
    );
}

public getBag(bag: string): Observable<GenericResponse<any>> {
    return this.http.get<GenericResponse<any>>(
        `${this.config?.apiUrl}v1/Invoice/GetBag?bag=${encodeURIComponent(bag)}`
    );
}

  
}
