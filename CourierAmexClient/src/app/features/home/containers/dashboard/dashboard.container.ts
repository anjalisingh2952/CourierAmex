import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { CredentialsService, MessageService } from '@app/@core';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.container.html'
})
export class DashboardContainer implements OnInit {

  activeDashboard: 'A' | 'B' = 'B';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private credService: CredentialsService,
  ) { }

  ngOnInit(): void {
    const user = this.credService.credentials?.user;
    if (user?.changePassword) {
      Swal.fire({
        title: this.messageService.getTranslate('Labels.TemporaryPasswordTitle'),
        text: this.messageService.getTranslate('Labels.TemporaryPassword'),
        icon: 'warning',
        confirmButtonText: this.messageService.getTranslate('Labels.Confirm')
      })
        .then(() => {
          this.changePassword();
        });
    }
  }

  showDashboard(dashboard: 'A' | 'B') {
    this.activeDashboard = dashboard;
  }

  private changePassword(): void {
    this.router.navigate(['user', 'profile'], { queryParams: { tab: 'security' } });
  }
}
