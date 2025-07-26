import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CotizacionStatus, RespQuotationsDto } from '../../models/cotizacion.interface';
import { CardProductoDetalleComponent } from '../card-producto-detalle/card-producto-detalle.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'cotizaciones-modal-detalle',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    Dialog,
    CardProductoDetalleComponent,
  ],
  templateUrl: './modal-detalle.component.html',
  styleUrl: './modal-detalle.component.css'
})
export class ModalDetalleComponent {  

  @Input()
  visible: boolean = false;

  @Output()
  onCloseModal: EventEmitter<boolean> = new EventEmitter();

  @Input()
  cotizacion: RespQuotationsDto = {
      no: '',
      noClient: '',
      clientName: '',
      igv: 0,
      total: 0,
      status: CotizacionStatus.null,
      fecha: this.getCurrentDateTime(),
      detail: [],
    };  

  constructor() {}

  getDetailsCount() {
    return this.cotizacion?.detail.length > 0;
  }

  getCurrentDateTime() {
    const date = new Date();
    let ahoraPeru = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    return ahoraPeru;
  }

  closeModal() {
    this.visible = false;
    this.onCloseModal.emit(false);
  }

}
