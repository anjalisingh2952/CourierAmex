import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, exhaustMap, filter, finalize, map, of, takeUntil, tap } from 'rxjs';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import { CompanyModel, CountryModel, RoleModel, RoleService, StateModel, UserModel, UserService, newUserModel } from '@app/features';
import { AuthService, CommonService, LoadingService, MessageService } from '@app/@core';
import { ForgotRequest, GenericResponse } from '@app/models';
import { DATE_FORMAT, getDateString } from '@app/@shared';

@Component({
  selector: 'settings-user-details',
  templateUrl: './user-details.container.html'
})
export class UserDetailsContainer implements OnDestroy {

  private readonly _user = new BehaviorSubject<UserModel>({ ...newUserModel });
  user$ = this._user.asObservable();

  private readonly _roles = new BehaviorSubject<RoleModel[]>([]);
  roles$ = this._roles.asObservable();

  readonly companies$: Observable<CompanyModel[]>;
  readonly countries$: Observable<CountryModel[]>;
  readonly states$: Observable<StateModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private authService: AuthService,
    private commonService: CommonService,
    private roleService: RoleService,
    private userService: UserService,
    private messages: MessageService
  ) {
    const $selectedCountry = this.user$.pipe(
      map((state: UserModel) => ({ countryId: state.countryId })),
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId)
    );

    const $suggestUsername = this.user$.pipe(
      map((state: UserModel) => ({ id: state.id, name: state.name, lastname: state.lastname, username: state.username })),
      distinctUntilChanged((prev, curr) => prev.name === curr.name && prev.lastname === curr.lastname),
    );

    $suggestUsername
      .pipe(
        takeUntil(this.destroy$),
        filter(state => state?.id === '' && state?.name.length > 3 && state?.lastname.length > 3),
      )
      .subscribe(state => {
        let user = this._user.value;
        user.username = `${state.name.charAt(0) ?? ''}${state.lastname ?? ''}`.toLowerCase();
        this._user.next(user);
      });

    this.companies$ = this.commonService.getCompanies$();
    this.countries$ = this.commonService.getCountries$();

    this.states$ = $selectedCountry.pipe(
      distinctUntilChanged((prev, curr) => prev.countryId === curr.countryId),
      filter(state => state?.countryId !== undefined),
      exhaustMap(state => this.commonService.getStates$(state.countryId ?? 0)
        .pipe(
          finalize(() => this.loading.hide()),
          catchError(_ => of([])))
      ));

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.has('id')) {
          this.loadEntity(params.get('id') ?? '');
        } else {
          this.loadRoles();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(entity: UserModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<UserModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['user', 'details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
        } else {
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      }
    }

    if (entity.id === '') {
      this.userService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.userService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['user', 'list']);
  }

  onLoadStates(id: number | undefined): void {
    this._user.next({
      ...this._user.value,
      countryId: id,
      stateId: 0
    });
  }

  onUpdateUser(entity: UserModel): void {
    if (entity.operationType === 1) {
      entity.companyId = undefined;
    }
    this._user.next({ ...entity });
  }

  resetPassword(email: string): void {
    this.loading.show();
    const request: ForgotRequest = {
      email: email
    }

    this.authService.forgot(request)
      .pipe(
        finalize(() => {
          this.loading.hide();
        })
      ).subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire({ icon: 'info', title: this.messages.getTranslate('Labels.Information'), text: this.messages.getTranslate('UserDetails.ResetPasswordSuccess') });
          } else {
            Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InvalidEmail') });
          }
        },
        error: (e) => {
          console.error(e);
          Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InternalError') });
        }
      });
  }

  onCreatePassword(entity: UserModel): void {
    if ((entity.tempPassword ?? '') === '') return;
    this.loading.show();

    this.userService.createPassword$(entity.id, entity.tempPassword ?? '')
      .pipe(
        finalize(() => {
          this.loading.hide();
        })
      ).subscribe({
        next: (res) => {
          if (res?.success) {
            Swal.fire({ icon: 'info', title: this.messages.getTranslate('Labels.Information'), text: this.messages.getTranslate('UserDetails.CreatePasswordSuccess') });
          } else {
            Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InvalidEmail') });
          }
        },
        error: (e) => {
          console.error(e);
          Swal.fire({ icon: 'error', title: this.messages.getTranslate('Labels.Error'), text: this.messages.getTranslate('Labels.InternalError') });
        }
      });
  }

  private loadEntity(id: string): void {
    if (id.length > 0) {
      this.loading.show();

      this.userService.getById$(id)
        .pipe(
          filter((res) => !!res && !!res.success && !!res.data),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              const entity = res.data;
              this._user.next({
                ...entity,
                companyId: entity.companyId === 0 ? undefined : entity.companyId,
                dateOfBirthValue: (entity.dateOfBirth ?? 0) > 0 ? format(new Date(entity.dateOfBirth ?? 0), DATE_FORMAT) : ''
              });
              this._roles.next(entity.roles);
            }
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          }
        });
    } else {
      Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
      this.goBack();
    }
  }

  private loadRoles(): void {
    this.loading.show();
    this._roles.next([]);

    this.roleService.getAll$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this._roles.next(res);
          this._user.next({
            ...newUserModel,
            roles: res
          });
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }
}
