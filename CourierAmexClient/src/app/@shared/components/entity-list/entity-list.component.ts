import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ColDef, TableState } from '../tabular-data/tabular-data.component';
import { PaginationModel, defaultPagination } from '@app/models/pagination.interface';

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss']
})
export class EntityListComponent {
  @Input() showHeader: boolean = true;
  @Input() activeSearch : boolean = true;
  @Input() rows: any[] | undefined;
  @Input() state?: TableState;
  @Input() pagination: PaginationModel = defaultPagination;
  @Input() columns: Array<ColDef> = [];
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() addLabel: string = '';
  @Input() emptyLabel: string = 'No Data';
  @Input() hasAdd: boolean = false;
  @Input() hasPagination: boolean = true;
  @Input() filterTemplate?: TemplateRef<any>;
  @Input() selectedItem: any = null;
  @Output() stateChange = new EventEmitter<TableState>();
  @Output() add = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<any>();
 
  protected addNew(){
    this.add.emit(true);
  }

  protected onSelect(row: any): void {
    this.select.emit(row);
  }

  protected onKeywordSearch(criteria: string): void {
    this.stateChange.emit({
      searchTerm: criteria, 
      page: 1,
      pageSize: (this.state?.pageSize || 100),
      sortColumn: this.state?.sortColumn || '',
      sortDirection: this.state?.sortDirection || 'ASC',
      selectable: this.state?.selectable
    });
  }

  protected onPagerChange(entity: PaginationModel): void {
    this.stateChange.emit({
      searchTerm: this.state?.searchTerm || '', 
      page: entity.pi,
      pageSize: entity.ps,
      sortColumn: this.state?.sortColumn || '',
      sortDirection: this.state?.sortDirection || 'ASC',
      selectable: this.state?.selectable
    });
  }

  protected onSort(column: string) {
    if (this.state?.sortColumn !== column) {
      this.stateChange.emit({
        searchTerm: this.state?.searchTerm || '', 
        page: this.state?.page || 1,
        pageSize: this.state?.pageSize || defaultPagination.ps,
        sortColumn: column,
        sortDirection: 'ASC',
        selectable: this.state?.selectable
      });
    } else {
      this.stateChange.emit({
        searchTerm: this.state?.searchTerm || '', 
        page: this.state?.page || 1,
        pageSize: this.state?.pageSize || defaultPagination.ps,
        sortColumn: column,
        sortDirection: this.state.sortDirection === 'ASC' ? 'DESC' : 'ASC',
        selectable: this.state?.selectable
      });
    }
  } 

}
