export interface Product {
    code: string;
    description: string;
    unitPrice: number;
    stock: number;
    originalPrice: number;
    // 
    quantity?: number;
    amount?: number;
}
