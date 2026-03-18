import { BaseEntity } from "@app/models";

export interface PaymentTypeModel extends BaseEntity<number> {
    companyId?: number;
    name: string;
    companyName?: string;
}

export const newPaymentType = {
    id: 0,
    companyId: undefined,
    name: '', 
    status: 2
};
