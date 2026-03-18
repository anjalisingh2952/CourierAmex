export interface GenericResponse<T> {
  forEach(arg0: (element: any) => void): unknown;
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}
