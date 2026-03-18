import { Component, OnInit } from '@angular/core';

import globals from '@app/@theme/globals';

interface BgImage {
  bg: string;
  active: boolean;
}

@Component({
  selector: 'shared-login-cover',
  templateUrl: './login-cover.component.html'
})
export class LoginCoverComponent implements OnInit {
  bg: string = '';
  bgList: BgImage[] = [];

  ngOnInit(): void {
    this.bgList = globals.loginImages.map(file => {
      return { bg: file, active: false };
    });

    this.restoreBg();
  }

  changeBg(image: BgImage): void {
    this.bg = image.bg;
    image.active = true;
    localStorage.setItem('LoginBg', JSON.stringify(image));

    for (let bList of this.bgList) {
      if (bList != image) {
        bList.active = false;
      }
    }
  }

  private restoreBg(): void {
    const loginBgStr = localStorage.getItem('LoginBg');
    if (loginBgStr) {
      const loginBg = JSON.parse(loginBgStr);
      if (loginBg) {
        this.changeBg(loginBg);
        return;
      }
    }

    this.changeBg(this.bgList[0]);
  }
}
