import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { BreadcrumbService } from '@app/@core';
import { Breadcrumb } from '@app/models';

@Component({
  selector: 'shared-breadcrumb',
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  breadcrumbs$: Observable<Breadcrumb[]>;
  static ROUTE_DATA_BREADCRUMB: string = 'breadcrumb';

  constructor(
    private readonly breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }
}
