import { ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { CredentialsService, LoadingService, MessageService } from '@app/@core';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { defaultPagination, PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { CashierModel } from '../../models';
import { UserService } from '@app/features/user';
import { filter, finalize, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { ClientCashierService } from '../../services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cashier-users',
  templateUrl: './cashier-users.component.html',
  styleUrls: ['./cashier-users.component.scss']
})
export class CashierUsersComponent {
  @Input() entity!: CashierModel;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  @Input() users: any[] = [];
  userList: any[] = [];
  selectedUsers: any[] = [];

  pagination: PaginationModel = defaultPagination;
  hasAdd: boolean = false;
  selectedCashier: number = 0;
  hasUpdate: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'ASC',
  };

  translations = {
    user: '',
    userNumber: '',
    action: ''
  };
  constructor(private credentailsService: CredentialsService,
    private translate: TranslateService,
    private userService: UserService,
    private loading: LoadingService,
    private clientCashierService: ClientCashierService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private messageService: MessageService) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Cashiers, PermissionActionEnum.Update);
    this.route.queryParams
      .pipe(
        tap(_ => console.log('Query params:', _)),
        switchMap((params: { id?: string }) => {
          const id = +(params.id ?? 0);
          this.selectedCashier = id;
          return of(null);
        })
      )
      .subscribe();

    this.translate.get(['Labels.Name',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.userNumber = translations['Labels.Name'];
          this.translations.action = translations['Labels.Actions'];
        });
  }

  ngOnInit(): void {
    this.getUserList();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'username', label: this.translations.userNumber, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
    this.cd.detectChanges();
  }

  onCheckboxChange(event: any, entity: any): void {
    const currentChecked = event.target.checked;

    if (currentChecked !== entity.initialChecked) {
      const exists = this.selectedUsers.some(u => u.username === entity.username);
      if (!exists) {
        this.selectedUsers.push(entity);
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u.username !== entity.username);
    }

  }


  getUserList() {
    this.loading.show();
    this.userService.getPaged$(this.pagination)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        finalize(() => {
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          debugger
          this.userList = res.data;
          const userNumbers = this.users.map(u => u.userNumber);

          this.userList = this.userList.map(user => ({
            ...user,
            isChecked: userNumbers.includes(user.username),
            initialChecked: userNumbers.includes(user.username)
          }));
          this.selectedUsers = [];
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  SaveChanges() {
    if (this.selectedUsers.length === 0) {
      Swal.fire(
        this.messageService.getTranslate('Labels.Error'),
        this.messageService.getTranslate('Labels.NoUserSelected'),
        'error'
      );
      return;
    }

    this.loading.show();

    const companyId = this.credentailsService.credentials?.user.companyId;
    const pointOfSaleId = this.selectedCashier;

    const userList = this.selectedUsers.map(user => ({
      CompanyId: companyId,
      PointOfSaleId: pointOfSaleId,
      User: user.username
    }));

    this.clientCashierService.insertUserToCashier(userList).subscribe({
      next: (res) => {
        if (res) {
          Swal.fire(
            "Success",
            "Entry updated successfully",
            'success'
          );
        } else {
          Swal.fire(
            "Error",
            this.messageService.getTranslate('Labels.InternalError'),
            'error'
          );
        }
        this.loading.hide();
        this.selectedUsers = [];
      },
      error: () => {
        this.loading.hide();
        Swal.fire(
          this.messageService.getTranslate('Labels.Error'),
          this.messageService.getTranslate('Labels.InternalError'),
          'error'
        );
      }
    });
  }

  toggleSelectAllForAllList(){
    
  }
}