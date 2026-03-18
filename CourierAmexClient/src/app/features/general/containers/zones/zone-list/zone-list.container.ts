import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, filter, finalize } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CountryModel, StateModel, ZoneModel } from '@app/features/general/models';
import { ZoneService } from '@app/features/general/services';
import { sortType } from '@app/@shared';

@Component({
  selector: 'zone-list',
  templateUrl: './zone-list.container.html'
})
export class ZoneListContainer implements OnInit {
  pagination: PaginationModel = defaultPagination;
  selectedCountry: CountryModel | undefined = undefined;
  selectedState: StateModel | undefined = undefined;
  hasAdd: boolean = false;

  private readonly _entities = new BehaviorSubject<ZoneModel[]>([]);
  entities$ = this._entities.asObservable();

  private readonly _countries = new BehaviorSubject<CountryModel[]>([]);
  countries$ = this._countries.asObservable();

  private readonly _states = new BehaviorSubject<StateModel[]>([]);
  states$ = this._states.asObservable();

  constructor(
    private router: Router,
    private loading: LoadingService,
    private zoneService: ZoneService,
    private commonService: CommonService,
    private messageService: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Zones, PermissionActionEnum.Delete);
  }

  ngOnInit(): void {
    this.loadAttributes();
    this.performSearch();
  }

  addNew(): void {
    this.router.navigate(['general', 'zone-details']);
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

  editEntity(entity: ZoneModel): void {
    if (entity.id >= 0) {
      this.router.navigate(['general', 'zone-details'], { queryParams: { id: entity.id } });
    }
  }

  deleteEntity(entity: ZoneModel): void {
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
    this.loadStates();
  }

  selectState(s: StateModel): void {
    this.selectedState = s;
    this.pagination.pi = 1;
    this.performSearch();
  }

  loadStates(): void {
    this._states.next([]);
    const countryId = this.selectedCountry?.id ?? 0;

    if (countryId > 0) {
      this.loading.show();

      this.commonService.getStates$(countryId)
        .pipe(
          filter((res) => res?.length > 0),
          finalize(() => {
            this.performSearch();
            this.loading.hide();
          })
        )
        .subscribe({
          next: (res) => {
            this._states.next(res);
          },
          error: (err: any) => {
            console.error(err);
          }
        });
    }
  }

  private confirmDeletion(id: number): void {
    this.loading.show();

    this.zoneService.delete$(id)
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
    const countryId = this.selectedCountry?.id ?? 0;
    const stateId = this.selectedState?.id ?? 0;

    this.zoneService.getPaged$(this.pagination, countryId, stateId)
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
