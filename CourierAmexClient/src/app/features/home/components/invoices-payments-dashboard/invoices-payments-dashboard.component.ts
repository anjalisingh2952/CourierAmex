import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { CredentialsService } from '@app/@core';
import { InvoiceService } from '@app/features/invoice/services';
import { ChartData, ChartType, ChartConfiguration } from 'chart.js';
import { LoadingService } from '@app/@core';
import { HomeService } from '../../services/home.service';
import { defaultPagination, PageOptionsDefault, PaginationModel } from '@app/models';
import { ColDef, TableState } from '@app/@shared/components/tabular-data/tabular-data.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-invoices-payments-dashboard',
  templateUrl: './invoices-payments-dashboard.component.html',
  styleUrls: ['./invoices-payments-dashboard.component.scss'],
})
export class InvoicesPaymentsDashboardComponent {
  @ViewChild("statusTemplate") statusTemplate!: TemplateRef<any>;
  @ViewChild('yearScroll', { static: true }) yearScrollRef!: ElementRef;
  totalFacturado = 0;
  totalPagado = 0;
  currentYear = new Date().getFullYear();
  years: number[] = [2023, 2024, 2025];
  yearsChart: number[] = [...this.years];
  months = [
    'Blank', '01-January', '02-February', '03-March', '04-April',
    '05-May', '06-June', '07-July', '08-August',
    '09-September', '10-October', '11-November', '12-December',
  ];
  statuses = ['Blank', 'PAID', 'PENDING CREDIT', 'PENDING PAYMENT', 'APPLIED', 'CANCELLED'];
  invoices: any[] = [];
  selectedStatuses: string[] = ['Blank'];
  filteredInvoices: any[] = [];
  selectedRows: string[] = [];
  selectedYears: number[] = [];
  selectedMonths: string[] = ['Blank'];
  selectedStatus: string | null = null;
  selectMonths: string;
  statusSelectd: string;
  invoiceDateDistributionChartData: any;
  searchTerm: string = '';

  pagination: PaginationModel = {
    ps: 5,
    pi: 1
  };;

  columns: ColDef[] = [];
  rows: any[] = [];
  state: TableState = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: 'fullName',
    sortDirection: 'ASC',
  };

  translations = {
    invoiceNumber: '',
    user: '',
    cashRegisterID: 0,
    client: '',
    date: '',
    taxableAmount: 0,
    exemptAmount: null,
    customsTax: null,
    salesTax: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    totalLocal: 0,
    balance: 0,
    localBalance: 0,
    paidAmount: 0,
    change: 0,
    paymentMethodID: 0,
    paymentType: null,
    status: 0,
    fullName: null,
    exchangeRatePurchase: 0,
    exchangeRateSale: 0,
    note: null,
    type: null,
    key: null,
    productID: 0,
    quantity: 0,
    price: 0,
    description: '',
    productType: null,
    isExempt: false,
    hasCustomsTax: false,
    documentNumber: '',
    creditNote: null,
    documentType: '',
    actoin: '',
    paymentStatus: ''
  };

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  pieChartData: ChartData<'pie'> = {
    labels: ['PAID', 'PENDING', 'CREDIT', 'EXEMPT'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#32a834', '#ebbe36', '#FFCE56', '#E7E9ED'] }],
  };
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartConfiguration['options'] = {
    plugins: { legend: { position: 'bottom' } },
  };

  montosChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Taxed', data: [], backgroundColor: '#4BC0C0' },
      { label: 'Exempt', data: [], backgroundColor: '#36A2EB' },
      { label: 'Sales Tax', data: [], backgroundColor: '#FFCE56' },
      { label: 'Customs Tax', data: [], backgroundColor: '#FF9F40' },
    ],
  };
  montosChartType: ChartType = 'bar';
  montosChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    scales: { x: { stacked: false }, y: { stacked: false } },
    plugins: { legend: { position: 'bottom' } },
  };

  facturasMesChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [],
  };
  facturasMesChartType: ChartType = 'line';
  facturasMesChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => (Number(value)) } },
    },
  };

  facturadoPagadoChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: 'Total Billed', data: Array(12).fill(0), backgroundColor: '#9966FF' },
      { label: 'Total Paid', data: Array(12).fill(0), backgroundColor: '#36A2EB' },
    ],
  };
  facturadoPagadoChartType: ChartType = 'bar';
  facturadoPagadoChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true },
    },
    responsive: true,
  };

  facturasCajaChartData: ChartData<'bar'> = {
    labels: ['CAJA AUTO', 'HERBOSA', 'LOS SUE', 'OFICINA', 'PEZ VELA', 'WEBSITE'],
    datasets: [
      { label: 'Cantidad', data: [0, 0, 0, 0, 0, 0], backgroundColor: ['#9966FF', '#4BC0C0', '#36A2EB', '#FFCE56', '#FF9F40', '#E7E9ED'] },
    ],
  };
  facturasCajaChartType: ChartType = 'bar';
  facturasCajaChartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true } },
  };

  angularChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [],
  };
  angularChartType: ChartType = 'line';
  angularChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => (Number(value)) } },
    },
  };

  bootstrapChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [],
  };
  bootstrapChartType: ChartType = 'line';
  bootstrapChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true },
    },
  };

  constructor(
    public invoiceService: InvoiceService,
    public cred: CredentialsService,
    private loading: LoadingService,
    private translate: TranslateService,
    private homeService: HomeService,
    private cd: ChangeDetectorRef
  ) {
    this.pagination.s = `${this.state.sortColumn} ${this.state.sortDirection}`;
    this.translate.get([
      'InvoiceHistory.DocumentType',
      'InvoiceHistory.Document',
      'InvoiceHistory.Date',
      'InvoiceHistory.Tax',
      'InvoiceHistory.TotalDollars',
      'InvoiceHistory.TotalLocal',
      'InvoiceHistory.Paid',
      'InvoiceHistory.PaymentStatus',
      'Labels.Actions'])
      .subscribe(
        translations => {
          this.translations.actoin = translations['Labels.Actions'];
          this.translations.documentType = translations['InvoiceHistory.DocumentType'];
          this.translations.documentNumber = translations['InvoiceHistory.Document'];
          this.translations.paymentStatus = translations['InvoiceHistory.PaymentStatus'];
          this.translations.date = translations['InvoiceHistory.Date'];
          this.translations.salesTax = translations['InvoiceHistory.Tax'];
          this.translations.total = translations['InvoiceHistory.TotalDollars'];
          this.translations.totalLocal = translations['InvoiceHistory.TotalLocal'];
          this.translations.paidAmount = translations['InvoiceHistory.Paid'];
        });
  }

  ngOnInit() {
    this.fetchFilteredRecords();
  }

  ngAfterViewInit(): void {
    this.columns.push({ field: 'documentType', label: this.translations.documentType, sortable: true });
    this.columns.push({ field: 'documentNumber', label: this.translations.documentNumber.toString(), sortable: true });
    this.columns.push({ field: 'date', label: this.translations.date, type: "date", sortable: true });
    this.columns.push({ field: 'status', label: this.translations.paymentStatus, sortable: true, cssClass: "text-center", contentTemplate: this.statusTemplate });
    this.columns.push({ field: 'total', label: this.translations.total.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'totalLocal', label: this.translations.totalLocal.toString(), type: "2decimals", sortable: true });
    this.columns.push({ field: 'paidAmount', label: this.translations.paidAmount.toString(), type: "2decimals", sortable: true });
    this.cd.detectChanges();

    const container = this.yearScrollRef.nativeElement;
    container.scrollLeft = container.scrollWidth;
  }

  fetchFilteredRecords(): void {
    this.loading.show();
    let filterData = {
      clientId: 'All',
      toDate: new Date().toISOString().split('T')[0],
      fromDate: '2025-01-01',
      filters: 'Factura,Pago',
    };
    const { fromDate, toDate, clientId, filters } = filterData;

    this.homeService.GetChartData(clientId, fromDate, toDate, filters, this.cred.credentials?.user.companyId ?? 0, 'Blank', 'Blank').subscribe(
      response => {
        this.bindChartData(response.data || [[], [], [], [], [], []]);
        const years = this.years || [];
        if (years.length > 0 && this.selectedYears.length === 0) {
          this.selectedYears = [years[years.length - 1]];
        }
      },
      error => {
        console.error('Error fetching chart data:', error);
        this.bindChartData([[], [], [], [], [], []]);
        this.loading.hide();
      }
    );

    this.loading.show();
    this.invoiceService.CustomerDetailsByClientId(clientId, fromDate, toDate, 'FACTURA', this.pagination.ps, this.pagination.pi).subscribe(
      response => {
        const sortedData = response.data.invoices.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.invoices = sortedData;
        this.filteredInvoices = [...sortedData];
        this.pagination.ti = response.data.totalRows || 0;
        this.pagination = {
          ...this.pagination,
          tr: sortedData?.length
        }
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.updateTotalsAndDistribution();
        this.loading.hide();
      },
      error => {
        console.error('Error fetching filtered records:', error);
        this.loading.hide();
      }
    );
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
    this.getInvoiceListData();
  }

  bindChartData(chartData: any[]): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (!Array.isArray(chartData) || chartData.length < 6) {
      console.error('Invalid chartData:', chartData);
      chartData = [[], [], [], [], [], []];
    }

    const montosData = chartData[5] || [];
    const invoiceData = chartData[4] || [];
    const facturadoData = chartData[1] || [];
    const pagadoData = chartData[1] || [];

    const allYears = new Set<number>();
    montosData.forEach((d: any) => {
      if (d && typeof d.year === 'number') allYears.add(d.year);
    });
    invoiceData.forEach((d: any) => {
      if (d && typeof d.year === 'number') allYears.add(d.year);
    });
    facturadoData.forEach((d: any) => {
      if (d && typeof d.year === 'number') allYears.add(d.year);
    });
    pagadoData.forEach((d: any) => {
      if (d && typeof d.year === 'number') allYears.add(d.year);
    });

    let years = Array.from(allYears).sort();
    if (years.length === 0) {
      years.push(this.currentYear || new Date().getFullYear());
    }

    this.years = years;

    const statusData = chartData[0] || [];
    const statusColorMap: { [key: string]: string } = {
      'ANULADA': '#ff3b3b',               // Green
      'CREDITO PENDIENTE': '#ebbe36',     // Yellow
      'PAGADA': '#32a834',                // Light Yellow
      'PENDIENTE DE PAGO': '#E7E9ED'      // Light Grey
    };

    // Build chart data from statusData
    const labels = statusData.length ? statusData.map((d: any) => d.statusLabel || '') : Object.keys(statusColorMap);
    const data = statusData.length ? statusData.map((d: any) => d.count || 0) : Object.keys(statusColorMap).map(() => 0);
    const backgroundColors = labels.map((label: any) => statusColorMap[label] || '#cccccc');

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors
      }]
    };


    const facturadoTotals = Array(12).fill(0);
    const pagadoTotals = Array(12).fill(0);
    facturadoData.forEach((d: any) => {
      const year = d?.year;
      if (this.selectedYears.length === 0 || this.selectedYears.includes(year)) {
        facturadoTotals[(d.month || 1) - 1] = (d.totalFacturado || 0);
      }
    });
    pagadoData.forEach((d: any) => {
      const year = d?.year;
      if (this.selectedYears.length === 0 || this.selectedYears.includes(year)) {
        pagadoTotals[(d.month || 1) - 1] = (d.totalPagado || 0);
      }
    });
    this.facturadoPagadoChartData = {
      labels: months,
      datasets: [
        { label: 'Total Facturado', data: facturadoTotals, backgroundColor: '#9966FF' },
        { label: 'Total Pagado', data: pagadoTotals, backgroundColor: '#36A2EB' },
      ],
    };

    const cajaData = chartData[3] || [];
    this.facturasCajaChartData = {
      labels: cajaData.length ? cajaData.map((d: any) => d.cashier || 'Unknown') : ['CAJA AUTO', 'HERBOSA', 'LOS SUE', 'OFICINA', 'PEZ VELA', 'WEBSITE'],
      datasets: [{
        label: 'Cantidad',
        data: cajaData.length ? cajaData.map((d: any) => d.count || 0) : [0, 0, 0, 0, 0, 0],
        backgroundColor: ['#9966FF', '#4BC0C0', '#36A2EB', '#FFCE56', '#FF9F40', '#E7E9ED'],
      }],
    };

    this.facturasMesChartData = {
      labels: months,
      datasets: years.map(year => {
        const yearData = invoiceData.filter((d: any) => d?.year === year);
        const counts = Array(12).fill(0);
        yearData.forEach((d: any) => {
          const monthIndex = (d.month || 1) - 1;
          counts[monthIndex] = d.count || 0;
        });
        return {
          label: year.toString(),
          data: counts,
          borderColor: years.indexOf(year) % 3 === 0 ? '#4BC0C0' : years.indexOf(year) % 3 === 1 ? '#36A2EB' : '#FFCE56',
          fill: false,
        };
      }),
    };
    this.angularChartData = { ...this.facturasMesChartData };

    const gravadoData = Array(years.length).fill(0);
    const exentoData = Array(years.length).fill(0);
    const salesTaxData = Array(years.length).fill(0);
    const customsTaxData = Array(years.length).fill(0);
    montosData.forEach((d: any) => {
      const yearIndex = years.indexOf(d?.year);
      if (yearIndex !== -1) {
        if (d.amountType === 'Gravado') {
          gravadoData[yearIndex] = d.amount || 0;
        } else if (d.amountType === 'Exento') {
          exentoData[yearIndex] = d.amount || 0;
        } else if (d.amountType === 'Sales Tax') {
          salesTaxData[yearIndex] = d.amount || 0;
        } else if (d.amountType === 'Customs Tax') {
          customsTaxData[yearIndex] = d.amount || 0;
        }
      }
    });

    this.montosChartData = {
      labels: years.map(String),
      datasets: [
        { label: 'Taxed', data: gravadoData, backgroundColor: '#4BC0C0' },
        { label: 'Exempt', data: exentoData, backgroundColor: '#36A2EB' },
        { label: 'Sales Tax', data: salesTaxData, backgroundColor: '#FFCE56' },
        { label: 'Customs Tax', data: customsTaxData, backgroundColor: '#FF9F40' },
      ],
    };
    const bootstrapData = years.map(year => {
      const yearData = pagadoData.filter((d: any) => d?.year === year);
      const monthsData = Array(12).fill(0);
      yearData.forEach((d: any) => {
        const monthIndex = (d.month || 1) - 1;
        monthsData[monthIndex] = (d.totalPagado || 0);
      });
      return { year, months: monthsData };
    });
    this.bootstrapChartData = {
      labels: months,
      datasets: bootstrapData.map(({ year, months }) => ({
        label: year.toString(),
        data: months,
        borderColor: years.indexOf(year) % 3 === 0 ? '#4BC0C0' : years.indexOf(year) % 3 === 1 ? '#36A2EB' : '#FFCE56',
        fill: false,
      })),
    };
  }

  updateTotalsAndDistribution(): void {
    const { factura, nonFactura } = this.filterData();

    this.totalFacturado = factura.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    this.totalPagado = nonFactura.reduce((sum: number, item: any) => sum + (item.paidAmount || 0), 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const ranges = ['1-7', '8-14', '15-21', '22-28', '29+'];
    const invoiceCountsByRange: { label: string; count: number }[] = [];

    months.forEach((month, monthIndex) => {
      ranges.forEach((range) => {
        invoiceCountsByRange.push({ label: `${month} ${range}`, count: 0 });
      });
    });

    factura.forEach((invoice) => {
      if (invoice.documentType !== 'FACTURA') return;
      const invoiceDate = new Date(invoice.date);
      const month = invoiceDate.getMonth();
      const day = invoiceDate.getDate();
      const monthName = months[month];

      let rangeIndex;
      if (day <= 7) {
        rangeIndex = 0;
      } else if (day <= 14) {
        rangeIndex = 1;
      } else if (day <= 21) {
        rangeIndex = 2;
      } else if (day <= 28) {
        rangeIndex = 3;
      } else {
        rangeIndex = 4;
      }

      const index = month * ranges.length + rangeIndex;
      invoiceCountsByRange[index].count += 1;
    });

    this.invoiceDateDistributionChartData = {
      labels: invoiceCountsByRange.map(item => item.label),
      datasets: [
        {
          label: 'Number of Invoices',
          data: invoiceCountsByRange.map(item => item.count),
          backgroundColor: '#FF6384',
        },
      ],
    };
  }

  getInvoiceListData() {
    let filterData = {
      clientId: 'All',
      toDate: new Date().toISOString().split('T')[0],
      fromDate: '2025-01-01',
      filters: 'Factura',
    };

    if (this.selectedYears.length > 0) {
      const minYear = Math.min(...this.selectedYears);
      const maxYear = Math.max(...this.selectedYears);
      filterData.fromDate = `${minYear}-01-01`;
      filterData.toDate = `${maxYear}-12-31`;

      if (this.selectedMonths.length > 0 && !this.selectedMonths.includes('Blank')) {
        const monthIndices = this.selectedMonths.map(month => this.months.indexOf(month));
        const minMonth = Math.min(...monthIndices);
        const maxMonth = Math.max(...monthIndices);

        // Adjust fromDate and toDate based on the earliest and latest months
        const fromYear = minMonth === Math.min(...monthIndices) ? minYear : maxYear;
        const toYear = maxMonth === Math.max(...monthIndices) ? maxYear : minYear;
        const daysInMaxMonth = new Date(toYear, maxMonth, 0).getDate();

        filterData.fromDate = `${fromYear}-${minMonth.toString().padStart(2, '0')}-01`;
        filterData.toDate = `${toYear}-${maxMonth.toString().padStart(2, '0')}-${daysInMaxMonth}`;
      }
    }

    this.loading.show();
    this.invoiceService.CustomerDetailsByClientId(filterData.clientId, filterData.fromDate, filterData.toDate, filterData.filters, this.pagination.ps, this.pagination.pi).subscribe(
      response => {
        const sortedData = response.data.invoices.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.invoices = sortedData;
        this.filteredInvoices = [...sortedData];
        this.pagination.ti = response.data.totalRows || 0;
        this.pagination = {
          ...this.pagination,
          tr: sortedData?.length
        }
        this.loading.hide();
        this.onSearch();
      },
      error => {
        console.error('Error fetching filtered records:', error);
        this.loading.hide();
      }
    );
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.filteredInvoices = [...this.invoices];

    if (this.searchTerm.trim()) {
      this.filteredInvoices = this.filteredInvoices.filter(
        (item) =>
          item.documentType === 'FACTURA' &&
          item.documentNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply year, month, and status filters
    this.filteredInvoices = this.filterData().factura.concat(this.filterData().nonFactura);
    this.totalRecords = this.filteredInvoices.length;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

    // Apply pagination
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredInvoices = this.filteredInvoices.slice(startIndex, endIndex);

    this.updateTotalsAndDistribution();
  }

  applyFilters(): void {
    let filterData = {
      clientId: 'All',
      toDate: new Date().toISOString().split('T')[0],
      fromDate: '2025-01-01',
      filters: 'Factura,Pago',
    };

    if (this.selectedYears.length > 0) {
      const minYear = Math.min(...this.selectedYears);
      const maxYear = Math.max(...this.selectedYears);
      filterData.fromDate = `${minYear}-01-01`;
      filterData.toDate = `${maxYear}-12-31`;

      if (this.selectedMonths.length > 0 && !this.selectedMonths.includes('Blank')) {
        const monthIndices = this.selectedMonths.map(month => this.months.indexOf(month));
        const minMonth = Math.min(...monthIndices);
        const maxMonth = Math.max(...monthIndices);

        // Adjust fromDate and toDate based on the earliest and latest months
        const fromYear = minMonth === Math.min(...monthIndices) ? minYear : maxYear;
        const toYear = maxMonth === Math.max(...monthIndices) ? maxYear : minYear;
        const daysInMaxMonth = new Date(toYear, maxMonth, 0).getDate();

        filterData.fromDate = `${fromYear}-${minMonth.toString().padStart(2, '0')}-01`;
        filterData.toDate = `${toYear}-${maxMonth.toString().padStart(2, '0')}-${daysInMaxMonth}`;
      }
    }

    this.loading.show();
    this.homeService.GetChartData(filterData.clientId, filterData.fromDate, filterData.toDate, filterData.filters, this.cred.credentials?.user.companyId ?? 0, this.selectedMonths.join(','), this.selectedStatuses.join(',')
    ).subscribe(
      response => {
        this.bindChartData(response.data || [[], [], [], [], [], []]);
        this.loading.hide();
      },
      error => {
        console.error('Error fetching chart data:', error);
        this.bindChartData([[], [], [], [], [], []]);
        this.loading.hide();
      }
    );

    this.invoiceService.CustomerDetailsByClientId(filterData.clientId, filterData.fromDate, filterData.toDate, 'FACTURA', this.pagination.ps, this.pagination.pi).subscribe(
      response => {
        const sortedData = response.data.invoices.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.invoices = sortedData;
        this.filteredInvoices = [...sortedData];
        this.pagination.ti = response.data.totalRows || 0;
        this.pagination = {
          ...this.pagination,
          tr: sortedData?.length
        }
        this.onSearch();
      },
      error => {
        console.error('Error fetching filtered records:', error);
        this.loading.hide();
      }
    );
  }

  filterData() {
    debugger;
    // Filter invoices based on selected years, months, and status
    let facturaData = this.invoices.filter(item => item.documentType === 'FACTURA');
    let nonFacturaData = this.invoices.filter(item => item.documentType !== 'FACTURA');

    if (this.selectedRows.length > 0) {
      facturaData = facturaData.filter(item => this.selectedRows.includes(item.documentNumber));
      nonFacturaData = nonFacturaData.filter(item => this.selectedRows.includes(item.documentNumber));
    }

    if (this.selectedYears.length > 0) {
      facturaData = facturaData.filter(item => this.selectedYears.includes(new Date(item.date).getFullYear()));
      nonFacturaData = nonFacturaData.filter(item => this.selectedYears.includes(new Date(item.date).getFullYear()));
    }

    if (this.selectedMonths.length > 0 && !this.selectedMonths.includes('Blank')) {
      const monthIndices = this.selectedMonths.map(month => this.months.indexOf(month));
      facturaData = facturaData.filter(item => monthIndices.includes(new Date(item.date).getMonth() + 1));
      nonFacturaData = nonFacturaData.filter(item => monthIndices.includes(new Date(item.date).getMonth() + 1));
    }

    if (this.selectedStatus && this.selectedStatus !== 'Blank') {
      facturaData = facturaData.filter(item => this.getStatusLabel(item) === this.selectedStatus);
      nonFacturaData = nonFacturaData.filter(item => this.getStatusLabel(item) === this.selectedStatus);
    }

    return { factura: facturaData, nonFactura: nonFacturaData };
  }

  getStatusLabel(item: any): string {
    switch (item.status) {
      case 0:
        return item.documentType === 'PAGO' || item.documentType === 'ADELANTO' ? 'PAID' : 'PENDING';
      case 1:
        return 'CANCELLED';
      case 2:
        return 'PAID';
      case 3:
        return 'PENDINGCREDIT';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(item: any): string {
    switch (item.status) {
      case 0:
        return item.documentType === 'PAGO' || item.documentType === 'ADELANTO' ? 'badge bg-success text-white' : 'badge bg-warning text-white';
      case 1:
        return 'badge bg-danger text-white';
      case 2:
        return 'badge bg-success text-white';
      case 3:
        return 'badge bg-secondary text-white';
      default:
        return 'badge bg-info text-white';
    }
  }

  scrollYears(direction: number): void {
    const container = this.yearScrollRef.nativeElement;
    container.scrollBy({ left: 150 * direction, behavior: 'smooth' });
  }

  selectYear(year: number): void {
    const index = this.selectedYears.indexOf(year);
    if (index > -1) {
      this.selectedYears.splice(index, 1);
    } else {
      this.selectedYears.push(year);
    }
    this.pageNumber = 1;
    this.applyFilters();
  }

  selectMonth(month: string): void {
    debugger;
    const index = this.selectedMonths.indexOf(month);

    if (index > -1) {
      this.selectedMonths.splice(index, 1);
    } else {
      if (month === 'Blank') {
        this.selectedMonths = ['Blank'];
      } else {
        const blankIndex = this.selectedMonths.indexOf('Blank');
        if (blankIndex > -1) {
          this.selectedMonths.splice(blankIndex, 1);
        }
        this.selectedMonths.push(month);
      }
    }

    this.pageNumber = 1;
    this.selectMonths = this.selectedMonths.join(',');
    this.applyFilters();
  }

  selectStatus(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      if (status === 'Blank') {
        this.selectedStatuses = ['Blank'];
      } else {
        const blankIndex = this.selectedStatuses.indexOf('Blank');
        if (blankIndex > -1) {
          this.selectedStatuses.splice(blankIndex, 1);
        }
        this.selectedStatuses.push(status);
      }
    }

    this.selectedStatus = status;
    this.statusSelectd = this.selectedStatuses.join(',');
    this.pageNumber = 1;
    this.applyFilters();
  }

  previousPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchFilteredRecords();
    }
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.fetchFilteredRecords();
    }
  }
}