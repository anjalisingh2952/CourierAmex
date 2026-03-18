import { animate, style, trigger, transition, state } from '@angular/animations';
import { Component, EventEmitter, ElementRef, HostListener, ViewChild, OnInit, AfterViewChecked } from '@angular/core';

import appSettings from '@app/@theme/app-settings';
import { CredentialsService } from '@app/@core';
import appMenus from '@app/@theme/app-menu';
import { AppMenu } from '@app/models';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  animations: [
    trigger('expandCollapse', [
      state('expand', style({ height: '*', overflow: 'hidden', display: 'block' })),
      state('collapse', style({ height: '0px', overflow: 'hidden', display: 'none' })),
      state('active', style({ height: '*', overflow: 'hidden', display: 'block' })),
      transition('expand <=> collapse', animate(100)),
      transition('active => collapse', animate(100))
    ])
  ],
  inputs: ['appSidebarTransparent', 'appSidebarGrid', 'appSidebarFixed', 'appSidebarMinified'],
  outputs: ['appSidebarMinifiedToggled', 'hideMobileSidebar', 'setPageFloatSubMenu', 'appSidebarMobileToggled']
})

export class SidebarComponent implements OnInit, AfterViewChecked {
  navProfileState = 'collapse';
  @ViewChild('sidebarScrollbar', { static: false }) private sidebarScrollbar: ElementRef | undefined;
  appSidebarTransparent: any;
  appSidebarGrid: any;
  appSidebarFixed: any;
  appSidebarMinified: any;

  appSidebarMinifiedToggled = new EventEmitter<boolean>();
  hideMobileSidebar = new EventEmitter<boolean>();
  setPageFloatSubMenu = new EventEmitter();
  appSidebarMobileToggled = new EventEmitter<boolean>();

  menus = appMenus;
  appSettings = appSettings;
  appSidebarFloatSubMenu: any;
  appSidebarFloatSubMenuHide: any;
  appSidebarFloatSubMenuHideTime = 250;
  appSidebarFloatSubMenuTop: any;
  appSidebarFloatSubMenuLeft = '60px';
  appSidebarFloatSubMenuRight: any;
  appSidebarFloatSubMenuBottom: any;
  appSidebarFloatSubMenuArrowTop: any;
  appSidebarFloatSubMenuArrowBottom: any;
  appSidebarFloatSubMenuLineTop: any;
  appSidebarFloatSubMenuLineBottom: any;
  appSidebarFloatSubMenuOffset: any;

  mobileMode: any;
  desktopMode: any;
  scrollTop: any;

  userFullname: string = '';
  userEmail: string = '';
  username: string = '';
  company: string = '';

  constructor(
    private credentialService: CredentialsService
  ) {
    this.setMode();
  }

  ngOnInit(): void {
    const user = this.credentialService.credentials?.user;
    if ((user?.id?.length ?? 0) > 0) {
      this.userFullname = `${user?.name} ${user?.lastname}`;
      this.userEmail = `${user?.email}`;
      this.username = `${user?.username}`;
      this.company = `${user?.company?.name ?? ''}`
    }
  }

  toggleNavProfile() {
    if (this.navProfileState == 'collapse') {
      this.navProfileState = 'expand';
    } else {
      this.navProfileState = 'collapse';
    }
  }

  toggleAppSidebarMinified() {
    this.appSidebarMinifiedToggled.emit(true);
    this.navProfileState = 'collapse';
    this.scrollTop = 40;
  }

  toggleAppSidebarMobile() {
    this.appSidebarMobileToggled.emit(true);
  }

  calculateAppSidebarFloatSubMenuPosition() {
    const targetTop = this.appSidebarFloatSubMenuOffset.top;
    const windowHeight = window.innerHeight;

    setTimeout(() => {
      let targetElm = <HTMLElement>document.querySelector('.app-sidebar-float-submenu-container');
      let targetSidebar = <HTMLElement>document.getElementById('sidebar');
      const targetHeight = targetElm.offsetHeight;
      this.appSidebarFloatSubMenuRight = 'auto';
      this.appSidebarFloatSubMenuLeft = (this.appSidebarFloatSubMenuOffset.width + targetSidebar.offsetLeft) + 'px';

      if ((windowHeight - targetTop) > targetHeight) {
        this.appSidebarFloatSubMenuTop = this.appSidebarFloatSubMenuOffset.top + 'px';
        this.appSidebarFloatSubMenuBottom = 'auto';
        this.appSidebarFloatSubMenuArrowTop = '20px';
        this.appSidebarFloatSubMenuArrowBottom = 'auto';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = 'auto';
      } else {
        this.appSidebarFloatSubMenuTop = 'auto';
        this.appSidebarFloatSubMenuBottom = '0';

        const arrowBottom = (windowHeight - targetTop) - 21;
        this.appSidebarFloatSubMenuArrowTop = 'auto';
        this.appSidebarFloatSubMenuArrowBottom = arrowBottom + 'px';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = arrowBottom + 'px';
      }
    }, 0);
  }

  showAppSidebarFloatSubMenu(menu: any, e: any) {
    if (this.appSettings.appSidebarMinified) {
      clearTimeout(this.appSidebarFloatSubMenuHide);

      this.appSidebarFloatSubMenu = menu;
      this.appSidebarFloatSubMenuOffset = e.target.getBoundingClientRect();
      this.calculateAppSidebarFloatSubMenuPosition();
    }
  }

  hideAppSidebarFloatSubMenu() {
    this.appSidebarFloatSubMenuHide = setTimeout(() => {
      this.appSidebarFloatSubMenu = '';
    }, this.appSidebarFloatSubMenuHideTime);
  }

  remainAppSidebarFloatSubMenu() {
    clearTimeout(this.appSidebarFloatSubMenuHide);
  }

  expandCollapseSubmenu(currentMenu: any, allMenu: any, active: any) {
    for (let menu of allMenu) {
      if (menu != currentMenu) {
        menu.state = 'collapse';
      }
    }
    if (active.isActive) {
      currentMenu.state = (currentMenu.state && currentMenu.state == 'collapse') ? 'expand' : 'collapse';
    } else {
      currentMenu.state = (currentMenu.state && currentMenu.state == 'expand') ? 'collapse' : 'expand';
    }
  }

  appSidebarSearch(e: any) {
    let value = e.target.value;
    value = value.toLowerCase();

    if (value) {
      this.searchMenu(value);
    } else {
      this.cleanMenu();
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    this.scrollTop = (this.appSettings.appSidebarMinified) ? event.srcElement.scrollTop + 40 : 0;
    if (typeof (Storage) !== 'undefined') {
      localStorage.setItem('sidebarScroll', event.srcElement.scrollTop);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.setMode();
  }

  ngAfterViewChecked(): void {
    if (typeof (Storage) !== 'undefined' && localStorage['sidebarScroll']) {
      if (this.sidebarScrollbar?.nativeElement) {
        this.sidebarScrollbar.nativeElement.scrollTop = localStorage['sidebarScroll'];
      }
    }
  }

  isActive(url: string): boolean {
    return window.location.href.includes(url);
  }

  private cleanMenu(): void {
    for (let menu of this.menus) {
      menu['hide'] = '';
      menu['state'] = '';
    }
  }

  private setMode(): void {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  private searchMenu(value: any): void {
    for (let menu of this.menus) {
      let title = menu.title;
      title = title.toLowerCase();

      if (title.search(value) > -1) {
        menu['hide'] = false;
        if (menu.submenu) {
          menu['state'] = 'expand';
        }
      } else {
        this.hideMenu(menu, value);
      }
    }
  }

  private hideMenu(menu: AppMenu, value: any): void {
    let hasSearch = false;
    if (menu.submenu) {
      for (const element of menu.submenu) {
        let subtitle = element.title;
        subtitle = subtitle.toLowerCase();

        if (subtitle.search(value) > -1) {
          hasSearch = true;
        }
      }
    }
    if (hasSearch) {
      menu['hide'] = false;
      menu['state'] = 'expand';
    } else {
      menu['hide'] = true;
    }
  }
}
