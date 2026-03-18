export interface PackageList {
  crtrack: string;      
  transaction: string;
  fob: number;
  cif: number;
  amount: number;
  dua: string;
  companyId: number;
  createdBy: string;
  createdDate: Date;
  loadType: string; 
}

export interface ErrorPackage {
  crtrack: string;
  transaction: string;
  fob: number;
  cif: number;
  amount: number;
  dua: string;
  errorMessage: string;
}
