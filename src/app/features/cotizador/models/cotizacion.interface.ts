import { Product } from "./product.interface";

export enum CotizacionStatus {
  'Devuelto' , 'Pendiente' , null
}

export interface QuotationHeader {
  no:         string;
  noClient:   string;
  clientName: string;
  total: number;
  status?: CotizacionStatus;
  fecha: Date;
}

export interface RespQuotationDetailDto {
  noQuotation: string;
  noProduct: string;
  descProduct: string;
  noLine: number;
  quantity: number;
  price: number;
}


// GET all
export interface RespQuotationsDto {
  no: string;
  noClient: string;
  clientName: string;
  detail: RespQuotationDetailDto[] 
  total: number;       
  // 
  fecha: Date;
  igv?: number;
  totalPrice?: number;
  status?: CotizacionStatus;
  timestamp?: number;
}


//GET by id
export interface RespQuotationByIdDto {
  no: string;
  noClient: string;
  clientName: string;
  detail: RespQuotationDetailDto[];
  status?: CotizacionStatus,
  total: number

  fecha: Date;
}

export interface RespQuotationDetailDto {
  noQuotation: string;
  noProduct: string;
  descProduct: string;
  noLine: number;
  quantity: number;
  price: number;
  // 
  amount?: number;
  stock?: number;
}


// TODO: reemplazar interfaces post, put y cart por esta
// POST y PUT unificados
export interface Quotation {
  no: string;
  noClient: string;
  clientName: string;
  cart: QuotationDetail[];  

  fecha: Date;

  // opcionales (localStorage)
  minorPriceChecked: boolean;
  status?: CotizacionStatus;
  totalPrice?: number;
  timestamp?: number;
}

// Detail POST y PUT unificados
export interface QuotationDetail {
  noLine: number;
  productCode: string;
  quantity: number;
  price: number;

  // opcionales (localStorage)
  descProduct?: string;
  amount?: number;
  originalPrice?: number
}


// POST - add
export interface GenerateQuotation_BL {
  noClient: string;
  clientName: string;
  cart: CartProductGen[];
  totalPrice?: number;
  igv?: number;
}
export interface CartProductGen {
  productCode: string;
  quantity: number;
  price: number;
}

// PUT - edit
export interface ModifyQuotation_BL {
  no: string;
  noClient: string;
  clientName: string;
  cart: CartProductMod[];
  igv?: number;
  totalPrice?: number;
}
export interface CartProductMod {
  noLine: number;
  productCode: string;
  quantity: number;
  price: number;
}
    