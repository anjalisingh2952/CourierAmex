import { ProductModel } from "./product.model";

export interface ClientCategoryModel {
  id: number;
  companyId?: number;
  name: string;
  status: number;
  discount?: number;
  includedProducts: ProductModel[];
  excludedProducts: ProductModel[];
  companyName?: string;
}

export const newClientCategory = {
  id: 0,
  companyId: undefined,
  name: '',
  status: 2,
  includedProducts: [],
  excludedProducts: []
};
