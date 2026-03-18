import { Component, OnInit } from "@angular/core";

import { BehaviorSubject, filter, finalize } from "rxjs";
import Swal from "sweetalert2";

import { ControlCodeModel } from "@app/features/general/models";
import { LoadingService, MessageService } from "@app/@core";
import { ControlCodeService } from "@app/features/general/services/control-code.service";

@Component({
  selector: 'control-code-details',
  templateUrl: './control-code-details.container.html'
})
export class ControlCodeDetailsContainer implements OnInit {
  private readonly _entities = new BehaviorSubject<ControlCodeModel[]>([]);
  entities$ = this._entities.asObservable();

  constructor(
    private loading: LoadingService,
    private messages: MessageService,
    private controlCodeService: ControlCodeService,
  ) { }

  ngOnInit(): void {
    this.loadEntities();
  }

  handleSubmit(data: ControlCodeModel[]): void {
    this.loading.show();
    this._entities.next([]);

    this.controlCodeService.bulk$(data)
      .pipe(
        finalize(() => {
          this.loading.hide();
          this.loadEntities();
        })
      )
      .subscribe({
        next: res => {
          if (res?.success) {
            Swal.fire(this.messages.getTranslate('Labels.SaveChanges'), this.messages.getTranslate('ControlCodes.SaveChanges'), 'success');
          } else {
            Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
          }
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
        }
      });

  }

  private loadEntities(): void {
    this.loading.show();
    this._entities.next([]);

    this.controlCodeService.getAll$()
      .pipe(
        filter((res) => !!res && !!res.success && !!res.data && res.data.length > 0),
        finalize(() => this.loading.hide())
      )
      .subscribe(res => {
        const data = res.data?.map(s => {
          return {
            id: s.id,
            name: s.name,
            description: s.description ?? '',
            value: this.getValue(s.type, s.value),
            type: s.type,
            displayOrder: s.displayOrder
          }
        })
        this._entities.next(data ?? []);
      });
  }

  private getValue(type: number, value: any): string | number | boolean {
    if (`${value}`?.length > 0) {
      switch (type) {
        case 1: //number
          return +value;
        case 2: //boolean
          return `${value}` === 'True';
        case 0: //string
        default:
          return `${value}`;
      }
    }

    return `${value}`;
  }
}
