export interface AppMenu {
  icon: string;
  title: string;
  url: string;
  label?: string;
  caret?: string;
  state?: string;
  hide?: boolean | string;
  submenu?: any;
}
