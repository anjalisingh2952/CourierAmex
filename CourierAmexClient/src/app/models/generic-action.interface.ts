export interface GenericAction<T> {
  action: 'add' | 'update' | 'cancel' | 'delete' | 'sort' | 'clear' | 'click';
  message?: string;
  data?: T
}
