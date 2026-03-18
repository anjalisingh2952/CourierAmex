import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { BehaviorSubject, lastValueFrom } from "rxjs";

import { ConfigModel } from "@app/models";

@Injectable({
  providedIn: 'root'
})
export class ConfigLoaderService {
  private _config: BehaviorSubject<ConfigModel | undefined> = new BehaviorSubject<ConfigModel | undefined>(undefined);
  config$ = this._config.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  async load(): Promise<ConfigModel> {
    const source$ = this.http.get("./../../../../assets/config/settings.json");
    const settings = await lastValueFrom(source$);
    const config = JSON.parse(JSON.stringify(settings));
    this._config.next(config);
    return config;
  }
}
