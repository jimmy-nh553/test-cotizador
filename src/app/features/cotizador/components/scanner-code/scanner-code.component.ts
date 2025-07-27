import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product/product.service';

import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { catchError, EMPTY, map, Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart/cart.service';

// ngx-scanner-qrcode
import { NgxScannerQrcodeModule, LOAD_WASM, ScannerQRCodeResult, NgxScannerQrcodeComponent, ScannerQRCodeConfig } from 'ngx-scanner-qrcode';
LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();

@Component({
  selector: 'scanner-code',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    Dialog,
    NgxScannerQrcodeModule,
    Toast,
    ProgressSpinner,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: './scanner-code.component.html',
  styleUrl: './scanner-code.component.css'
})
export class ScannerCodeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Subject para desuscribirse automáticamente
  
  private _modalVisibiliy: boolean = false;
  @Input()
  get modalVisibiliy() {
    return this._modalVisibiliy;
  }
  @Output()
  modalVisibiliyChange: EventEmitter<boolean> = new EventEmitter();
  set modalVisibiliy(value: boolean) {
    this._modalVisibiliy = value;

    if(value) { this.initScanner() }
    this.modalVisibiliyChange.emit(value);
  }


  scannerConfig: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth
      }
    },
    isBeep: false,
    // vibrate: 300,
  };


  cameras: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';

  @Input()
  checkedPrecioMenor: boolean = false;

  @Input()
  percentageForMinorTypePrice: number = 1;

  @Output()
  public onScannedProduct: EventEmitter<Product | null> = new EventEmitter();

  @Output()
  onCloseScannerModal: EventEmitter<void> = new EventEmitter();

  @ViewChild(NgxScannerQrcodeComponent)
  scanner?: NgxScannerQrcodeComponent;
    

  lastScannedValue?: string;

  productScanned: Product | null = null;

  // scanner timer
  scanningTimer: any;
  // doneScanningInterval: number = 180000; //3 minutos
  doneScanningInterval: number = 120000; //2 minutos
  // doneScanningInterval: number = 150000; //1.5 minutos
  // doneScanningInterval: number = 10000; //10 seg
  // doneScanningInterval: number = 5000; //5 seg

  constructor( 
    private messageServ: MessageService,
    private _productService: ProductService,
    private _cartService: CartService
   ) {}  

  ngOnInit(): void {
    // this.initScanner();
  }

  ngOnDestroy(): void {
    this.scanner?.stop();

    this.destroy$.next(); // Emitimos el evento para desuscribirnos
    this.destroy$.complete();
  }

  public handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack)
        .pipe(takeUntil(this.destroy$)) // Se desuscribe cuando `destroy$` emite un valor
        .subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]()
        .pipe(takeUntil(this.destroy$))
        .subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  async checkCameraPermission(): Promise<boolean> {
    try { //activa la cámara (si da error: no hay permisos o se está usando)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });      
      stream.getTracks().forEach(track => track.stop()); // libera la cámara y puede ser usada por el scanner
      return true;
    } catch (err) {
      console.error('Error al verificar los permisos de la cámara:', err);
      return false;
    }
  }

  async initScanner() {
    this.lastScannedValue = undefined;
    clearTimeout(this.scanningTimer); // borrar intervalo

    if (!this.modalVisibiliy) {
      this.handle(this.scanner, 'stop');
      return;
    }

    // scanner pausado => play
    if(this.scanner?.isPause) {
      this.handle(this.scanner, 'play'); 
      return; 
    }
    
    if (this.modalVisibiliy) {
      const hasPermission = await this.checkCameraPermission();
      if (!hasPermission) {
        this.messageServ.add({
          severity: 'error',
          summary: 'Permisos de cámara denegados',
          detail: 'Para usar el escaner, necesita habilitar los permisos de cámara en la configuración de su navegador.',
          key: 'toast-scanner',
          sticky: true,
          closable: true
        });
        return;
      }
    }

    // scanner detenido => start
    this.handle(this.scanner, 'start');
  }

  async onCloseModal() {
    this.modalVisibiliy = false;
    
    if(this.scanner?.isStart) {
      // this.handle(this.scanner, 'stop');
      this.handle(this.scanner, 'pause');
  
      clearTimeout(this.scanningTimer);
      this.scanningTimer = setTimeout(() => {
        this.handle(this.scanner, 'stop');
        console.warn('scanner timer interval end');      
      }, this.doneScanningInterval);
    }
    

  }

  searchScannedProduct(code: string) {
    // return this.products.find(prod => prod.code.toLowerCase() === code.toLocaleLowerCase());
    this.lastScannedValue = code;

    const encodedCodigo = encodeURIComponent(code);    

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
          this.emitProductValue(code);
        }
        this.productScanned = null;
        // this.emitProductValue(code);
        return EMPTY
      })
    ).subscribe(rep => {
      this.productScanned = rep;
      
      this.emitProductValue(code);
    })


  }

  onValueScanned(codeValue: ScannerQRCodeResult[]) {

    if(codeValue[0].value.length === 0) {    
      return;
    }

    if(codeValue[0].value === this.lastScannedValue) {
      return;
    }
           
    this.searchScannedProduct(codeValue[0].value);
  }

  emitProductValue(code: string) {  
    this.lastScannedValue = code; 
    this.onScannedProduct.emit(this.productScanned);
    
    this.onCloseModal();
  }

}
