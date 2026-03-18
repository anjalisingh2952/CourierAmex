import { Component, EventEmitter, Input, OnChanges } from '@angular/core';

import { PageOptions, PaginationModel, defaultPagination } from '@app/models';

@Component({
  selector: 'shared-pagination',
  templateUrl: './pagination.component.html',
  outputs: ['onPaginationChange']
})
export class PaginationComponent implements OnChanges {
  private _pagination: PaginationModel = defaultPagination;
  onPaginationChange = new EventEmitter<PaginationModel>();
  PageOptions = PageOptions;
  beginIndex: number = 1;
  endIndex: number = 1;
  totalItems: number = 1;
  totalPages: number = 1;

  @Input()
  set Pagination(pagination: PaginationModel) {
    this._pagination = pagination ?? defaultPagination;
  };
  get Pagination(): PaginationModel {
    return this._pagination;
  }

  @Input() type: 'Header' | 'Footer' = 'Header';

  get RecordCount(): any {
    return { value: this._pagination.ps }
  }

  get ShowingRecords(): any {
    return { begin: this.beginIndex, end: this.endIndex, total: this.Pagination.ti }
  }

  ngOnChanges(): void {
    this.calculateResults();
  }

  setPageSize(ps: number): void {
    this._pagination = { ...this._pagination, ps: ps };
    this.onPaginationChange.emit({ ...this._pagination });
  }

  gotoPage(page: 'first' | 'prev' | 'next' | 'last'): void {
    let isValid = false;
    switch (page) {
      case 'first':
        if (this._pagination && this._pagination.pi > 1) {
          this._pagination = { ...this._pagination, pi: 1 };
          isValid = true;
        }
        break;
      case 'prev':
        if (this._pagination && this._pagination.pi > 1) {
          const { pi } = this._pagination;
          this._pagination = { ...this._pagination, pi: pi - 1 };
          isValid = true;
        }
        break;
      case 'next':
        if (this._pagination && this._pagination.pi !== this.totalPages) {
          const { pi } = this._pagination;
          this._pagination = { ...this._pagination, pi: pi + 1 };
          isValid = true;
        }
        break;
      case 'last':
        if (this._pagination && this._pagination.pi !== this.totalPages) {
          this._pagination = { ...this._pagination, pi: this.totalPages };
          isValid = true;
        }
        break;
    }
    if (isValid) {
      this.onPaginationChange.emit({ ...this._pagination });
    }
  }

  private calculateResults(): void {
    if (this._pagination !== null) {
      this.beginIndex = ((this._pagination.pi - 1) * this._pagination?.ps) + 1;
      this.endIndex = this.beginIndex + ((this._pagination.tr ?? 0) - 1);
      this.totalPages = Math.ceil((this._pagination.ti ?? 0) / this._pagination.ps);
    }
  }
}
