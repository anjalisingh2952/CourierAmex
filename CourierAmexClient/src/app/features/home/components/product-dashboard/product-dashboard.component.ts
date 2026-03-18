import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CredentialsService } from '@app/@core';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { ChartData, ChartType, ChartConfiguration, ChartOptions } from 'chart.js';
import { Observable, forkJoin } from 'rxjs';
import { HomeService } from '../../services/home.service';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';

@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss']
})
export class ProductDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('yearScroll', { static: true }) yearScrollRef!: ElementRef;
  @ViewChild('dataTable', { static: false }) dataTable!: ElementRef;
  @ViewChild('totalFacturadoTableRef', { static: false }) totalFacturadoTableRef!: ElementRef;

  private dataTableInstance: any;
  private totalFacturadoTableInstance: any;
  private isDataTableInitialized = false;
  private isTotalFacturadoTableInitialized = false;

  // Filters
  currentYear = new Date().getFullYear();
  years = Array.from({ length: 3 }, (_, i) => this.currentYear - 2 + i);
  months = [
    '(Blank)', '01-January', '02-February', '03-March', '04-April',
    '05-May', '06-June', '07-July', '08-August',
    '09-September', '10-October', '11-November', '12-December'
  ];
  statuses = ['(Blank)', 'PAID', 'PENDING CREDIT', 'PENDING PAYMENT'];
  selectedYear: number[] = [];
  selectedMonths: string[] = [];
  selectedStatus: string | null = null;
  invoiceSearch: string = '';
  productSearch: string = '';

  // Data properties
  totalFacturadoData: any[] = [];
  facturaDetails: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalRecords = 0;

  // Chart Data
  pieChartDataNgx: any[] = [];
  ngxChartView: [number, number] = [400, 300];
  legendPosition: LegendPosition = LegendPosition.Right;
  doughnut = true;
  ngxChartColorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#36A2EB', '#FF6384', '#00A8C6', '#FF9F40', '#4BC0C0', '#9966FF', '#03C03C',
      '#FFCE56', '#D9A066', '#779ECB', '#C23B22', '#DC143C', '#E7E9ED', '#FF69B4', '#8B0000'
    ]
  };

  chartData: any[] = [];
  chartView: [number, number] = [300, 400];
  barPadding: number = 3;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = false;
  xAxisLabel = 'Products';
  yAxisLabel = '';
  animations = true;
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5e2a84', '#2a5e84']
  };
  xAxisTickFormatting(value: number): string {
    return `${value / 1000}K`;
  }

  montosChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  montosChartType: ChartType = 'bar';
  montosChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    scales: { x: { stacked: false }, y: { stacked: false } },
    plugins: { legend: { position: 'bottom' } }
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#36A2EB', '#FF6384', '#00A8C6', '#FF9F40', '#4BC0C0', '#9966FF', '#03C03C',
        '#FFCE56', '#D9A066', '#779ECB', '#C23B22', '#DC143C', '#E7E9ED', '#FF69B4', '#8B0000'
      ]
    }]
  };
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    },
    cutout: '60%'
  };

  facturasMesChartData: ChartData<'line'> = { labels: [], datasets: [] };
  facturasMesChartType: ChartType = 'line';
  facturasMesChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `${Number(value) / 1000}M` } }
    }
  };

  facturadoPagadoChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  facturadoPagadoChartType: ChartType = 'bar';
  facturadoPagadoChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `${Number(value) / 1000}M` } }
    },
    responsive: true
  };

  facturasCajaChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  facturasCajaChartType: ChartType = 'bar';
  facturasCajaChartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true } }
  };

  constructor(public homeService: HomeService, public cred: CredentialsService) { }

  ngOnInit() {
    this.selectedYear = [this.currentYear];
    this.fetchData();
  }

  ngAfterViewInit() {
    // Initial setup without immediate DataTable initialization
  }

  ngOnDestroy() {
    if (this.dataTableInstance) {
      this.dataTableInstance.destroy();
      this.isDataTableInitialized = false;
    }
    if (this.totalFacturadoTableInstance) {
      this.totalFacturadoTableInstance.destroy();
      this.isTotalFacturadoTableInitialized = false;
    }
  }

  fetchData(): void {
    const idEmpresa = this.cred.credentials?.user?.companyId || 0;

    let fechaInicio: string;
    let fechaFin: string;

    if (this.selectedYear.length === 0) {
      fechaInicio = '2023-01-01';
      fechaFin = '2025-12-31';
    } else {
      const minYear = Math.min(...this.selectedYear);
      const maxYear = Math.max(...this.selectedYear);
      fechaInicio = `${minYear}-01-01`;
      fechaFin = `${maxYear}-12-31`;
    }

    const months = this.selectedMonths.length > 0 ? this.selectedMonths.join(',') : 'Blank';
    const invoiceId = this.invoiceSearch || undefined;
    const productId = this.productSearch ? parseInt(this.productSearch) || undefined : undefined;

    forkJoin([
      this.homeService.getProductChartDetail(idEmpresa, fechaInicio, fechaFin, invoiceId, productId, months),
      this.homeService.getProductDetailsPaginated(idEmpresa, fechaInicio, fechaFin, this.pageNumber, this.pageSize, invoiceId, productId, months)
    ]).subscribe({
      next: ([chartResponse, paginatedResponse]: [any, any]) => {
        const paginatedData = paginatedResponse.data ?? { records: [], totalRecords: 0 };

        const productAmountsByYear = chartResponse.data[0] ?? [];
        const productPercentages = chartResponse.data[1] ?? [];
        const totalByProducts = chartResponse.data[2] ?? [];

        this.totalFacturadoData = totalByProducts.map((item: any) => ({
          producto: item.productName,
          total: item.total
        }));

        const productYearMap: { [key: string]: { name: string, series: { name: string, value: number }[] } } = {};
        productAmountsByYear.forEach((item: any) => {
          if (!productYearMap[item.productName]) {
            productYearMap[item.productName] = {
              name: item.productName,
              series: []
            };
          }
          productYearMap[item.productName].series.push({
            name: item.year.toString(),
            value: item.totalAmount
          });
        });
        this.chartData = Object.values(productYearMap);

        // Calculate the chart height based on the number of bars
        this.updateChartHeight();

        this.pieChartDataNgx = productPercentages.map((item: any) => ({
          name: item.productName,
          value: item.percentage
        }));

        this.doughnutChartData = {
          labels: this.pieChartDataNgx.map((d) => d.name),
          datasets: [{
            data: this.pieChartDataNgx.map((d) => d.value),
            backgroundColor: this.ngxChartColorScheme.domain
          }]
        };

        if (Array.isArray(paginatedData) && paginatedData.length > 0 && Array.isArray(paginatedData[0])) {
          this.facturaDetails = paginatedData[0].map((item: any) => ({
            factura: item.invoiceId,
            producto: item.productName,
            cantidad: item.candidate,
            precio: item.price,
            facturado: item.total,
            cliente: item.client
          }));
        } else {
          this.facturaDetails = [];
        }
        this.totalRecords = paginatedData[1];

        if (!this.isDataTableInitialized) {
          setTimeout(() => {
            this.initializeDataTable();
            this.isDataTableInitialized = true;
          }, 500);
        } else {
          this.updateDataTable();
        }

        if (!this.isTotalFacturadoTableInitialized) {
          setTimeout(() => {
            this.initializeTotalFacturadoTable();
            this.isTotalFacturadoTableInitialized = true;
          }, 500);
        } else {
          this.updateTotalFacturadoTable();
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.totalFacturadoData = [];
        this.chartData = [];
        this.pieChartDataNgx = [];
        this.facturaDetails = [];
        this.totalRecords = 0;

        // Reset chart height when data is empty
        this.updateChartHeight();

        if (!this.isDataTableInitialized) {
          setTimeout(() => {
            this.initializeDataTable();
            this.isDataTableInitialized = true;
          }, 500);
        } else {
          this.updateDataTable();
        }

        if (!this.isTotalFacturadoTableInitialized) {
          setTimeout(() => {
            this.initializeTotalFacturadoTable();
            this.isTotalFacturadoTableInitialized = true;
          }, 500);
        } else {
          this.updateTotalFacturadoTable();
        }
      }
    });
  }

  updateChartHeight(): void {
    const barHeight = 20;
    const minHeight = 400;
    const numBars = this.chartData.length;
    const calculatedHeight = Math.max(minHeight, numBars * barHeight);

    this.chartView = [430, calculatedHeight];
  }

  initializeDataTable(): void {
    if (!this.dataTable || !this.dataTable.nativeElement) {
      console.error('DataTable element not found');
      return;
    }

    if (!$.fn.DataTable) {
      console.error('DataTables is not loaded');
      return;
    }

    if (!$.fn.DataTable.Buttons) {
      console.error('DataTables Buttons extension is not loaded');
      return;
    }

    if (this.dataTableInstance) {
      this.dataTableInstance.destroy();
      this.dataTableInstance = null;
    }

    this.dataTableInstance = $(this.dataTable.nativeElement).DataTable({
      data: this.facturaDetails,
      columns: [
        { title: 'Factura', data: 'factura' },
        { title: 'Producto', data: 'producto' },
        { title: 'Cantidad', data: 'cantidad' },
        {
          title: 'Precio',
          data: 'precio',
          render: (data: number) => data.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        {
          title: 'Facturado',
          data: 'facturado',
          render: (data: number) => data.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        { title: 'Cliente', data: 'cliente' }
      ],
      dom: 'Bfrtip',
      buttons: [
        { extend: 'copy', text: 'Copy', className: 'btn btn-secondary' },
        { extend: 'csv', text: 'CSV', className: 'btn btn-secondary' },
        { extend: 'excel', text: 'Excel', className: 'btn btn-secondary' },
        { extend: 'pdf', text: 'PDF', className: 'btn btn-secondary' },
        { extend: 'print', text: 'Print', className: 'btn btn-secondary' }
      ],
      paging: false,
      searching: true,
      scrollX: true,
      scrollY: '321px',
      scrollCollapse: true,
      language: {
        emptyTable: 'No data available in table',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        infoEmpty: 'Showing 0 to 0 of 0 entries',
        search: 'Search:'
      },
    });

    console.log('DataTable Buttons:', this.dataTableInstance.buttons().nodes());
  }

  updateDataTable(): void {
    if (this.dataTableInstance) {
      this.dataTableInstance.clear();
      this.dataTableInstance.rows.add(this.facturaDetails);
      this.dataTableInstance.draw();
      const footer = $(this.dataTable.nativeElement).find('tfoot tr');
      footer.find('td').eq(2).text(this.totalCantidad);
      footer.find('td').eq(3).text(this.totalPrecio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      footer.find('td').eq(4).text(this.totalFacturaFacturado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }

  initializeTotalFacturadoTable(): void {
    if (!this.totalFacturadoTableRef || !this.totalFacturadoTableRef.nativeElement) {
      console.error('Total Facturado Table element not found');
      return;
    }

    if (!$.fn.DataTable) {
      console.error('DataTables is not loaded');
      return;
    }

    if (!$.fn.DataTable.Buttons) {
      console.error('DataTables Buttons extension is not loaded');
      return;
    }

    if (this.totalFacturadoTableInstance) {
      this.totalFacturadoTableInstance.destroy();
      this.totalFacturadoTableInstance = null;
    }

    this.totalFacturadoTableInstance = $(this.totalFacturadoTableRef.nativeElement).DataTable({
      data: this.totalFacturadoData,
      columns: [
        { title: 'Producto', data: 'producto' },
        {
          title: 'Total Facturado',
          data: 'total',
          render: (data: number) => data.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          className: 'text-end'
        }
      ],
      dom: 'Bfrtip',
      buttons: [
        { extend: 'copy', text: 'Copy', className: 'btn btn-secondary' },
        { extend: 'csv', text: 'CSV', className: 'btn btn-secondary' },
        { extend: 'excel', text: 'Excel', className: 'btn btn-secondary' },
        { extend: 'pdf', text: 'PDF', className: 'btn btn-secondary' },
        { extend: 'print', text: 'Print', className: 'btn btn-secondary' }
      ],
      paging: true,
      pageLength: 10,
      lengthMenu: [5, 10, 25],
      searching: true,
      language: {
        emptyTable: 'No data available in table',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        infoEmpty: 'Showing 0 to 0 of 0 entries',
        lengthMenu: 'Show _MENU_ entries',
        search: 'Search:',
        paginate: {
          next: 'Next',
          previous: 'Previous'
        }
      },
      footerCallback: () => {
        const footer = $(this.totalFacturadoTableRef.nativeElement).find('tfoot tr');
        footer.find('td').eq(1).text(this.totalFacturadoSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    });

    console.log('Total Facturado Table Buttons:', this.totalFacturadoTableInstance.buttons().nodes());
  }

  updateTotalFacturadoTable(): void {
    if (this.totalFacturadoTableInstance) {
      this.totalFacturadoTableInstance.clear();
      this.totalFacturadoTableInstance.rows.add(this.totalFacturadoData);
      this.totalFacturadoTableInstance.draw();
      const footer = $(this.totalFacturadoTableRef.nativeElement).find('tfoot tr');
      footer.find('td').eq(1).text(this.totalFacturadoSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }

  scrollYears(direction: number): void {
    const container = this.yearScrollRef.nativeElement;
    container.scrollBy({ left: 150 * direction, behavior: 'smooth' });
  }

  toggleYear(year: number): void {
    const index = this.selectedYear.indexOf(year);
    if (index > -1) {
      this.selectedYear.splice(index, 1);
    } else {
      this.selectedYear.push(year);
    }
    this.selectedYear.sort((a, b) => a - b);
    this.fetchData();
  }

  toggleMonth(month: string): void {
    const index = this.selectedMonths.indexOf(month);
    if (index > -1) {
      this.selectedMonths.splice(index, 1);
    } else {
      this.selectedMonths.push(month);
    }
    this.fetchData();
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  search(): void {
    this.pageNumber = 1;
    this.fetchData();
  }

  nextPage(): void {
    if (this.pageNumber * this.pageSize < this.totalRecords) {
      this.pageNumber++;
      this.fetchData();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchData();
    }
  }

  get totalFacturadoSum(): number {
    return this.totalFacturadoData.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  }

  get totalCantidad(): number {
    return this.facturaDetails.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0);
  }

  get totalPrecio(): number {
    return this.facturaDetails.reduce((sum: number, item: any) => sum + (item.precio || 0), 0);
  }

  get totalFacturaFacturado(): number {
    return this.facturaDetails.reduce((sum: number, item: any) => sum + (item.facturado || 0), 0);
  }
}