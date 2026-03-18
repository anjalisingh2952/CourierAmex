import { Component, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'shared-keyword-search',
  templateUrl: './keyword-search.component.html',
  inputs: ['criteria'],
  outputs: ['onSearch']
})
export class KeywordSearchComponent {
  criteria: string = '';
  onSearch = new EventEmitter<string>();

  handleSubmit(form: NgForm): void {
    this.onSearch.emit(form.value.search ?? '');
  }
}
