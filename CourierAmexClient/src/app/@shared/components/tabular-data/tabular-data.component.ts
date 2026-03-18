import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';

export interface ColDef {
  field: string;
  label: string;
  sortable?: boolean;
  cssClass?: string;
  hidden?: boolean;
  type?: 'date' | 'number' | '2decimals' | '4decimals' | 'currency' | 'text';
  contentTemplate?: TemplateRef<any>;
  onClick?: (params: any) => string;
}

export interface TableState {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: 'ASC' | 'DESC';
  selectable?: boolean;
}

@Component({
  selector: 'app-tabular-data',
  templateUrl: './tabular-data.component.html',
  styleUrls: ['./tabular-data.component.scss']
})
export class TabularDataComponent {
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;
  @ViewChild('fakeContainer', { read: ElementRef }) public fakeContainer: ElementRef<any>;
  @ViewChild('fakeChild', { read: ElementRef }) public fakeChild: ElementRef<any>;
  @ViewChild('tableContainer', { read: ElementRef }) public tableContainer: ElementRef<any>;

  @Input() emptyLabel: string = 'No Data';
  dataSource: any[] | undefined;
  // @Input() rows: any[] | undefined;
  @Input() state: TableState | undefined;
  @Input() columns: Array<ColDef> = [];
  @Input() selectedItem: any = null;
  @Output() sort = new EventEmitter<string>();
  @Output() select = new EventEmitter<any>();


  @Input()
  set rows(value: any) {
    this.dataSource = value;
    setTimeout(()=> this.adjustWidth(),350);
  }

  constructor(private renderer: Renderer2) {}

  sortBy(field: string) {
    this.sort.emit(field);
  }

  private adjustWidth(){
    this.renderer.setStyle(this.fakeChild.nativeElement, 'width', `${this.tableContainer.nativeElement.offsetWidth}px`);
    this.renderer.setStyle(this.fakeContainer.nativeElement, 'max-width', `${this.widgetsContent.nativeElement.offsetWidth}px`);
  }

  protected getContext(row: any, colum: ColDef) {
    return { params: { value: row[colum.field], row, colum } };
  }

  onSelect(row: any): void {
    if (this.state?.selectable ?? false) {
      this.select.emit(row);
    }
  }

  onContentScroll(event: any) {
    this.fakeContainer.nativeElement.scrollLeft = this.widgetsContent.nativeElement.scrollLeft;
  }

  onFakeScroll(event: any) {
    this.widgetsContent.nativeElement.scrollLeft = this.fakeContainer.nativeElement.scrollLeft;
  }
}
