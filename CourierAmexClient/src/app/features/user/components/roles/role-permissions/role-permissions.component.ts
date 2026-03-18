import { Component } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { UserPermissionModel } from '@app/models';

@Component({
  selector: 'settings-role-permission',
  templateUrl: './role-permissions.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  inputs: ['rolePermissions']
})
export class RolePermissionsComponent {
  rolePermissions!: UserPermissionModel[];
  selectAllView: boolean = false;
  selectAllAdd: boolean = false;
  selectAllEdit: boolean = false;
  selectAllDelete: boolean = false;

  // checkAll(value: boolean, type: string): void {
  //   if (this.rolePermissions.length > 0) {
  //     this.rolePermissions.forEach(perm => {
  //       switch (type) {
  //         case 'view':
  //           perm.view = value;
  //           if (!perm.view) {
  //             perm.add = false;
  //             perm.update = false;
  //             perm.delete = false;
  //           }
  //           break;
  //         case 'add':
  //           perm.add = value;
  //           if (perm.add) {
  //             perm.view = true;
  //           }
  //           break;
  //         case 'update':
  //           perm.update = value;
  //           if (perm.update) {
  //             perm.view = true;
  //           }
  //           break;
  //         case 'delete':
  //           perm.delete = value;
  //           if (perm.delete) {
  //             perm.view = true;
  //           }
  //           break;
  //       }
  //     });
  //   }
  // }

  check(perm: UserPermissionModel, type: string): void {
    switch (type) {
      case 'view':
        perm.view = !perm.view;
        if (!perm.view) {
          perm.add = false;
          perm.update = false;
          perm.delete = false;
        }
        break;
      case 'add':
        perm.add = !perm.add;
        if (perm.add) {
          perm.view = true;
        }
        break;
      case 'update':
        perm.update = !perm.update;
        if (perm.update) {
          perm.view = true;
        }
        break;
      case 'delete':
        perm.delete = !perm.delete;
        if (perm.delete) {
          perm.view = true;
        }
        break;
    }
  }
}
