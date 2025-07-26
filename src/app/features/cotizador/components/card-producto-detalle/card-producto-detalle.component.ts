import { Component, Input } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { RespQuotationDetailDto } from '../../models/cotizacion.interface';


@Component({
  selector: 'cotizador-card-producto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    Card,
  ],
  templateUrl: './card-producto-detalle.component.html',
  styleUrl: './card-producto-detalle.component.css'
})
export class CardProductoDetalleComponent {

  @Input()
  product: RespQuotationDetailDto = {} as RespQuotationDetailDto;

}
