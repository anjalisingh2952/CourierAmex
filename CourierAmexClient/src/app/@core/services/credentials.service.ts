import { Injectable } from '@angular/core';

import { SESSION_CREDENTIALSKEY } from '@app/@shared';
import { Credentials, OperationTypeEnum, PermissionActionEnum, PermissionsEnum } from '@app/models';

@Injectable()
export class CredentialsService {
  private _credentials?: Credentials;

  constructor() {
    const savedCredentials = sessionStorage.getItem(SESSION_CREDENTIALSKEY) || localStorage.getItem(SESSION_CREDENTIALSKEY);
    if (savedCredentials) {
      const creds = atob(savedCredentials);
      this._credentials = JSON.parse(creds);
    }
  }

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  get credentials(): Credentials | undefined {
    return this._credentials;
  }

  setCredentials(credentials?: Credentials) {
    this._credentials = credentials;

    if (credentials) {
      const coded = btoa(JSON.stringify(credentials));
      sessionStorage.setItem(SESSION_CREDENTIALSKEY, coded);
    } else {
      sessionStorage.removeItem(SESSION_CREDENTIALSKEY);
    }
  }

  hasPermission(permissionId: PermissionsEnum, type: PermissionActionEnum): boolean {
    const permissions = this.credentials?.user?.permissions;
    let isValid = null;

    if (!!permissions && permissions?.length > 0) {
      switch (type) {
        case PermissionActionEnum.View:
          isValid = permissions.find(p => p.id === permissionId && !!p.view);
          break;
        case PermissionActionEnum.Add:
          isValid = permissions.find(p => p.id === permissionId && !!p.add);
          break;
        case PermissionActionEnum.Update:
          isValid = permissions.find(p => p.id === permissionId && !!p.update);
          break;
        case PermissionActionEnum.Delete:
          isValid = permissions.find(p => p.id === permissionId && !!p.delete);
          break;
      }

      if (isValid) {
        return true;
      }
    }

    return false;
  }

  isGatewayUser(): boolean {
    if (this.credentials?.user.operationType === OperationTypeEnum.Gateway) {
      return true;
    }
    return false;
  }
}
