import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { BehaviorSubject} from "rxjs";

import { BreadcrumbComponent } from "@app/@shared";
import { Breadcrumb } from "@app/models";

@Injectable()
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events
      .subscribe(() => {
        const breadcrumbs = this.createBreadcrumb(this.route);
        this._breadcrumbs$.next(breadcrumbs);
      });
  }

  private createBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data[BreadcrumbComponent.ROUTE_DATA_BREADCRUMB];
      if (label && label.length > 0) {
        breadcrumbs.push({label, url});
      }

      return this.createBreadcrumb(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
