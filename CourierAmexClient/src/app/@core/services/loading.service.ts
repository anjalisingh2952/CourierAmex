import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

@Injectable()
export class LoadingService {
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();

  public show(): void {
    this._isLoading$.next(true);
  }

  public hide(): void {
    this._isLoading$.next(false);
  }
}
