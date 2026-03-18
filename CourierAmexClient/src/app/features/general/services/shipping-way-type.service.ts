import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { ConfigLoaderService, GenericService } from "@app/@core";
import { ShippingWayTypeModel } from "../models";

@Injectable()
export class ShippingWayTypeService extends GenericService<ShippingWayTypeModel> {

  constructor(
    configService: ConfigLoaderService,
    http: HttpClient
  ) {
    super(configService, http, 'ShippingWayType');
  }
}
