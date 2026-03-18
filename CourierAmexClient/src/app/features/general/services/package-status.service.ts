import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { PackageStatusModel } from "../models";

@Injectable()
export class PackageStatusService extends GenericService<PackageStatusModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'PackageStatus');
  }
}
