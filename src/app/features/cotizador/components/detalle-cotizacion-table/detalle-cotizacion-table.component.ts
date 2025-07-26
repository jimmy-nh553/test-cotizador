import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QuantityInputComponent } from '../../../../shared/components/quantity-input/quantity-input.component';
import { CartService } from '../../services/cart/cart.service';
import { CompanyService } from '../../services/company/company.service';
import { QuotationDetail, RespQuotationDetailDto } from '../../models/cotizacion.interface';
import { ScannerUsbComponent } from '../scanner-usb/scanner-usb.component';

import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'detalle-cotizacion-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    QuantityInputComponent,
    Tooltip,
    InputNumberModule,
    ScannerUsbComponent,
    
  ],
  templateUrl: './detalle-cotizacion-table.component.html',
  styleUrl: './detalle-cotizacion-table.component.css'
})
export class DetalleCotizacionTableComponent {
  @Input()
  checkedPrecioMenor: boolean = false;

  @Input()
  percentageForMinorTypePrice: number = 0;
  
  @Input()
  detailCotizacionList: QuotationDetail[] = [];

  // @Input()
  // productsListOriginal: Product[] = []; //precios originales para settear el precio orgiginal del detail

  // @Input()
  // productsListActual: Product[] = []; //pueden estar incrementados o ser el precio original, sobre el que se agrega o muestra actualmente

  @Output()
  onProductChange: EventEmitter<void> = new EventEmitter();

  @Output()
  onProductScanned: EventEmitter<Product | null> = new EventEmitter();

  detailListLength: number = 0;

  constructor( 
    private _cartService: CartService,
    private confirmationService: ConfirmationService,
  ) {}


  removeProduct(prodCode: string) {  
    this._cartService.removeProductFromCard(prodCode);
    this.onProductChange.emit();
  }

  updateCartProduct(prod: QuotationDetail) {
    this._cartService.updateProductAmount(prod);    
    this.onProductChange.emit();
  }

  onQuantityChange(prod: QuotationDetail, quantity: number) {
    prod.quantity = quantity;

    this.updateCartProduct(prod);
    this.onProductChange.emit();
  }

  validateOnlyNumbers(event: any) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }    
  } 
  

  validateValidPrice(product: QuotationDetail) {
    if (product.price == null || product.price == undefined || isNaN(product.price) || product.price < 0) {
      console.log('Validating number'); 
      product.price = 0.10;
    }

    this.updateCartProduct(product); 
    this.onProductChange.emit();
  }

  confirmationModal(event: Event, product: QuotationDetail) {
    this.confirmationService.confirm({
      target: 
        event.target as EventTarget,
        message: `¿Está seguro que desea eliminar el producto "${product.descProduct}" (${product.productCode}) de la cotización?`,
        header: 'Confirmación',
        closable: true,
        closeOnEscape: true,
        // icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
            label: 'Cancelar',
            severity: 'secondary',
            outlined: true,
        },
        acceptButtonProps: {
            label: 'Eliminar',
            severity: 'danger',
        },
        accept: () => {     

          this.removeProduct(product.productCode);          
        },
        reject: () => {     
          return;
        },
      });
  }

  // Scanner
  onReciveProductScanned(product: Product | null) {
    this.onProductScanned.emit(product);
  }

}
