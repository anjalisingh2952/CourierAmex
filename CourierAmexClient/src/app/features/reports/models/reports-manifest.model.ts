export interface ManifestGeneralInfo {
  id: number;
  manifestNumber: string;
  country: string;
  date: string; // Assuming it's in ISO format, you may use Date if needed
  address: string;
  currentDate: string;
}

export const newManifestGeneralInfo: ManifestGeneralInfo = {
  id: 0,
  manifestNumber: "",
  country: "",
  date: "", // Assuming it's in ISO format, you may use Date if needed
  address: "",
  currentDate: ""
}

export interface ManifestBillingInfo {
  childGuide: string;  // GUIA_HIJA
  customerName: string;  // CUSTOMER_NAME
  packageNumbers: string;  // PACKAGE_NUMBERS (Concatenated)
  weight: number;  // TOTAL_WEIGHT
  volumeWeight: number;  // TOTAL_VOLUME_WEIGHT
  providerName: string;  // PROVIDER_NAME
  classification: string;  // CLASSIFICATION
  address: string;  // ADDRESS
  email: string;  // EMAIL
  phone: string;  // PHONE
  bag: string;  // BAG
  totalPieces: number;  // TOTAL_PIECES
  category: string;  // CATEGORY
  cubicFeet: number;  // TOTAL_CUBIC_FEET
  customerPickup: boolean;  // CUSTOMER_PICKUP
  origin: string;
  courier: string;
  courierNumber: string;
  description:string;
}

export const newManifestBillingInfo: ManifestBillingInfo = {
  childGuide: '',
  customerName: '',
  packageNumbers: '',
  weight: 0,
  volumeWeight: 0,
  providerName: '',
  classification: '',
  address: '',
  email: '',
  phone: '',
  bag: '',
  totalPieces: 0,
  category: '',
  cubicFeet: 0,
  customerPickup: false,
  origin: '',
  courier:'',
  courierNumber:'',
  description:''
};

export const manifestTableHeaders = [
  '',
  'Tracking',
  'Cliente',
  'Courier'	,
  'Procedencia'	,
  'Nombre Courier'	,
  'Descripción'	,
  'Peso'	,
  'Volumen'	,
  'Pies Cubicos'
  /*  //'Customer Name',
   'Package Numbers',
    //'Total Weight', 
   // 'Volume Weight',
    'Provider', 
    // 'Classification', 
    // 'Address', 
    // 'Email', 
    // 'Phone', 
    // 'Bag', 
    'Total Pieces', 
    'Category', 
    'Total Cubic Feet',
     'Customer Pickup'*/
];

export interface InvoiceCreditPending {
  customerCode: string;
  fullName: string;
  paymentType: string;
  zone: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceStatus: string;
  totalAmount: number;
  totalLocalAmount: number;
  balance: number;
  localBalance: number;
  stop: string;
}

