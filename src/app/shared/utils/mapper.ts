import { CartProductGen, CartProductMod, GenerateQuotation_BL, ModifyQuotation_BL, Quotation, QuotationDetail, QuotationHeader, RespQuotationByIdDto, RespQuotationDetailDto, RespQuotationsDto } from "../../features/cotizador/models/cotizacion.interface";
import { Product } from "../../features/cotizador/models/product.interface";

export class Mapper {

    // GET to POST
    // static mapRespQuotationsDtoToGenerateQuotation_BL(origin: RespQuotationsDto): GenerateQuotation_BL {
    //     const cart: CartProductGen[] = [];
    //     origin.detail.forEach( prod => {
    //         cart.push({
    //             productCode: prod.noProduct,
    //             quantity: prod.quantity,
    //             price: prod.price
    //         })
    //     })
    
    //     return {
    //         noClient: origin.noClient,
    //         clientName: origin.clientName,
    //         igv: origin.igv!,
    //         totalPrice: origin.totalPrice!,
    //         cart: cart        
    //     }
    // }

    // GET to PUT
    // static mapRespQuotationsDtoToModifyQuotation_BL (origin: RespQuotationsDto): ModifyQuotation_BL {
    //     const cart: CartProductMod[] = [];
    //     origin.detail.forEach( prod => {
    //         cart.push({
    //             noLine: prod.noLine! /*|| '1000'*/,
    //             productCode: prod.noProduct,
    //             quantity: prod.quantity,
    //             price: prod.price        
    //         })
    //     })
    
    //     return {
    //         no: origin.no,
    //         noClient: origin.noClient,
    //         clientName: origin.clientName,
    //         igv: origin.igv!,
    //         totalPrice: origin.totalPrice!,
    //         cart: cart                                            
    //     }
    // }

    // // product
    // static mapProductToQuotationDetailDto(origin: Product): RespQuotationDetailDto {
    //     return {
    //         noProduct: origin.code,
    //         noQuotation: '',
    //         descProduct: origin.description,
    //         quantity: origin.quantity!,
    //         price: origin.unitPrice,
    //         amount: origin.amount,
    //         stock: origin.stock,
    //         noLine: 0
    //     }
    // }






     // Header to quotation
     static mapQuotationHeaderToQuotation (origin: QuotationHeader): Quotation {    
        return {
            no: origin.no,
            noClient: origin.noClient,
            clientName: origin.clientName,
            cart: [],            
            fecha: origin.fecha!,
            minorPriceChecked: false,
            status: origin.status,
            totalPrice: origin.total,
        }
    }

    // RespQuotationByIdDto to Quotation
    static mapRespQuotationByIdDtoQuotation (origin: RespQuotationByIdDto): Quotation {
        const cart: QuotationDetail[] = [];
        origin.detail.forEach( prod => {
            cart.push({
                noLine: prod.noLine,
                productCode: prod.noProduct,
                descProduct: prod.descProduct,
                quantity: prod.quantity,
                price: prod.price,
                originalPrice: prod.price,
                amount: prod.quantity * prod.price      
            })
        })
    
        return {
            no: origin.no,
            noClient: origin.noClient,
            clientName: origin.clientName,
            cart: cart,
                
            fecha: origin.fecha!,
            minorPriceChecked: false,
            status: undefined,
            totalPrice: 0,
            timestamp: 0
        }
    }  

    // product to QuotationDetail
    static mapProductToQuotationDetail(origin: Product): QuotationDetail {
        return {
            noLine: 0,
            productCode: origin.code,
            quantity: origin.quantity!,
            price: origin.unitPrice,

            descProduct: origin.description,
            amount: origin.amount,
            originalPrice: origin.originalPrice,
        }
    }
}
