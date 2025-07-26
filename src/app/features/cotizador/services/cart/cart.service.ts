import { Injectable } from '@angular/core';
import { Product } from '../../models/product.interface';

import { QuotationDetail } from '../../models/cotizacion.interface';
import { CompanyService } from '../company/company.service';
import { CotizacionService } from '../cotizacion/cotizacion.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cotizacionProdCart: QuotationDetail[] = [];
  private roundedPrice: boolean = true; //por defecto redondeo activado (es configurable, pero siempre va a está activo (por ahora))
  private minorPriceChecked: boolean = false;
  percentageForMinorTypePrice: number = 1;  //default 1
  

  constructor( 
    private _companyService: CompanyService,    
   ) {
    this.getCompanyPercentageForMinorTypePrice();
   }
  
  get cotizacionProductsCart() {
    return [...this.cotizacionProdCart];
  }

  set cotizacionProductsCart(cart: QuotationDetail[]) {
    this.cotizacionProdCart = cart;
  }

  // obtener la configuración de redondeo guardada
  getRoundedPriceConfig() {
    // const storage = localStorage.getItem('rounded-price-config');  
    // if(storage) {  
    //   this.roundedPrice =  JSON.parse(storage);
    // }
    // else {
    //   this.roundedPrice = false;
    // }

    // return this.roundedPrice;

    // POR AHORA SIEMPRE ESTA ACTIVADO
    return this.roundedPrice;
  }

  // guardar la configuración de redondeo
  // setRoundedPriceConfig(roundedPrice: boolean) {
  //   localStorage.setItem('rounded-price-config', JSON.stringify(roundedPrice));
  //   this.getRoundedPriceConfig();    

  //   //actualizar precios si se activa o desactiva
  //   // this.increasePrecioPorMenorInProducts(this.minorPriceChecked); 
  // }

  addProductToCart(product: QuotationDetail) {
    
    const index = this.cotizacionProdCart.findIndex( prod => prod.productCode === product.productCode);
    
    if (index !== -1) {
      this.cotizacionProdCart[index].quantity = this.cotizacionProdCart[index].quantity + 1;      
      this.cotizacionProdCart[index].amount = this.cotizacionProdCart[index].quantity * this.cotizacionProdCart[index].price;
      return;
    }
    
    product.quantity = 1;
    product.amount = product.quantity * product.price;
    this.cotizacionProdCart.push(product);
  }

  removeProductFromCard(productId: string) {
    const prodIndex = this.cotizacionProdCart.findIndex( prod => prod.productCode === productId);

    if(prodIndex === -1) {
      return;
    }

    this.cotizacionProdCart = this.cotizacionProdCart.filter(prod => prod.productCode !== productId);
  }


  getCompanyPercentageForMinorTypePrice() {
    this._companyService.getCompanyPercentageForMinorTypePrice().subscribe(response => {
      this.percentageForMinorTypePrice = response.data;
      // console.log(response.data);
      
    })
  }

  getProductById(idProd: string, list: Product[]) {
    const index = list.findIndex( prod => prod.code == idProd);
    
    return list[index];
  }

  increasePrecioPorMenorInProducts(isPrecioPorMenorChecked: boolean) {  
    this.minorPriceChecked = isPrecioPorMenorChecked;
    if(isPrecioPorMenorChecked) {    

      this.cotizacionProdCart.forEach( prod => {        
        // incrementa a base del precio original
        const incrementedPrice = (prod.originalPrice || prod.price) * this.percentageForMinorTypePrice;       
        if(this.roundedPrice) {
          
          // prod.price =  Math.round(incrementedPrice); //rendondea a enteros mayor o menor ( 1.4 => 1 | 1.5 => 2 )
          prod.price = Math.ceil(incrementedPrice);  //rendondea a enteros siempre al mayor ( 1.01 => 2 | 1.4 => 2 | 1.5 => 2 )
        }
        else {
          prod.price = incrementedPrice;
        }

        this.updateProductAmount(prod);
      });  

    }

    else {        
      this.cotizacionProdCart.forEach( prod => {        
        prod.price = prod.originalPrice!;
        
        this.updateProductAmount(prod);
      }); 

    }    
  }

  calculateTotalCartAmount() {
    let total: number = 0;

    this.cotizacionProdCart.forEach( prod => {
      total += prod.quantity * prod.price
    });

    return total;
  }

  calculateIGV() {
   const montoBase = (this.calculateTotalCartAmount() / 1.18) ;
    return this.calculateTotalCartAmount() - montoBase;
  }

  updateProductAmount(product: QuotationDetail) {
    const index = this.cotizacionProdCart.findIndex(prod => prod.productCode === product.productCode);

    if(index !== -1){
      this.cotizacionProdCart[index] = product;
      this.cotizacionProdCart[index].price = product.price;
      this.cotizacionProdCart[index].amount = this.cotizacionProdCart[index].quantity! * this.cotizacionProdCart[index].price;
      return;
    }

  }

  clearCart() {
    this.cotizacionProdCart = [];   
  }

}
