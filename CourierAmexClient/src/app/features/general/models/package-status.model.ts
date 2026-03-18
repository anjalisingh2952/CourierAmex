export interface PackageStatusModel {
  id: number;
  code: string;
  name: string;
  status: number;

  companyName?: string;
}

export const newPackageStatus = {
  id: 0,
  code: '',
  name: '',
  status: 2
};
