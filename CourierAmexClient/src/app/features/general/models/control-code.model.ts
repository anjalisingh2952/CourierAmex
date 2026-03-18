export interface ControlCodeModel {
  id: string;
  name: string;
  description?: string;
  value: string | number | boolean;
  type: number;
  displayOrder: number;
}
