import { BaseEntity } from "@app/models";

export interface CustomerModel extends BaseEntity<number> {
    companyId?: number;
    documentTypeId?: number;
    documentId: string;
    name: string;
    lastname: string;
    lastname2?: string;
    fullName?: string;
    companyName?: string;
    code: string;
    countryId?: number;
    stateId?: number;
    zoneId?: number;
    areaId?: number;
    identification?: string;
    identificationId?: number;
    shipByAir: boolean;
    shipBySea: boolean;
    tmp: number;
    change: number;
    complement?: string;
    billable: number;
    synched: boolean;
    contact?: string;
    useBusShipment: boolean;
    supplierId?: number;
    locationId?: number;
    useDelivery: boolean;
    billCompany: boolean;
    customerPayTypeId?: number;
    address?: string;
    addressLine1?: string;
    addressLine2?: string;
    billableEmail?: string;
    email: string;
    lastLoginDate?: number;
    token?: string;
    securityStamp?: string;
    password?: string;
    role?: number;
    clientCategoryId?: number;
    referredBy?: string;
}

export const newCustomerModel: CustomerModel = {
    id: 0,
    companyId: -1,
    countryId: -1,
    stateId: undefined,
    zoneId: undefined,
    areaId: undefined,
    supplierId: -1,
    locationId: -1,
    code: '',
    name: '',
    status: 2,
    customerPayTypeId: -1,
    documentTypeId: -1,
    documentId: "",
    lastname: "",
    shipByAir: false,
    shipBySea: false,
    tmp: 0,
    change: 0,
    billable: 0,
    synched: false,
    useBusShipment: false,
    useDelivery: false,
    billCompany: false,
    clientCategoryId: undefined,
    email: ""
};
