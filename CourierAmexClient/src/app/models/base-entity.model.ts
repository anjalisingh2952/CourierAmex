export interface BaseEntity<T> {
  id: T;
  status: number;
  totalRows?: number;
}
