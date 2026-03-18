import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService, LoadingService } from '@app/@core';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-manage-route-sheet',
  templateUrl: './manage-route-sheet.component.html',
  styleUrls: ['./manage-route-sheet.component.scss']
})
export class ManageRouteSheetComponent {
  activeTab: string = 'home';

  constructor(private loading: LoadingService,
    private credentailsService: CredentialsService

  ) {

    const router = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      router.navigate(['error', 'unauthorized'], { replaceUrl: true })
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}