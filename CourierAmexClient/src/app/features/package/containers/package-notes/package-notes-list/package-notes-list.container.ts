import { AfterViewInit, ChangeDetectorRef, Component, OnInit , TemplateRef, ViewChild} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PackageNotesModalComponent } from '@app/features/package/components/packages-notes/package-notes-modal.component';
import { PackageNoteComponent } from '@app/@shared';
import { BehaviorSubject, filter, finalize, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal, {SweetAlertResult} from 'sweetalert2';

import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { GenericResponse } from "@app/models";
import { CompanyModel } from '@app/features/company';
import { PackageNotesService } from '@app/features/package/services/package-notes.service';
import { PackageNotesModel, newPackageNotes } from '@app/features/package/models/package-notes.model';


@Component({
  selector: 'app-packagenotes-list',
  templateUrl: './package-notes-list.container.html'

})
export class PackageNotesListContainer implements OnInit, AfterViewInit {
  noteData: PackageNotesModel ;
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild("actionTemplate") actionTemplate!: TemplateRef<any>;
  
  customerCode: string = '';
  courierNumber: string = '';
  pagination: PaginationModel = defaultPagination;
  selectedCompany: CompanyModel | undefined = undefined;
  hasAdd: boolean = false;
  hasDelete: boolean = false;
  showCompanies: boolean = false;
  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'createdAt',
    sortDirection: 'DESC',
  };

  translations = {
    CompanyName:'',
    Codigo: '',
    Compannia: '',
    NombreCompleto:'',
    Message: '',
    DueDate: '',
    CreatedAt: '',
    Courier:'',
    IdUser: '',
    action:'',
    Id:0,
    status:''
  };

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies$ = this._companies.asObservable();

  private readonly _entities = new BehaviorSubject<PackageNotesModel[]>([]);
  entities$ = this._entities.asObservable();

  constructor(
    // private router: Router,
    private loading: LoadingService,
    private translate: TranslateService,
    private commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentailsService: CredentialsService,
    private packageNotesService: PackageNotesService,
    private modalService: NgbModal 
  ) {
    this.showCompanies = !this.credentailsService.isGatewayUser();
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Add);
    this.hasDelete = this.credentailsService.hasPermission(PermissionsEnum.Packages, PermissionActionEnum.Delete);
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get(['Labels.CompanyName',
      'Labels.Actions',
      'Labels.Status',
      'PackageNotes.Codigo',
      'PackageNotes.Compannia',
      'PackageNotes.NombreCompleto',
      'PackageNotes.Courier',
      'PackageNotes.Message',
      'PackageNotes.IdUser',
      'PackageNotes.DueDate',
      'PackageNotes.CreatedAt',
      'PackageNotes.Sincronized',
      'Sidebar.User'])
      .subscribe(
        translations => {
          this.translations.Id = translations['PackageNotes.Id']; 
          this.translations.CompanyName = translations['PackageNotes.CompanyName']; 
          this.translations.Codigo = translations['PackageNotes.Codigo']; 
          this.translations.Courier = translations['PackageNotes.Courier']; 
          this.translations.Compannia = translations['PackageNotes.Compannia']; 
          this.translations.NombreCompleto = translations['PackageNotes.NombreCompleto']; 
          this.translations.Message = translations['PackageNotes.Message'];
          this.translations.DueDate = translations['PackageNotes.DueDate'];
          this.translations.CreatedAt = translations['PackageNotes.CreatedAt'];
          this.translations.IdUser = translations['Sidebar.User'];
          this.translations.action = translations['Labels.Actions'];
          this.translations.status = translations['Labels.Status']
        });
  }

  ngOnInit(): void {
    this.loadAttributes();
  }

  ngAfterViewInit(): void {
    if (this.showCompanies) {
      // this.columns.push({ field: 'companyName', label: this.translations.CompanyName, sortable: true });
    }
    this.columns.push({ field: 'id', label: this.translations.Id ? this.translations.Id.toString() : 'Id', sortable: false });
    //this.columns.push({ field: 'createdAt', label: this.translations.CreatedAt, sortable: true, type: 'date' });
    this.columns.push({ field: 'dueDate', label: this.translations.DueDate, sortable: true, type: 'date' });
    //this.columns.push({ field: 'idUser', label: this.translations.IdUser, sortable: true });
    this.columns.push({ field: 'codigo', label: this.translations.Codigo, sortable: true });
    this.columns.push({ field: 'nombreCompleto', label: this.translations.NombreCompleto, sortable: true });
    this.columns.push({ field: 'status', label: this.translations.status, sortable: true, contentTemplate: this.statusTemplate });
    //this.columns.push({ field: 'compannia', label: this.translations.Compannia, sortable: true });
    this.columns.push({ field: 'courier', label: this.translations.Courier, sortable: true });
    this.columns.push({ field: 'message', label: this.translations.Message, sortable: true });
    this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate});
    this.changeDetectorRef.detectChanges();
  }

  onCustomerCodeChange(newCodigo: string) {
    this.customerCode = newCodigo;
    this.onStateChange(this.state); 
  }

  onCourierNumberChange(newPackageNumber: string) {
    /* this.packageNumber = newPackageNumber;
    this.onStateChange(this.state);  */
  }

  onSearch(): void {
    this.onStateChange(this.state); 
  }

  protected onStateChange(state: TableState) {
    this.state = { ...state };
    this.pagination = {
      ...this.pagination,
      c: state.searchTerm,
      pi: state.page,
      ps: state.pageSize,
      s: `${state.sortColumn} ${state.sortDirection}`
    };
    this.performSearch();
  }


  protected addNew(): void {
    this.openPackageNotesModal();
  }

  protected editEntity(entity: PackageNotesModel): void {
    if (entity.id > 0) {
      this.openPackageNotesModal(entity, 'Editing');
    }
  }

  protected deleteEntity(entity: PackageNotesModel): void {
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

  //Cambio de compañía
  protected selectEntity(entity: CompanyModel | undefined): void {
    this.selectedCompany = entity;
    this.onStateChange({
      searchTerm: this.state?.searchTerm || '',
      page: 1,
      pageSize: this.state?.pageSize || defaultPagination.ps,
      sortColumn: this.state?.sortColumn,
      sortDirection: this.state.sortDirection
    });
  }

  private confirmDeletion(id: number): void {
    this.loading.show();
    this.packageNotesService.delete$(id)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.onStateChange({
            searchTerm: this.state?.searchTerm || '',
            page: 1,
            pageSize: this.state?.pageSize || defaultPagination.ps,
            sortColumn: this.state?.sortColumn,
            sortDirection: this.state.sortDirection
          });
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
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;

    this.packageNotesService.getPaged$(this.pagination, companyId, this.customerCode, this.courierNumber)
      .pipe(
        filter((res) => res?.success && res?.data?.length > 0),
        map((res) => {
          const today = new Date();
          res.data = 
          res.data
          .filter((packageNote: any) => new Date(packageNote.dueDate) > today)
          .map((packageNote: any )=>{
            const dueDate = new Date(packageNote.dueDate);
            packageNote.dueDate = dueDate.getFullYear() === 2099 ? '' : packageNote.dueDate;
            return packageNote;
          });
          return res;
        }),
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
    this._companies.next([]);

    this.commonService.getCompanies$()
      .pipe(
        filter((res) => res && res.length > 0),
        finalize(() => {
          this.setDefaultCompany();
          this.loading.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this._companies.next(res ?? []);
        },
        error: (error) => {
          console.error(error);
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      });
  }

  private setDefaultCompany(): void {
    const cias = this._companies.value;
    if (cias && cias.length > 0) {
      const userCia = this.credentailsService.isGatewayUser()
        ? cias.find(c => c.id === this.credentailsService.credentials?.user.companyId)
        : cias[0]; // Selecciona la primera compañía si no es un Gateway User
  
      if (userCia) {
        this.selectEntity(userCia);
        return;
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  }

  /* private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      const cias = this._companies.value;
      if (cias && cias.length > 0) {
        const userCia = cias.find(c => c.id === this.credentailsService.credentials?.user.companyId);
        if (userCia) {
          this.selectEntity(userCia);
          return;
        }
      }
    }
    setTimeout(() => {
      this.performSearch();
    }, 100);
  } */

  private openPackageNotesModal(noteData?: PackageNotesModel, openMode?: string) {
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    if(companyId == 0)
    {
      Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.CompanyNotSelectedError'), 'error');
      return ;
    }
    let nombreCliente = '';
    if(this._entities.value.length == 1 && (this.customerCode || this.courierNumber )){
      const entity = this._entities.value[0]; 
      nombreCliente = entity.compannia ? entity.compannia : entity.nombreCompleto;
    }
    const modalRef = this.modalService.open(PackageNoteComponent, {size: 'xl'});
    modalRef.componentInstance.noteData = noteData ? {...noteData} : { ...this.noteData} ; // Envía datos si es necesario
    modalRef.componentInstance.openMode = openMode ? openMode : 'New' ;
    modalRef.componentInstance.customerCode = this.customerCode ? this.customerCode : '';
    modalRef.componentInstance.courierNumber = this.courierNumber ? this.courierNumber : '';
    modalRef.componentInstance.nombreCliente = nombreCliente;
    modalRef.componentInstance.companyId = companyId;

    modalRef.componentInstance.save.subscribe((data: PackageNotesModel) => {
    // Lógica para manejar los datos guardados
      if(data.message.length > 0){
        this.save(data);
      } 
      
    });

    modalRef.componentInstance.cancel.subscribe(() => {
      // Lógica para manejar la cancelación, si es necesario
    });
  }

  save(entity: PackageNotesModel){
    const companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
    this.loading.show();
    const observer = {
      next: (res: GenericResponse<PackageNotesModel>) => {
        if (res?.success && res?.data) {
          Swal.fire(this.messageService.getTranslate('Labels.SaveChanges'), this.messageService.getTranslate('Labels.SaveSuccessfully'), 'success');
        } else {
          Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire(this.messageService.getTranslate('Labels.Error'), this.messageService.getTranslate('Labels.InternalError'), 'error');
      }
    }
  
    const entityObject = {
      id : entity.id,
      codigo : entity.codigo,
      courier : entity.courier,
      message : entity.message,
      duedate: entity.dueDate,
      idUser : entity.idUser,
      sincronized : entity.sincronized,
      status: entity.status,
      companyId: companyId
    };

    if(entity.id === 0){
      this.packageNotesService.create$(entityObject)
      .pipe(finalize(()=> {
        this.loading.hide();
      }))
      .subscribe(observer);
    }
  }
}