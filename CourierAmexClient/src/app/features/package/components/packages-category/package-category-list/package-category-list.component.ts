import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CredentialsService } from '@app/@core';
import { PackageCategoryModel } from '@app/features/package/models/package.model';
import { PermissionActionEnum, PermissionsEnum } from '@app/models';
import { ManifestModel } from '@app/models/manifest.model';

@Component({
  selector: 'app-package-category-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-category-list.component.html'
})
export class PackageCategoryListComponent {
  @Input() entity!: ManifestModel;
  @Output() onSave = new EventEmitter<PackageCategoryModel[]>();

  protected packages: PackageCategoryModel[];
  protected filteredPackagesList: PackageCategoryModel[];

  criteria = "";
  selectAll: boolean = false;

  hasAdd: boolean = false;
  hasUpdate: boolean = false;
  selectedCount = 0;

  countMap: Map<string,number> = new Map<string,number>();

  @Input() set packagesList(input: PackageCategoryModel[]) {
    this.packages = input;
    this.onKeywordSearch(this.criteria);
  }

  constructor(private credentailsService: CredentialsService) {
    this.hasAdd = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Add);
    this.hasUpdate = this.credentailsService.hasPermission(PermissionsEnum.Manifests, PermissionActionEnum.Update);
  }

  private getCategoryGroups(){
    this.countMap.clear();
    this.filteredPackagesList.forEach((item) => {
         const key = item.category;//keyGetter(item);
         const count = this.countMap.get(key);
         if (!count) {
             this.countMap.set(key,1);
         } else {
             this.countMap.set(key,count + 1);
         }
    });
  }

  categoryUpdate(category: string) {
    this.onSave.emit(this.packages.filter(p => p.select).map(p => ({ ...p, category: category })));
  }

  protected onKeywordSearch(criteria: string): void {
    this.criteria = criteria;

    if (criteria.length === 0) {
      this.filteredPackagesList = this.packages;
      this.selectedCount = this.filteredPackagesList.filter(p => p.select).length;
      this.getCategoryGroups();
      return;
    }

    const lowerCase = criteria.toLowerCase();
    this.filteredPackagesList = this.packages.filter(p => p.customerName.toLowerCase().indexOf(lowerCase) > -1);
    this.selectedCount = this.filteredPackagesList.filter(p => p.select).length;
    this.getCategoryGroups();
  }

  protected onPackageChecked(pkg: PackageCategoryModel) {
    pkg.select = !pkg.select
    this.selectedCount = this.filteredPackagesList.filter(p => p.select).length;
  }

  protected onMasterPackageChecked() {
    this.selectAll = !this.selectAll;
    this.filteredPackagesList.forEach(element => {
      element.select = this.selectAll;
    });
    this.selectedCount = this.filteredPackagesList.filter(p => p.select).length;
  }

}
