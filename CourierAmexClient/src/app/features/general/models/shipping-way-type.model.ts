export interface ShippingWayTypeModel {
  id: number;
  shipType?: number;
  name: string;
  status: number;
}

export const newShippingWayType = {
  id: 0,
  shipType: undefined,
  name: '',
  status: 2
};
