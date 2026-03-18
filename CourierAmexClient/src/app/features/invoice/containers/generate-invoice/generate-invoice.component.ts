import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit, ViewChild, HostListener, TemplateRef, inject } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, catchError, combineLatest, distinctUntilChanged, exhaustMap, filter, finalize, map, merge, of, switchMap, tap, from, concatMap } from 'rxjs';

import { CommonService, CredentialsService, LoadingService, MessageService } from '@app/@core';
import { CompanyModel } from '@app/features/company';
import { PageOptionsDefault, PaginationModel, PermissionActionEnum, PermissionsEnum, defaultPagination } from '@app/models';
import Swal from 'sweetalert2';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ManifestModel, newManifestModel } from '@app/models/manifest.model';
import { PackageCategoryModel, PackageItemDetail } from '@app/features/package/models';
import { CompanyInvoiceService } from '../../services';
import { InvoiceService } from '../../services';
import { AccountingDetail, CompanyInvoiceData, CompanyInvoiceDetail, CompanyInvoiceHeader, CustomerInfo, ElectronicInvoiceInformation, GroupedInvoiceData, InvoiceArticle, newCompanyInvoiceData, newCustomerInfo, newElectronicInvoiceInformation, newPackageInfo, PackageInvoiceSummary, SaveElectronicInvoiceInformation, saveManifestInvoice, saveMiamiInvoice } from '../../models';
import { TableRowCollapseEvent, TableRowExpandEvent, TableEditCompleteEvent } from 'primeng/table';
import { Manifestdetail, ManifestProducts } from '@app/features/reports/models/detailed-billing.model';
import { ReportsService } from '@app/features/reports/services';
import { ExchangeRateService } from '@app/features/company/services/exchange-rate.service';
import { log } from 'console';

export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss']
})
export class GenerateInvoiceComponent {
  //#region variables
  canSaveInvoice: boolean = true;
  documentTypes = [
    { id: 0, name: 'Select Type' },
    { id: 1, name: 'Physical ID' },
    { id: 2, name: 'Legal ID' },
    { id: 3, name: 'NITE' },
    { id: 4, name: 'Issuing DIMEX' },
    { id: 5, name: 'Passport' }
  ];
  isCollapsed1: boolean = true;
  isCollapsed2: boolean = true;
  isCollapsed3: boolean = true;

  manifestProductsList: ManifestProducts[] = [];
  selectedClient: any;
  isGatewayUser: boolean = false;
  selectedItems: any[] = [];
  filteredData: GroupedInvoiceData = { child: [], parent: newCustomerInfo };

  electronicInvoice: ElectronicInvoiceInformation = newElectronicInvoiceInformation;

  products!: Product[];
  groupedData: any[] = [];
  selectedGroupedData!: [];
  masterCheckbox: boolean = false;

  expandedRows = {};

  filteringBy: string = "manifest";
  selectedFilter: string = "manifest";

  private readonly _entityState = new BehaviorSubject<ManifestModel>({ ...newManifestModel, companyId: 0 });
  readonly entity$: Observable<ManifestModel>;
  readonly manifests$: Observable<ManifestModel[]>;
  readonly packages$: Observable<PackageCategoryModel[]>;
  pagination: PaginationModel = defaultPagination;

  private readonly _companies = new BehaviorSubject<CompanyModel[]>([]);
  companies!: CompanyModel[];
  private readonly _entities = new BehaviorSubject<[]>([]);
  entities$ = this._entities.asObservable();

  companyId: any;
  selectedManifestId: number = 0;
  selectedCustomerId: string = '';
  closedPackageList = [];
  manifestNumber: string;
  selectedPackageNumber: string = "";

  InvoiceSummary: any = { parent: newCustomerInfo, child: newPackageInfo };

  parentColumns: string[] = ["customer", "fullName"];
  childColumns: string[] = ["packageNumber", "description", "courier", "courierNumber", "origin", "weight", "manifestNumber"];
  invoiceData: GroupedInvoiceData[] = [];
  packageInvoiceSummary: PackageInvoiceSummary = { billed: 0, pending: 0, total: 0 };

  columns: ColDef[] = [];
  columnsReport: ColDef[] = [];
  invoiceNumber: number = 0;
  isDownload: boolean = false;
  manifestsList: ManifestModel[] = [];
  state: TableState = {
    page: 1,
    pageSize: PageOptionsDefault,
    searchTerm: '',
    sortColumn: 'number',
    sortDirection: 'DESC',
  };

  articles: InvoiceArticle[] = [];
  originalArticlesData: InvoiceArticle[] = [];
  descriptionGroupArr: any;
  description: string;
  exempt: number;
  taxable: number;
  customsTax: number;
  salesTax: number;
  subTotal: number;
  total: number;
  exchangeRate: number;
  completeExchangeRate: any;
  invoiceInProgress: boolean;
  selectedDocumentType: string = "";

  MiamiReferance: string = "";
  MiamiAmount: number = 0.00;
  selectedPackageNumberFromPackageList: number;

  //#endregion

  constructor(
    private credentailsService: CredentialsService,
    private companyInvoiceService: CompanyInvoiceService,
    private reportsService: ReportsService,
    private exchangeRateService: ExchangeRateService,
    private loading: LoadingService,
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.isGatewayUser = this.credentailsService.isGatewayUser();
    const routers = inject(Router);
    if (!this.credentailsService.isGatewayUser()) {
      routers.navigate(['error', 'unauthorized'], { replaceUrl: true });
    }
  }

  //#region Lifecycle_Hooks
  ngOnInit(): void {
    this.setDefaultCompany();
    this.LoadManifestProducts();
  }
  //#endregion

  //#region Setter_Functions
  private setDefaultCompany(): void {
    if (this.credentailsService.isGatewayUser()) {
      this.loading.show();
      this.companyId = this.credentailsService.credentials?.user.companyId;
      console.log("this.companyId", this.companyId);
      this.companyInvoiceService.GetManifests(this.companyId ?? -1).subscribe({
        next: (res) => {
          console.log("this.onManifestChange=========<<<", res.data);
          this.manifestsList = res.data ?? [];
          this.loading.hide();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load manifests'
          });
          this.loading.hide();
        }
      });
    }
  }

  LoadManifestProducts(): void {
    if (this.companyId > 0) {
      this.loading.show();
      this.reportsService.GetManifestProducts(this.companyId).subscribe({
        next: (res) => {
          if (res.success) {
            this.manifestProductsList = res.data ?? [];
          }
          this.loading.hide();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load manifest products'
          });
          this.loading.hide();
        }
      });
    }
  }

  LoadElectronicInvoiceClient(): void {
    this.loading.show();
    this.companyInvoiceService.GetElectronicInvoiceInformation(this.filteredData.parent.customer).subscribe({
      next: (res) => {
        if (res.success) {
          console.log("res:", res.data);
          this.electronicInvoice = res.data ?? newElectronicInvoiceInformation;
          this.selectedDocumentType = this.documentTypes.find(item => item.id === this.electronicInvoice.documentType)?.name ?? "";
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error fetching electronic invoice information'
          });
        }
        this.loading.hide();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch electronic invoice information'
        });
        this.loading.hide();
      }
    });
  }

  LoadInvoiceSummaryAndInvoiceArticles(): void {
    this.loading.show();
    const data = this.filteredData;
    this.companyInvoiceService.GetNewInvoiceNumber().subscribe({
      next: (res) => {
        if (res.success) {
          const _invoiceNumber = res.data ?? 0;
          this.invoiceNumber = _invoiceNumber;
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          this.exchangeRateService.getExchangeRate(this.companyId, formattedDate).subscribe({
            next: (resExchange) => {
              if (resExchange.success) {
                this.completeExchangeRate = resExchange.data;
                if (!resExchange.data[0]) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: "System doesn't have exchange rate for current day!"
                  });
                  this.loading.hide();
                  return;
                }

                let _saleExchangeRate = resExchange.data[0].saleRate;
                if (!_saleExchangeRate) {
                  this.canSaveInvoice = false;
                  if (this.companyId == 2) {
                    const today = new Date().toLocaleDateString('en-GB');
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: `Exchange rate for today (${today}) is not available. Please ensure the daily rate is set`
                    });
                    _saleExchangeRate = 1;
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No exchange rate found in the system. Please enter the latest exchange rate'
                    });
                    _saleExchangeRate = 1;
                  }
                }

                this.InvoiceSummary = {
                  parent: {
                    ...data.parent,
                    invoiceDate: new Date().toLocaleDateString('en-GB'),
                    invoiceNumber: _invoiceNumber,
                    saleExchangeRate: _saleExchangeRate
                  },
                  child: data.child.reduce((acc: any, child: any) => {
                    acc.weight += child.weight;
                    acc.volume += child.volumeWeight;
                    acc.price += child.price;
                    acc.manifestNumber = acc.manifestNumber
                      ? `${acc.manifestNumber},${child.manifestNumber}`
                      : child.manifestNumber.toString();
                    acc.packageNumber = acc.packageNumber
                      ? `${acc.packageNumber},${child.packageNumber}`
                      : child.packageNumber.toString();
                    return acc;
                  }, { weight: 0, volume: 0, price: 0, packageNumber: "", manifestNumber: "" })
                };

                if (this.companyId == 2) {
                  this.companyInvoiceService.GetInvoiceArticles(
                    this.InvoiceSummary.parent.customer,
                    1,
                    this.InvoiceSummary.child.weight,
                    this.InvoiceSummary.child.volume,
                    1,
                    this.InvoiceSummary.child.packageNumber
                  ).subscribe({
                    next: (res) => {
                      if (res.success) {
                        let _articles = res.data ?? [];
                        this.articles = _articles.filter((item, index, self) =>
                          index === self.findIndex(obj => obj.id === item.id)
                        );
                        this.originalArticlesData = JSON.parse(JSON.stringify(this.articles));
                        this.calclulateTotals();
                      }
                      this.loading.hide();
                    },
                    error: (err) => {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to load invoice articles'
                      });
                      this.loading.hide();
                    }
                  });
                } else {
                  this.companyInvoiceService.GetInvoiceArticlesJamaica(
                    this.InvoiceSummary.parent.zone,
                    this.InvoiceSummary.child.weight,
                    this.InvoiceSummary.child.price,
                    this.InvoiceSummary.child.volume,
                    1,
                    parseInt(this.InvoiceSummary.child.packageNumber)
                  ).subscribe({
                    next: (res) => {
                      if (res.success) {
                        this.articles = res.data ?? [];
                        this.originalArticlesData = JSON.parse(JSON.stringify(this.articles));
                        this.calclulateTotals();
                        console.log('GetInvoiceArticles res:', this.articles);
                      }
                      this.loading.hide();
                    },
                    error: (err) => {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to load invoice articles for Jamaica'
                      });
                      this.loading.hide();
                    }
                  });
                }
              }
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch exchange rate'
              });
              this.loading.hide();
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to get new invoice number'
          });
          this.loading.hide();
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to get new invoice number'
        });
        this.loading.hide();
      }
    });
  }
  //#endregion

  //#region Getter_Functions
  calclulateTotals(): void {
    let inAmount: number = 0, inTaxPercentage: number = 0;
    this.exempt = 0;
    this.taxable = 0;
    this.customsTax = 0;
    this.salesTax = 0;
    this.subTotal = 0;
    this.total = 0;

    for (let i = 0; i < this.articles.length; i++) {
      const row = this.articles[i];
      if (row.quantity != null && row.quantity != undefined) {
        inAmount = Number(row.total) || 0;

        let salesTaxAmount = 0;
        let customsTaxAmount = 0;
        // Determine tax type
        if (row.exempt && !Boolean(row.customsTax)) {
          row.taxableAmount = 0;
          row.exemptAmount = inAmount;
          row.salesTaxAmount = 0;
          this.exempt += inAmount;
        } else {
          row.taxableAmount = inAmount;
          row.exemptAmount = 0;

          const inTaxPercentage = Number(row.tax || 0);
          salesTaxAmount = Number(((inAmount * inTaxPercentage) / 100).toFixed(2));
          row.salesTaxAmount = salesTaxAmount;
          this.taxable += inAmount;
          this.salesTax += salesTaxAmount;
        }

        if (Boolean(row.customsTax)) {
          customsTaxAmount = Number(((inAmount * 13) / 100).toFixed(2));
          row.customsTaxAmount = customsTaxAmount;
          this.customsTax += customsTaxAmount;
        } else {
          row.customsTaxAmount = 0;
        }
      }
    }

    this.subTotal = this.taxable;
    this.subTotal = Number(this.subTotal.toFixed(3));
    this.total = this.taxable + this.salesTax + this.exempt + this.customsTax;
    this.total = Number(this.total.toFixed(3));
  }

  calculateArticleTotal(article: any): number {
    return (article.quantity || 0) * (article.price || 0);
  }
  //#endregion

  //#region Event_Handlers
  onNotBilledClick(div: HTMLElement): void {
    this.disableControls(div, true);
    this.loading.show();
    let successfullSave = 0;
    const packages = this.filteredData.child;
    const packageNumbers = this.filteredData.child.map(p => p.packageNumber).join(',');
    let noOfPackages = 0;

    from(packages).pipe(
      concatMap((element: any) => {
        const request: saveMiamiInvoice = {
          referenceNumber: "N/A",
          total: this.MiamiAmount,
          companyId: this.companyId,
          packageNumber: parseInt(element.packageNumber),
          user: this.credentailsService.credentials?.user.username ?? ""
        };
        return this.companyInvoiceService.SaveMiamiInvoice(request).pipe(
          tap(res => {
            noOfPackages++;
            if (res.success && res.data == 1) {
              successfullSave++;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error Saving Invoice'
              });
            }
          })
        );
      })
    ).subscribe({
      complete: () => {
        if (successfullSave === packages.length) {
          this.companyInvoiceService.UpdatePackageInvoiceStatus({ packages: packageNumbers }).subscribe({
            next: (resU) => {
              if (resU.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Invoice Saved as Not Billed'
                });
                this.handleTrackingNumberInput();
                this.MiamiReferance = "";
                this.MiamiAmount = 0.00;
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Invoice Saved as Not Billed'
                });
                this.handleTrackingNumberInput();
                this.MiamiReferance = "";
                this.MiamiAmount = 0.00;
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Error updating Package Status'
                });
              }
              this.disableControls(div, false);
              this.loading.hide();
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error updating Package Status'
              });
              this.disableControls(div, false);
              this.loading.hide();
            }
          });
        } else {
          this.disableControls(div, false);
          this.loading.hide();
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error Processing Invoice'
        });
        this.disableControls(div, false);
        this.loading.hide();
      }
    });
  }

  onMiamiInvoiceClick(div: HTMLElement): void {
    if (this.MiamiReferance != "" && this.MiamiAmount > 0) {
      this.disableControls(div, true);
      this.loading.show();
      let successfullSave = 0;
      const packages = this.filteredData.child;
      const packageNumbers = this.filteredData.child.map(p => p.packageNumber).join(',');
      let noOfPackages = 0;

      from(packages).pipe(
        concatMap((element: any) => {
          const request: saveMiamiInvoice = {
            referenceNumber: this.MiamiReferance,
            total: this.MiamiAmount,
            companyId: this.companyId,
            packageNumber: parseInt(element.packageNumber),
            user: this.credentailsService.credentials?.user.username ?? ""
          };
          return this.companyInvoiceService.SaveMiamiInvoice(request).pipe(
            tap(res => {
              noOfPackages++;
              if (res.success && res.data == 1) {
                successfullSave++;
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Error Saving Miami Invoice'
                });
                console.log("Error Saving Miami Invoice, no of packages saved:", successfullSave);
              }
            })
          );
        })
      ).subscribe({
        complete: () => {
          if (successfullSave === packages.length) {
            this.companyInvoiceService.UpdatePackageInvoiceStatus({ packages: packageNumbers }).subscribe({
              next: (resU) => {
                if (resU.success) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Miami Invoice Saved Successfully'
                  });
                  this.handleTrackingNumberInput();
                  this.MiamiReferance = "";
                  this.MiamiAmount = 0.00;
                } else {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Miami Invoice Saved Successfully'
                  });
                  this.handleTrackingNumberInput();
                  this.MiamiReferance = "";
                  this.MiamiAmount = 0.00;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error updating Package Status'
                  });
                }
                this.disableControls(div, false);
                this.loading.hide();
              },
              error: (err) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Error updating Package Status'
                });
                this.disableControls(div, false);
                this.loading.hide();
              }
            });
          } else {
            this.disableControls(div, false);
            this.loading.hide();
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error Processing Miami Invoice'
          });
          console.log("Error: ", err);
          this.disableControls(div, false);
          this.loading.hide();
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Data',
        text: 'Reference Number and Amount Must have a Valid value'
      });
    }
  }

  onManifestInvoiceClick(): void {
    this.loading.show();
    if (this.selectedManifestId > 0) {
      const request: saveManifestInvoice = {
        manifestId: this.selectedManifestId
      };
      this.companyInvoiceService.ManifestInvoice(request).subscribe({
        next: (res) => {
          if (res.success) {
            if (res.data == 1) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Manifest Invoice Saved Successfully'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error Saving Manifest Invoice'
              });
              console.log("Error Saving Manifest Invoice");
            }
          }
          this.loading.hide();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error Saving Manifest Invoice'
          });
          this.loading.hide();
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid Manifest ID'
      });
      this.loading.hide();
    }
  }

  DisplayPackageInvoice(div: HTMLElement): void {
    if (this.filteredData.child.length > 0) {
      this.loading.show();
      this.LoadInvoiceSummaryAndInvoiceArticles();
      this.LoadElectronicInvoiceClient();
      this.disableControls(div, true);
      this.invoiceInProgress = true;
      this.loading.hide();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No Package Selected',
        text: 'At least one package must be selected to Generate Invoice'
      });
    }
  }

  getInvoiceDataByCustomer(): void {
    console.log('Getting invoice data...');
    this.loading.show();
    if (this.selectedCustomerId == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid Customer ID'
      });
      this.loading.hide();
      return;
    }

    this.companyInvoiceService.GetInvoiceDataByCustomer(this.selectedCustomerId, this.selectedPackageNumber).subscribe({
      next: (res) => {
        console.log('Invoice data retrieved:', res);
        this.invoiceData = [];
        this.transformData(res.data);
        res.data?.customerInfo.forEach((customer: CustomerInfo) => {
          const relatedPackages = res.data?.packageInfo.filter(pkg => pkg.customer === customer.customer);
          this.invoiceData.push({
            parent: customer,
            child: relatedPackages ?? []
          });
          this.packageInvoiceSummary = res.data?.packageSummary ?? { billed: 0, pending: 0, total: 0 };
        });
        this.loading.hide();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to retrieve invoice data'
        });
        this.loading.hide();
      }
    });
  }

  getInvoiceDataByManifest(): void {
    console.log('Getting invoice data...');
    this.loading.show();
    if (this.selectedManifestId == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid manifest ID or package number'
      });
      this.loading.hide();
      return;
    }

    this.companyInvoiceService.VerifyPackageNumberAndManifestIdAsync(this.selectedManifestId, this.selectedPackageNumber).subscribe({
      next: (res) => {
        console.log('Validation data retrieved:', res);
        if (res.success) {
          if (res.data) {
            this.companyInvoiceService.GetInvoiceDataByManifest(this.selectedManifestId, this.selectedPackageNumber).subscribe({
              next: (res) => {
                console.log('Invoice data retrieved:', res);
                this.invoiceData = [];
                this.transformData(res.data);
                res.data?.customerInfo.forEach((customer: CustomerInfo) => {
                  const relatedPackages = res.data?.packageInfo.filter(pkg => pkg.customer === customer.customer);
                  this.invoiceData.push({
                    parent: customer,
                    child: relatedPackages ?? []
                  });
                });
                this.packageInvoiceSummary = res.data?.packageSummary ?? { billed: 0, pending: 0, total: 0 };
                this.loading.hide();
              },
              error: (err) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to retrieve invoice data'
                });
                this.loading.hide();
              }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.selectedPackageNumber.trim()
                ? 'The package number is not part of the selected manifest or has already been invoiced'
                : 'No packages found for invoicing, or all packages have already been invoiced'
            });
            this.loading.hide();
          }
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to verify package number and manifest ID'
        });
        this.loading.hide();
      }
    });
  }

  handleTrackingNumberInput(): void {
    if (this.filteringBy == 'manifest') {
      this.getInvoiceDataByManifest();
    } else {
      this.getInvoiceDataByCustomer();
    }
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
  }

  onDocTypeChange(event: any) {
    const selectedIndex = event.target.selectedIndex;
    this.electronicInvoice.documentType = parseInt(event.target.value);
    this.selectedDocumentType = this.documentTypes.find(item => item.id === parseInt(event.target.value))?.name ?? "";
    console.log('Selected Type ID:', this.electronicInvoice.documentType);
    console.log('Selected Type Name:', this.selectedDocumentType);
  }

  manifestChange(id: number | undefined) {
    this.selectedManifestId = id ?? 0;
    if (this.selectedManifestId > 0) {
      this.selectedPackageNumber = '';
      this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
      this.getInvoiceDataByManifest();
    } else {
      this.invoiceData = [];
      this.groupedData = [];
      this.articles = [];
      this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
    }
  }

  SaveInvoice(div: HTMLElement): void {
    this.loading.show();
    if (this.ValidateInvoiceIdentification()) {
      if (this.ValidateInvoiceArticles()) {
        const invoiceHeader: CompanyInvoiceHeader = {
          companyId: this.companyId,
          user: this.credentailsService.credentials?.user.username ?? '',
          customer: this.InvoiceSummary.parent.customer,
          date: new Date(),
          taxAmount: this.taxable,
          exemptAmount: 0,
          customsTax: this.customsTax,
          salesTax: this.salesTax,
          subTotal: this.subTotal,
          discount: 0,
          total: this.total,
          totalLocal: 0,
          note: ''
        };
        console.log('Invoice data to save:', invoiceHeader);
        this.companyInvoiceService.CreateInvoiceHeader(invoiceHeader).subscribe({
          next: (res) => {
            if (res.success) {
              if (parseInt(res.data) == parseInt(this.InvoiceSummary.parent.invoiceNumber)) {
                var result = 0;
                this.articles.forEach(article => {
                  result++;
                  const invoiceDetail: CompanyInvoiceDetail = {
                    companyId: this.companyId,
                    invoiceNumber: res.data,
                    productId: article.id,
                    quantity: article.quantity,
                    price: article.price,
                    customsTax: Number(article.customsTaxAmount.toFixed(2)),
                    salesTax: Number(article.salesTaxAmount.toFixed(2)),
                    taxableAmount: Number(article.taxableAmount.toFixed(2)),
                    exemptAmount: Number(article.exemptAmount.toFixed(2)),
                    subTotal: this.subTotal,
                    discount: 0,
                    total: this.total
                  };
                  this.companyInvoiceService.CreateInvoiceDetail(invoiceDetail).subscribe({
                    next: (res) => {
                      if (res.success) {
                        console.log(`invoice detail create for product id:${invoiceDetail.productId}`);
                        this.companyInvoiceService.UpdatePackageInvoiceStatus({ packages: this.InvoiceSummary.child.packageNumber }).subscribe({
                          next: (x) => {
                            if (x.success) {
                              if (result == this.articles.length && x.data == 1) {
                                Swal.fire({
                                  icon: 'success',
                                  title: 'Success',
                                  text: 'Invoice saved successfully'
                                });
                                this.generateAccountingEntry();
                                this.handleTrackingNumberInput();
                                this.disableControls(div, false);
                                this.invoiceInProgress = false;
                                this.articles = [];
                                this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
                                this.selectedItems = [];
                                this.electronicInvoice = newElectronicInvoiceInformation;
                              }
                            } else {
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Error updating package status'
                              });
                              this.disableControls(div, false);
                              this.invoiceInProgress = false;
                              this.articles = [];
                              this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
                              this.selectedItems = [];
                              this.electronicInvoice = newElectronicInvoiceInformation;
                            }
                            this.loading.hide();
                          },
                          error: (err) => {
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: 'Error updating package status'
                            });
                            this.disableControls(div, false);
                            this.invoiceInProgress = false;
                            this.articles = [];
                            this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
                            this.selectedItems = [];
                            this.electronicInvoice = newElectronicInvoiceInformation;
                            this.loading.hide();
                          }
                        });
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: `Error creating invoice detail for product id: ${invoiceDetail.productId}`
                        });
                        this.disableControls(div, false);
                        this.invoiceInProgress = false;
                        this.articles = [];
                        this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
                        this.selectedItems = [];
                        this.electronicInvoice = newElectronicInvoiceInformation;
                        this.loading.hide();
                      }
                    },
                    error: (err) => {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error creating invoice detail'
                      });
                      this.disableControls(div, false);
                      this.invoiceInProgress = false;
                      this.articles = [];
                      this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
                      this.selectedItems = [];
                      this.electronicInvoice = newElectronicInvoiceInformation;
                      this.loading.hide();
                    }
                  });
                });

                const saveInvoiceData: SaveElectronicInvoiceInformation = {
                  companyId: this.companyId,
                  date: invoiceHeader.date,
                  invoiceNumber: parseInt(res.data),
                  paymentType: 1,
                  taxDetailLineCode: '01',
                  saleCondition: '01'
                };
                this.companyInvoiceService.SaveElectronicInvoiceInformation(saveInvoiceData).subscribe({
                  next: (res) => {
                    if (!res.success) {
                     Swal.fire({
                                  icon: 'success',
                                  title: 'Success',
                                  text: 'electronic invoice information saved successfully'
                                });
                    }
                  },
                  error: (err) => {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Failed to save electronic invoice information'
                    });
                  }
                });
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save invoice'
              });
              this.disableControls(div, false);
              this.invoiceInProgress = false;
              this.articles = [];
              this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
              this.selectedItems = [];
              this.electronicInvoice = newElectronicInvoiceInformation;
              this.loading.hide();
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to save invoice'
            });
            this.disableControls(div, false);
            this.invoiceInProgress = false;
            this.articles = [];
            this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
            this.selectedItems = [];
            this.electronicInvoice = newElectronicInvoiceInformation;
            this.loading.hide();
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invoice Article validation failed'
        });
        this.loading.hide();
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Identification validation failed'
      });
      this.loading.hide();
    }
  }

  CancelInvoice(div: HTMLElement): void {
    this.disableControls(div, false);
    this.ResetInvoiceInfo();
  }
  //#endregion

  //#region Helper_Functions
  transformData(inputData: any): void {
    if (!inputData || !Array.isArray(inputData.customerInfo)) {
      console.error('Invalid inputData or customerInfo:', inputData);
      this.groupedData = [];
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No customer data available to transform'
      });
      return;
    }

    const result = inputData.customerInfo.map((customer: any) => {
      const customerPackages = inputData.packageInfo?.filter(
        (pkg: any) => pkg.customer === customer.customer
      ) || [];
      return {
        id: customer.customer,
        customer: customer.customer,
        fullName: customer.fullName,
        areaId: customer.areaId,
        zone: customer.zone,
        selected: false,
        packages: customerPackages.map((pkg: any, index: number) => ({
          id: `${customer.customer}-${index}`,
          orgId: pkg.id,
          packageNumber: pkg.packageNumber,
          date: pkg.fechaCreo,
          amount: pkg.price,
          quantity: 1,
          customer: pkg.customer,
          description: pkg.description,
          weight: pkg.weight,
          origin: pkg.origin,
          courier: pkg.courier,
          filter: 0,
          courierNumber: pkg.courierNumber,
          observation: pkg.observation,
          sure: pkg.sure,
          country: pkg.country,
          fechaCreo: pkg.fechaCreo,
          modificationDate: pkg.modificationDate,
          creo: pkg.creo,
          modifiedBy: pkg.modifiedBy,
          packagesCount: pkg.packagesCount,
          manifestId: pkg.manifestId,
          price: pkg.price,
          broad: pkg.broad,
          high: pkg.high,
          long: pkg.long,
          volumeWeight: pkg.volumeWeight,
          recievedBy: pkg.recievedBy,
          des_Id: pkg.des_Id,
          packageType: pkg.packageType,
          cod: pkg.cod,
          invoiced: pkg.invoiced,
          pallets: pkg.pallets,
          bag: pkg.bag,
          totalWeight: pkg.totalWeight,
          guy: pkg.guy,
          totalLabel: pkg.totalLabel,
          packagingDetails: pkg.packagingDetails,
          customerLooker: pkg.customerLooker,
          taxType: pkg.taxType,
          courierType: pkg.courierType,
          packageSubType: pkg.packageSubType,
          manifestNumber: pkg.manifestNumber,
          selected: false
        }))
      };
    });
    this.groupedData = result;
    console.log(this.groupedData);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return undefined;
    }
  }
  //#endregion

  //#region Package_Table_Events
  onPackageChecked(event: any) {
    if (!event.selected) {
      console.log('package is unchecked:', event);
      this.selectedItems = this.selectedItems.filter((pkg: any) => pkg.id !== event.id);
      this.filteredData.child = this.filteredData.child.filter((pkg: any) => pkg.id !== event.orgId) ?? [];
      console.log("this.filteredData.child: ", this.filteredData.child);
      console.log("this.selectedItems: ", this.selectedItems);
    } else {
      console.log('package is checked:', event);
      const childPackage = event;
      const custid = childPackage.id.split('-')[0];
      const packageNumber = childPackage.packageNumber;
      const selectedData = this.invoiceData.find((data: any) => data.parent.customer === custid);

      if (this.companyId != 2) {
        this.groupedData.forEach(group => {
          if (group.customer === childPackage.customer) {
            group.packages.forEach((pkg: any) => {
              pkg.selected = pkg.packageNumber === packageNumber;
            });
          } else {
            group.packages.forEach((pkg: any) => {
              pkg.selected = false;
            });
          }
        });
      }

      if (selectedData) {
        if (this.companyId == 2) {
          if (!this.filteredData || (this.filteredData && selectedData.parent.customer !== this.filteredData.parent.customer)) {
            this.filteredData = {
              ...selectedData,
              child: [...selectedData.child.filter(child => child.packageNumber === packageNumber)]
            };
          } else {
            this.filteredData = {
              ...selectedData,
              child: [
                ...(this.filteredData?.child || []),
                ...selectedData.child.filter(child => child.packageNumber === packageNumber)
              ].filter((child, index, self) =>
                index === self.findIndex(c => c.packageNumber === child.packageNumber)
              )
            };
          }
        } else {
          this.filteredData = {
            ...selectedData,
            child: selectedData.child.filter(child => child.packageNumber === packageNumber)
          };
        }
        console.log("this.filteredData.child: ", this.filteredData.child);
        console.log("this.filteredData: ", this.filteredData);

        if (childPackage) {
          if (this.companyId == 2) {
            if (this.selectedItems.length == 0 || (this.selectedItems.length > 0 && custid !== this.selectedItems[this.selectedItems.length - 1].customer)) {
              this.selectedItems = [childPackage];
              this.groupedData.forEach(group => {
                group.packages.forEach((pkg: any) => {
                  pkg.selected = false;
                });
              });
              this.groupedData.forEach(group => {
                group.packages.forEach((pkg: any) => {
                  pkg.selected = pkg.packageNumber === packageNumber;
                });
              });
            } else {
              this.selectedItems = [...this.selectedItems, childPackage];
            }
          } else {
            this.selectedItems = [childPackage];
          }
          console.log("this.selectedItems: ", this.selectedItems);
        }
      }
    }
  }

  onCustomerChecked(event: any) {
    this.selectedClient = event.data.customer;
    console.log("customer is checked", event);
    const childPackage = event.data.packages;
    const custid = event.data.id;
    const selectedData = this.invoiceData.find((data: any) => data.parent.customer === custid);

    this.groupedData.forEach(group => {
      if (group.customer === custid) {
        group.packages.forEach((pkg: any) => {
          pkg.selected = true;
        });
      } else {
        group.packages.forEach((pkg: any) => {
          pkg.selected = false;
        });
      }
    });

    if (selectedData) {
      this.filteredData = {
        ...selectedData,
        child: selectedData.child
      };
    }

    if (childPackage) {
      this.selectedItems = childPackage;
      console.log("this.selectedItems: ", this.selectedItems);
    }
  }

  onPackageUnchecked(event: any) { }

  onCustomerUnchecked(event: any) {
    console.log('customer is unchecked:');
    this.selectedItems = [];
    this.filteredData = { child: [], parent: newCustomerInfo };
    const custid = event.data.id;
    this.groupedData.forEach(group => {
      if (group.customer === custid) {
        group.packages.forEach((pkg: any) => {
          pkg.selected = false;
        });
      }
    });
    console.log("this.selectedItems: ", this.selectedItems);
  }

  expandAll() {
    this.expandedRows = this.groupedData.reduce((acc, p) => (acc[p.id] = true) && acc, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }
  //#endregion

  //#region Rest_functions
  ResetInvoiceInfo(): void {
    this.invoiceInProgress = false;
    this.articles = [];
    this.InvoiceSummary = { parent: newCustomerInfo, child: newPackageInfo };
    this.selectedItems = [];
    this.electronicInvoice = newElectronicInvoiceInformation;
    this.filteredData = { child: [], parent: newCustomerInfo };
    this.groupedData.forEach(group => {
      group.packages.forEach((pkg: any) => {
        pkg.selected = false;
      });
    });
  }

  ResetInvoiceItems(): void {
    this.articles = JSON.parse(JSON.stringify(this.originalArticlesData));
    this.calclulateTotals();
  }

  ResetForFilterType(): void {
    this.ResetInvoiceInfo();
    this.selectedManifestId = 0;
    this.selectedCustomerId = "";
    this.selectedDocumentType = "";
    this.selectedGroupedData = [];
    this.selectedPackageNumber = "";
    this.groupedData = [];
    this.packageInvoiceSummary = { billed: 0, pending: 0, total: 0 };
  }

  disableControls(div: HTMLElement, disabled: boolean) {
    const inputs = div.querySelectorAll('input, select, button, radio');
    inputs.forEach(input => {
      if (input.id === "drpManifest" && this.filteringBy !== "manifest" && !disabled) {
        (input as HTMLInputElement).disabled = true;
        return;
      }
      if (input.id === "txtCustomerCode" && this.filteringBy === "manifest" && !disabled) {
        (input as HTMLInputElement).disabled = true;
        return;
      }
      (input as HTMLInputElement).disabled = disabled;
    });
  }
  //#endregion

  //#region Article_table_events
  onProductChange(article: any) {
    let newArticle = this.manifestProductsList.find(x => x.id == article.id);
    article.id = newArticle?.id;
    article.description = newArticle?.description;
    console.log("Updated Articles : ", this.articles);
  }

  addRow() {
    this.articles.push({
      id: 0, description: '', quantity: 1, price: 0, total: 0, customsTax: 0, fixedAmount: 0, tax: 0, discount: 0, exempt: false,
      customsTaxAmount: 0, salesTaxAmount: 0, taxableAmount: 0, exemptAmount: 0, subTotalAmount: 0, totalAmount: 0
    });
  }

  onEditComplete(event: TableEditCompleteEvent) {
    console.log("Edited event:", event);
    console.log("Edited articles:", this.articles);
    const { data, field } = event;
    console.log("Edited Field:", field);
    console.log("Row Data:", data);
    if (event.field == 'price' || event.field == 'quantity') {
      const rowindex = event.index;
      this.articles = this.articles.map((x, i) =>
        i === rowindex ? { ...x, total: this.calculateArticleTotal(x) } : x
      );
      this.calclulateTotals();
    }
  }

  removeRow(index: number) {
    if (confirm("Do you want to remove this item? Click OK to confirm")) {
      this.articles.splice(index, 1);
    }
  }

  ValidateInvoiceArticles(): boolean {
    const hasZeroTotal = this.articles.some(article => article.total === 0);
    if (hasZeroTotal) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'At least one invoice article has an amount of $0.00'
      });
      return false;
    }
    return true;
  }

  ValidateInvoiceIdentification(): boolean {
    const identificationType = this.selectedDocumentType;
    const identification = this.electronicInvoice.documentNumber.trim();
    if (!identificationType || !identification) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Identification type or number is missing'
      });
      return false;
    }
    const firstDigit = identification.charAt(0);
    if (identificationType !== "Passport" && firstDigit !== "0") {
      if (isNaN(Number(identification))) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'The identification can only contain numbers'
        });
        return false;
      }
      switch (identificationType) {
        case "Physical ID":
          if (identification.length !== 9) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'The Physical ID must have 9 digits'
            });
            return false;
          }
          break;
        case "Legal ID":
        case "DGT(NITE)":
          if (identification.length !== 10) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `The ${identificationType} must have 10 digits`
            });
            return false;
          }
          break;
        case "Resident ID (DIMEX)":
          if (identification.length < 11 || identification.length > 12) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'The Resident ID (DIMEX) must have 11 or 12 digits'
            });
            return false;
          }
          break;
        default:
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid identification type'
          });
          return false;
      }
    } else if (identificationType === "Passport") {
      return true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Identifications cannot start with 0'
      });
      return false;
    }
    return true;
  }

  onFocusOut(article: any) {
    console.log('Input lost focus', article);
    this.articles = this.articles.map(x =>
      x.id === article.id ? { ...x, total: this.calculateArticleTotal(x) } : x
    );
    this.calclulateTotals();
  }
  //#endregion

  //#region Invoice Accounting
  generateAccountingEntry() {
    this.loading.show();
    const today = new Date();
    const formattedDate = today.toISOString();
    this.invoiceService.generateAccountingEntry(
      this.companyId,
      formattedDate,
      formattedDate,
      `Factura # ${this.invoiceNumber.toString()}`,
      "A",
      "CJ",
      "a",
      formattedDate,
      0
    ).subscribe({
      next: (res) => {
        console.log("Accounting Entry Response: ", res);
        const accountingNumber = res.data;
        if (res?.success) {
          this.invoiceService.GenerateAccountingEntryInvoice(
            this.companyId,
            accountingNumber ?? "0",
            this.invoiceNumber
          ).subscribe({
            next: (res) => {
              console.log("Accounting Entry Invoice Response: ", res);
              if (res?.success) {
                this.invoiceService.selectTemplateAccount(this.companyId, "CXC", 2).subscribe({
                  next: (res) => {
                    const templateResponse = res.data;
                    console.log("Accounting Entry Template Response: ", templateResponse);
                    if (res?.success && Array.isArray(templateResponse)) {
                      const allTemplates: AccountingDetail[] = [];
                      templateResponse.forEach((temp: any, index: number) => {
                        var totalVal = 0;
                        if (temp.lineNumber == 1) {
                          totalVal = this.total
                        }
                        else if (temp.lineNumber == 2) {
                          totalVal = this.exempt
                        }
                        else if (temp.lineNumber == 3) {
                          totalVal = this.salesTax
                        }
                        else if (temp.lineNumber == 4) {
                          totalVal = this.taxable
                        }
                        else if (temp.lineNumber == 5) {
                          totalVal = this.customsTax
                        }
                        const detail: AccountingDetail = {
                          companyId: this.credentailsService.credentials?.user.companyId ?? 0,
                          entryCode: accountingNumber,
                          periodDate: new Date(),
                          entryLineNumber: temp.lineNumber,
                          transactionAmount: totalVal,
                          accountNumber: temp.accountNumber,
                          debitCreditIndicator: temp.debitCreditFlag,
                          exchangeRate: this.completeExchangeRate[0].saleRate,
                          originalAmount: totalVal,
                          originalCurrency: 'Colon',
                          clientCode: this.selectedClient ?? "",
                          entryClosureCode: 'Insertar'
                        };
                        allTemplates.push(detail);
                      });
                      this.invoiceService.insertAccountingDetail(allTemplates).subscribe({
                        next: (resp) => {
                          this.invoiceService.validateAndApplyAccountEntry(this.credentailsService.credentials?.user.companyId ?? 0, accountingNumber).subscribe({
                            next: (resp) => {
                              console.log(resp);
                              if (parseInt(resp.data) == 0) {
                                Swal.fire({
                                  icon: 'error',
                                  title: 'Error',
                                  text: 'Invalid accounting entry'
                                });
                              } else {
                                console.log("Insert Accounting Detail Response:", resp);
                                Swal.fire({
                                  icon: 'success',
                                  title: 'Success',
                                  text: 'Accounting Entry Validated and Applied Successfully'
                                });
                              }
                              this.loading.hide();
                            },
                            error: (err) => {
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Failed to validate and apply accounting entry'
                              });
                              this.loading.hide();
                            }
                          });
                        },
                        error: (err) => {
                          console.error("Error inserting accounting detail:", err);
                          Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error inserting accounting entry detail'
                          });
                          this.loading.hide();
                        }
                      });
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No templates found'
                      });
                      this.loading.hide();
                    }
                  },
                  error: (err) => {
                    console.error("Error selecting template:", err);
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Error generating accounting entry template'
                    });
                    this.loading.hide();
                  }
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to generate accounting entry invoice'
                });
                this.loading.hide();
              }
            },
            error: (err) => {
              console.error("Invoice API error:", err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error generating accounting entry invoice'
              });
              this.loading.hide();
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to generate accounting entry'
          });
          this.loading.hide();
        }
      },
      error: (error) => {
        console.error("Error generating accounting entry:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error generating accounting entry'
        });
        this.loading.hide();
      }
    });
  }
  //#endregion
}