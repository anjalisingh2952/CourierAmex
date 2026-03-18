import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-entity-treeview',
  templateUrl: './app-entity-treeview.component.html',
  styleUrls: ['./app-entity-treeview.component.scss']
})
export class EntityTreeViewComponent implements OnInit {
  @Input() parentColumns: string[] = [];
  @Input() childColumns: string[] = [];
  @Input() groupedData: any[] = [];
  @Output() parentCheckboxChanged = new EventEmitter<any>();
  @Output() childCheckboxChanged = new EventEmitter<any>();

  ngOnInit(): void {
    if (this.groupedData && this.groupedData.length > 0) {
      console.log('Grouped Data exists:', this.groupedData);
    } else {
      console.log('Grouped Data is empty or undefined');
    }
  }

  toggleExpandCollapse(item: any): void {
    item.expanded = !item.expanded;
  }

  getKeys(obj: any): string[] {
    let keys = Object.keys(obj);
    return keys;
  }

  /*parentCheckboxChange(data: any): void {
    console.log('Parent checkbox changed in tree-view:', data);
    this.parentCheckboxChanged.emit(data);
  }

  childCheckboxChange(child: any, data: any): void {
    console.log('Child checkbox changed in tree-view:', data);

    let finalData = [...data, child = child]
    this.childCheckboxChanged.emit(finalData);
  }*/
  parentCheckboxChange(parentRow: any) {
    parentRow.selected = !parentRow.selected;
    
    // Apply the selection state to all children
    if (parentRow.child && parentRow.child.length > 0) {
      parentRow.child.forEach((child: any) => {
        child.selected = parentRow.selected;
      });
    }
    console.log('Parent checkbox changed in tree-view:', parentRow);
    this.parentCheckboxChanged.emit(parentRow);
  }
  
  childCheckboxChange(childRow: any, parentRow: any) {
    childRow.selected = !childRow.selected;
    
    // If all children are checked, mark the parent as checked; otherwise, uncheck it
    parentRow.selected = parentRow.child.every((child: any) => child.selected);
    console.log('Child checkbox changed in tree-view:', parentRow);

    let finalData = [...parentRow, childRow = childRow]
    this.childCheckboxChanged.emit(finalData);
  }
} 