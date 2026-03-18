import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CountryModel, StateModel } from '@app/features/general/models';
import { StateService } from '@app/features/general/services';
import { sortType } from '@app/@shared';

@Component({
  selector: 'state-list',
  templateUrl: './state-list.container.html'
})
export class StateListContainer implements OnInit {
  pagination: PaginationModel = defaultPagination;
  selectedCountry: CountryModel | undefined = undefined;
  hasAdd: boolean = false;

  private readonly _entities = new BehaviorSubject<StateModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  constructor(
    private router: Router,
    private loading: LoadingService,
    private stateService: StateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService
  ) { 
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.States, PermissionActionEnum.Delete);
  }

  ngOnInit(): void {
    this.loadAttributes();
    this.performSearch();
  }

  addNew(): void {
    this.router.navigate(['general', 'state-details']);
  }

  onKeywordSearch(criteria: string): void {
    this.pagination = { ...this.pagination, c: criteria, pi: 1 };
    this.performSearch();
  }

  onPagerChange(entity: PaginationModel): void {
    this.pagination = { ...entity };
    this.performSearch();
  }

  sortBy(column: string): void {
    const { s } = this.pagination;

    this.pagination = {
      ...this.pagination,
      s: `${column} ${sortType(s ?? '')}`
    };

    this.performSearch();
  }

  editEntity(entity: StateModel): void {
    if (entity.id >= 0) {
      this.router.navigate(['general', 'state-details'], { queryParams: { id: entity.id } });
    }
  }

  deleteEntity(entity: StateModel): void {
    Swal.fire({
      title: this.messageService.getTranslate('Labels.DeleteTitle'),
      text: this.messageService.getTranslate('Labels.DeleteMessage'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.messageService.getTranslate('Labels.Confirm'),
      cancelButtonText: this.messageService.getTranslate('Labels.Cancel')
    })
      .then((response: SweetAlertResult) => {
        if (response.isConfirmed) {
          this.confirmDeletion(entity.id);
        }
      });
  }

  selectCountry(c: CountryModel): void {
    this.selectedCountry = c;
    this.pagination.pi = 1;
    this.performSearch();
  }

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.stateService.delete$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.pagination = {
            ...this.pagination,
            pi: 1
          }
          this.performSearch();
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire(this.messageService.getTranslate('Labels.DeleteEntry'), this.messageService.getTranslate('Labels.DeleteSuccessfully'), 'success');
          } else {
            Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private performSearch(): void {
    this.loading.show();
    this.pagination.tr = 0;
    this.pagination.ti = 0;
    this._entities.next([]);
    const countryId = this.selectedCountry !== undefined ? this.selectedCountry.id : 0;

    this.stateService.getPaged$(this.pagination, countryId)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
          this.updatePagination();
        })
      )
      .subscribe({
        next: (res) => {
          this._entities.next(res.data);
          this.pagination.ti = res?.totalRows;
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private updatePagination(): void {
    const entities = this._entities.value;

    this.pagination = {
      ...this.pagination,
      tr: entities?.length
    }
  }

  private loadAttributes(): void {
    this.loading.show();
    this._countries.next([]);

    this.commonService.getCountries$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._countries.next(res);
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }
}
