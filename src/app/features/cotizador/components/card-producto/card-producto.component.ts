import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../services/cart/cart.service';
import { QuotationDetail } from '../../models/cotizacion.interface';
import { QuantityInputComponent } from '../../../../shared/components/quantity-input/quantity-input.component';

import { InputNumber } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cotizador-card-producto',
  standalone: true,
  imports: [
    FormsModule,
    InputNumber,
    ButtonModule,
    QuantityInputComponent,
    CommonModule,
  ],
  providers: [ MessageService],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css'
})
export class CardProductoComponent {

  @Input()
  product: QuotationDetail = {} as QuotationDetail;

  @Output()
  onProductChange: EventEmitter<void> = new EventEmitter();

  constructor( 
    private _cartService: CartService,
    private confirmationService: ConfirmationService,
   ) {}

  removeProduct() {  
    this._cartService.removeProductFromCard(this.product.productCode);
    this.onProductChange.emit();
  }

  updateCartProduct() {
    this._cartService.updateProductAmount(this.product);    
    this.onProductChange.emit();
  }

  onQuantityChange(quantity: number) {
    this.product.quantity = quantity;

    this.updateCartProduct();
  }

  confirmationModal(event: Event) {
    this.confirmationService.confirm({
      target: 
        event.target as EventTarget,
        message: `¿Está seguro que desea eliminar el producto "${this.product.descProduct}" (${this.product.productCode}) de la cotización?`,
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

          this.removeProduct();          
        },
        reject: () => {     
          return;
        },
      });
  }

}
