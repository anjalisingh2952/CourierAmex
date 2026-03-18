import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject, filter, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel, RoleModel, RoleService } from '@app/features';
import { DEFAULT_STATUS_ACTIVE, getDateString } from '@app/@shared';
import { GenericResponse, OperationTypeEnum } from '@app/models';

@Component({
  selector: 'settings-role-details',
  templateUrl: './role-details.container.html'
})
export class RoleDetailsContainer implements OnInit, OnDestroy {
  role!: RoleModel;
  showCompanies: boolean = false;
  selectedCompany: CompanyModel | undefined = undefined;

  readonly companies$: Observable<CompanyModel[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
    private commonService: CommonService,
    private roleService: RoleService,
    private messages: MessageService,
    private credentailsService: CredentialsService
  ) {
    this.companies$ = this.commonService.getCompanies$();

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.has('id')) {
          this.loadEntity(params.get('id') ?? '');
        } else {
          this.loadAttributes();
        }
      });
  }

  ngOnInit(): void {
    this.companies$
      .pipe(
        filter(res => res && res.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(companies => {
        this.checkUser(companies);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(entity: RoleModel): void {
    this.loading.show();

    const observer = {
      next: (res: GenericResponse<RoleModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
          this.router.navigate(['user', 'role-details'], { queryParams: { id: res.data.id, dt: getDateString() }, replaceUrl: true });
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
      this.roleService.create$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    } else {
      this.roleService.update$(entity)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe(observer);
    }
  }

  goBack(): void {
    this.router.navigate(['user', 'roles']);
  }

  private loadEntity(id: string): void {
    if (id.length > 0) {
      this.loading.show();

      this.roleService.getById$(id)
        .pipe(
          filter((res) => !!res && !!res.success && !!res.data),
          finalize(() => this.loading.hide())
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              this.role = res.data;
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

  private loadAttributes(): void {
    this.loading.show();

    this.commonService.getPermissions$()
      .pipe(
        filter((res) => res?.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe({
        next: (res) => {
          this.role = {
            id: '',
            companyId: 0,
            name: '',
            status: DEFAULT_STATUS_ACTIVE,
            rolePermissions: res
          };
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

  private checkUser(companies: CompanyModel[]): void {
    const user = this.credentailsService.credentials?.user;
    if (user?.operationType === OperationTypeEnum.Gateway) {
      const cia = companies.find(c => c.id === user.companyId);
      if (cia) {
        this.selectedCompany = cia;
      }
    } else {
      this.showCompanies = true;
    }
  }
}
