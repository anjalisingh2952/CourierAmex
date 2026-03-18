import { Component, EventEmitter, OnInit } from '@angular/core';

import { CredentialsService } from '@app/@core/services';
import { TabModel } from '@app/models';

@Component({
  selector: 'user-profile-header',
  templateUrl: './profile-header.component.html',
  inputs: ['isLoading', 'tabs', 'tab'],
  outputs: ['onTabChange']
})
export class UserProfileHeaderComponent implements OnInit {
  isLoading: boolean = false;
  userFullname: string = '';
  userEmail: string = '';
  username: string = '';
  company: string = '';
  tabs: TabModel[] = [];
  tab?: TabModel;

  onTabChange: EventEmitter<TabModel> = new EventEmitter<TabModel>();

  constructor(
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const user = this.credentialsService.credentials?.user;
    if (user && user.id.length > 0) {
      this.userFullname = `${user?.name} ${user?.lastname}`;
      this.userEmail = `${user?.email}`;
      this.username = `${user?.username}`;
      this.company = `${user?.company?.name ?? ''}`
    }
  }

  selectTab(tab: TabModel): void {
    this.onTabChange.emit(tab);
  }
}
