import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule, Optional, SkipSelf } from "@angular/core";

import * as coreInterceptors from './interceptors';
import * as coreServices from './services';

@NgModule({ imports: [CommonModule], providers: [
        {
            provide: 'BASE_URL',
            useValue: document.getElementsByTagName('base')[0].href,
        },
        ...coreServices.CORE_SERVICES,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: coreInterceptors.AuthorizeInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: coreInterceptors.ErrorHandlerInterceptor,
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })

export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
