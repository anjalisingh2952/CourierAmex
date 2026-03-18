
export interface TemplateModel  {
    id: number;
    companyId: number;
    moduleId: string;
    transactionId: number;
    subTransactionId: number;
    name: string;
    status: string;
    processType: string;


}

export const newTemplate = {
    id: 0,
    companyId: 0,
    moduleId: '',
    transactionId: 0,
    subTransactionId: 0,
    name: '',
    status: '',
    processType: '',
};


