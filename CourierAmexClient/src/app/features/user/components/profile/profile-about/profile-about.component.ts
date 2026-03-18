import { Component } from '@angular/core';

@Component({
  selector: 'user-profile-about',
  templateUrl: './profile-about.component.html',
  inputs: ['isLoading'],
  outputs: []
})
export class UserProfileAboutComponent {
  isLoading: boolean = false;

  constructor(
  ) { }

}
