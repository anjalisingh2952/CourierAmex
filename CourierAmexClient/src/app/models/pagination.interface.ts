export const PageOptions = [10, 25, 50, 100];
export const PageOptionsDefault = 25;

export interface PaginationModel {
  ps: number; //Page Size
  pi: number; //Page Index
  c?: string; //Criteria
  s?: string; //SortBy
  f?: string; //Filter By
  st?: number; //Status
  ti?: number; //Total Items
  tr?: number; //Total Rows
}

export class PagedResponse<T> {
  success: boolean = false;
  totalRows: number = 0;
  data: T[] = [];
  length: number;
}

export const defaultPagination: PaginationModel = {
  ps: PageOptionsDefault,
  pi: 1
};
