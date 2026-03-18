import { inject, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CommodityModel } from '@app/features/company';
import { LoadCustomsTaxexService } from '../../services/load-customs-taxex.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { PackageList, ErrorPackage } from '../../models/load-customs-taxes.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-load-customs-taxex',
  templateUrl: './load-customs-taxex.component.html',
  styleUrls: ['./load-customs-taxex.component.scss']
})
export class LoadCustomsTaxexComponent implements OnInit {
  isGatewayUser = false;
  selectedCompany: any = 0;
  packageList: PackageList[] = [];
  errorList: ErrorPackage[] = [];
  loading = true;
  LoadByPackage = true;
  LoadByBag = false;
  private readonly _entities = new BehaviorSubject<CommodityModel[]>([]);
  entities$ = this._entities.asObservable();
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private translate: TranslateService,
    private loadingService: LoadingService,
    private commonService: CommonService,
    private credentailsService: CredentialsService,
    private toastr: ToastrService,
    private messageService: MessageService,
    private loadCustomsTaxexService: LoadCustomsTaxexService
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    const router = inject(Router);
    if (!this.isGatewayUser) {
      router.navigate(['error', 'unauthorized'], { replaceUrl: true });
    }
  }

  ngOnInit(): void {
    this.setDefaultCompany();
  }

  private setDefaultCompany(): void {
    if (this.isGatewayUser) {
      const userCia = this.credentailsService.credentials?.user.companyId;
      if (userCia) {
        this.selectedCompany = userCia;
      }
    }
  }

  toggleLoadByBag() {
    if (this.LoadByBag) {
      this.LoadByPackage = false;
    }
  }

  toggleLoadByPackage() {
    if (this.LoadByPackage) {
      this.LoadByBag = false;
    }
  }

  clearFile(): void {
    this.packageList = [];
    this.errorList = [];

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.LoadByPackage = true;
    this.LoadByBag = false;
  }

  uploadRxcel(event: any): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      console.error('No file selected');
      return;
    }

    const _file = input.files[0];
    const _reader = new FileReader();

    _reader.onload = (e: any) => {
      const binaryStr = e.target.result;

      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

      this.packageList = [];
      this.errorList = [];

      jsonData.forEach((row: any[], rowIndex: number) => {
        if (rowIndex === 0) return; // skip header

        const CRTRACK = row[0];
        const Transaction = row[1]?.toString().trim() || '';
        const FOB = parseFloat(row[2]);
        const CIF = parseFloat(row[3]);
        const Amount = parseFloat(row[4]);
        const DUA = row[5]?.toString().trim() || '';

        // Determine load type only once per file, based on first data row

        if (typeof CRTRACK === 'string') {
          this.LoadByBag = true;
          this.LoadByPackage = false;
        } else if (typeof CRTRACK === 'number') {
          this.LoadByPackage = true;
          this.LoadByBag = false;
        }


        let isError = false;
        const errorMessages: string[] = [];

        // Validate numeric fields
        if (isNaN(FOB)) {
          isError = true;
          errorMessages.push('Invalid FOB value');
        }
        if (isNaN(CIF)) {
          isError = true;
          errorMessages.push('Invalid CIF value');
        }
        if (isNaN(Amount)) {
          isError = true;
          errorMessages.push('Invalid Amount value');
        }

        // Validate required fields
        if (!CRTRACK && CRTRACK !== 0) {
          isError = true;
          errorMessages.push('CRTRACK is required');
        }

        debugger;
        // Create ErrorPackage item
        const item: ErrorPackage = {
          crtrack: CRTRACK?.toString().trim() || '',
          transaction: Transaction,
          fob: isNaN(FOB) ? 0 : FOB,
          cif: isNaN(CIF) ? 0 : CIF,
          amount: isNaN(Amount) ? 0 : Amount,
          dua: DUA,
          errorMessage: '',
        };



        // No validation errors, proceed with backend calls
        if (this.LoadByPackage) {
          this.loadCustomsTaxexService.getPackage(CRTRACK).subscribe(x => {
            if (!x.success) {
              debugger;
              errorMessages.push(x.message || 'Package not found');
              item.errorMessage = errorMessages?.join(', ') || '';
              this.errorList.push(item);
            } else {
              this.packageList.push({
                crtrack: CRTRACK.toString().trim(),
                transaction: Transaction,
                fob: isNaN(FOB) ? 0 : FOB,
                cif: isNaN(CIF) ? 0 : CIF,
                amount: isNaN(Amount) ? 0 : Amount,
                dua: DUA,
                companyId: this.selectedCompany,
                createdBy: this.credentailsService.credentials?.user?.username ?? 'system',
                createdDate: new Date(),
                loadType: 'Package'
              });
            }
          });
        } else if (this.LoadByBag) {
          this.loadCustomsTaxexService.getBag(CRTRACK).subscribe(x => {
            if (!x.success) {
              debugger;
              errorMessages.push(x.message || 'Bag not found');
              item.errorMessage = errorMessages?.join(', ') || '';
              this.errorList.push(item);
            } else {
              this.packageList.push({
                crtrack: CRTRACK.toString().trim(),
                transaction: Transaction,
                fob: isNaN(FOB) ? 0 : FOB,
                cif: isNaN(CIF) ? 0 : CIF,
                amount: isNaN(Amount) ? 0 : Amount,
                dua: DUA,
                companyId: this.selectedCompany,
                createdBy: this.credentailsService.credentials?.user?.username ?? 'system',
                createdDate: new Date(),
                loadType: 'Bag'
              });
            }
          });
        }
      });
    };

    _reader.readAsBinaryString(_file);


    debugger;
  }

  saveData(): void {
    if (this.packageList.length === 0) {
      Swal.fire("Warning","No data to save.","warning");
      return;
    }

    this.loadingService.show();

    this.loadCustomsTaxexService.insertCustomsTaxLoad(this.packageList).subscribe(
      response => {
        if (response.success) {
          Swal.fire("Success",'Customs tax data inserted successfully.',"success")
          this.packageList = [];
          this.errorList = [];
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        } else {
          Swal.fire("Error",'Failed to insert customs tax data.',"error")
        }
      },
      error => {
        Swal.fire("Error",'An error occurred while inserting customs tax data.',"error")
      },
      () => {
        this.loadingService.hide();
      }
    );
  }
}
