import { Component, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'shared-dropdown',
  templateUrl: './dropdown-select.component.html',
  inputs: ['entities', 'label', 'display', 'value', 'selectedEntity'],
  outputs: ['onSelectEntity']
})
export class DropdownSelectComponent implements OnChanges {
  entities: any[] = [];
  label: string = '';
  display: string = 'name';
  value: string = 'id';
  selectedEntity: any = undefined;
  onSelectEntity = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entities']) {
      const prev = changes['entities'].previousValue;
      const curr = changes['entities'].currentValue;
      if (prev && prev.length > 0 && curr && curr.length === 0) {
        this.clearEntity(null);
      }
    }
  }

  clearEntity($event: any): void {
    this.selectedEntity = undefined;
    $event?.stopPropagation();
    this.onSelectEntity.emit(undefined);
  }

  selectEntity(e: any): void {
    if (e !== undefined) {
      this.selectedEntity = e;
      this.onSelectEntity.emit(e);
    }
  }
}
