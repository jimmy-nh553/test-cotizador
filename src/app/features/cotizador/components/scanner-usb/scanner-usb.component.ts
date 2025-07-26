import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { catchError, EMPTY, map } from 'rxjs';

import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product/product.service';

import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'scanner-usb',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputText,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './scanner-usb.component.html',
  styleUrl: './scanner-usb.component.css'
})
export class ScannerUsbComponent {

  buttonLabel: string = 'Escanear';
  isScanning: boolean = false;

  @Input()
  checkedPrecioMenor: boolean = false;

  @Input()
  percentageForMinorTypePrice: number = 1;

  @ViewChild('hiddenInputBarcode')
  hiddenInputBarcode!: ElementRef<HTMLInputElement>;

  @ViewChild('inputScanner')
  inputScanner!: ElementRef<HTMLInputElement>;

  @Output()
  onProductScanned: EventEmitter<Product | null> = new EventEmitter(); 

  typingTimer: any;
  doneTypingInterval: number = 50;

  productScanned: Product | null = null;

  constructor( 
    private _productService: ProductService,
    private _cartService: CartService
   ) { }

  onInputChange(event: Event) {
    clearTimeout(this.typingTimer);
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.typingTimer = setTimeout(() => {
      this.doneTyping(value)
    }, this.doneTypingInterval);
  }

  doneTyping(value: string) {
    this.searchScannedProduct(value);

    this.inputScanner.nativeElement.value = '';  
  }


  scanProduct() {    
    if(!this.isScanning) {

      // console.log('scan false');
      
      this.isScanning = true;
      this.hiddenInputBarcode.nativeElement.focus();
      this.buttonLabel = 'Detener escaner';
      return;
    }

    // console.log('scan true');
    this.buttonLabel = 'Escanear';    
    this.isScanning = false;
    this.hiddenInputBarcode.nativeElement.blur();
    
  } 

  onBlurHiddeninput() {
    // this.buttonLabel = 'Escanear';    
    // this.isScanning = false;
    if(this.isScanning) {
      this.hiddenInputBarcode.nativeElement.focus();
    }
  }

  searchScannedProduct(value: string) {  
    const encodedCodigo = encodeURIComponent(value);    

    this._productService.getProduct(encodedCodigo).pipe(
      map(resp => resp.data),
      map(prod => {   
          if(!this.checkedPrecioMenor) {
            console.log('no checked',prod);
            
            return { 
              ...prod,
              originalPrice: prod.unitPrice
            }
          }
          else {
            let incrementedPrice = prod.unitPrice * this.percentageForMinorTypePrice;
            if(this._cartService.getRoundedPriceConfig()){
              incrementedPrice = Math.round(incrementedPrice);
            }
            return { 
              ...prod,
              originalPrice: prod.unitPrice,
              // unitPrice: prod.unitPrice * this.percentageForMinorTypePrice
              unitPrice: incrementedPrice
            }
          }     
      }),
      catchError(err => {
        if( err.status === 404) {
          
          this.productScanned = null;
          this.onProductScanned.emit( this.productScanned );
        }
        this.productScanned = null;
        
        return EMPTY;
      })
    ).subscribe(rep => {
      this.productScanned = rep;
      
      
      this.onProductScanned.emit( this.productScanned );
    })
    // console.log({value});      
  }
  
  

}
