export interface GenericResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ProductDetail {
  invoiceId: string;
  productName: string;
  candidate: number;
  price: number;
  total: number;
  client: string;
}

export interface ProductAmountByYear {
  productName: string;
  year: number;
  totalAmount: number;
}

export interface ProductPercentage {
  productName: string;
  percentage: number;
}

export interface TotalByProduct {
  productName: string;
  total: number;
}

export interface ProductChartDetailResponse {
  productAmountsByYear: ProductAmountByYear[];
  productPercentages: ProductPercentage[];
  totalByProducts: TotalByProduct[];
}

export interface ProductDetailsPaginatedResponse {
  records: ProductDetail[];
  totalRecords: number;
}