import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { PackageCategoryModel } from '@app/features/package';

@Component({
  selector: 'app-air-classify-packages',
  templateUrl: './air-classify-packages.component.html',
  styleUrls: ['./air-classify-packages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirClassifyPackagesComponent {
  @Output() onPackageAssign = new EventEmitter<any>();
  @Input() packages: PackageCategoryModel[] = [];
  @Input() textTitle!: string;

  protected filteredPackagesList: any = [];
  criteria = "";
  selectAll: boolean = false;
  selectedCount = 0;

  constructor(private cdr: ChangeDetectorRef) { }

  @Input() set packagesList(input: PackageCategoryModel[]) {
    this.filteredPackagesList = input.filter(pkg => pkg.select);
    this.selectedCount = this.filteredPackagesList.length;
    this.emitPackageChanges();
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['packages'] && changes['packages'].currentValue) {
      this.filteredPackagesList = [];
      this.onPackageAssign.emit([]);
      this.selectedCount = 0;
      this.selectAll = false;
    }
  }

  protected onPackageChecked(pkg: any) {
    pkg.select = !pkg.select;

    if (pkg.select) {
      if (!this.filteredPackagesList.includes(pkg)) {
        this.filteredPackagesList.push(pkg);
      }
    } else {
      this.filteredPackagesList = this.filteredPackagesList.filter((p: any) => p !== pkg);
    }

    this.selectedCount = this.filteredPackagesList.length;
    this.selectAll = this.filteredPackagesList.length === this.packages.length;

    this.emitPackageChanges();
    this.cdr.detectChanges(); 
  }

  protected onMasterPackageChecked() {
    this.selectAll = !this.selectAll;

    if (this.selectAll) {
      this.packages.forEach(pkg => pkg.select = true);
      this.filteredPackagesList = [...this.packages];
    } else {
      this.packages.forEach(pkg => pkg.select = false);
      this.filteredPackagesList = [];
    }

    this.selectedCount = this.filteredPackagesList.length;
    this.emitPackageChanges();
    this.cdr.detectChanges(); 
  }

  private emitPackageChanges() {
    this.onPackageAssign.emit([...this.filteredPackagesList]);
  }
}