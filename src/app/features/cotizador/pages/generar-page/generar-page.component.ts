import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { catchError, EMPTY, map } from 'rxjs';

import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CotizacionService } from '../../services/cotizacion/cotizacion.service';
import { CardProductoComponent } from '../../components/card-producto/card-producto.component';
import { CartService } from '../../services/cart/cart.service';
import { ScannerCodeComponent } from '../../components/scanner-code/scanner-code.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { CotizacionStatus, Quotation } from '../../models/cotizacion.interface';
import { Mapper } from '../../../../shared/utils/mapper';
import { Product } from '../../models/product.interface';
import { CompanyService } from '../../services/company/company.service';
import { DetalleCotizacionTableComponent } from '../../components/detalle-cotizacion-table/detalle-cotizacion-table.component';
import { ClientData } from '../../../../core/models/migo.interface';

import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'cotizador-generar-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    ButtonModule,
    CardProductoComponent,
    Toast,
    InputTextModule,
    FloatLabel,
    ScannerCodeComponent,
    SearchBarComponent,
    CheckboxModule,
    ConfirmDialog,
    TagModule,
    ProgressSpinner,
    DialogModule,
    DetalleCotizacionTableComponent,
    RouterModule,
    AutoComplete,
  ],
  providers: [ MessageService, ConfirmationService ],
  templateUrl: './generar-page.component.html',
  styleUrl: './generar-page.component.css'
})
export class GenerarPageComponent implements OnInit, OnDestroy {

  cotizacion: Quotation = {
    no: '',
    noClient: '',
    clientName: '',
    cart: [],

    minorPriceChecked: false,
    fecha: this.getCurrentDateTime(),
    status: CotizacionStatus.null,
    totalPrice: 0,
  }

  selectedProduct: any;
  filteredProducts: any[] = [];
  // precioPorMenor: boolean = false;
  scannerVisibility: boolean = false;
  productNotFoundVisibility: boolean = false;
  
  isScannerAvailable: boolean = true;

  loadingBtnDelete: boolean = false;
  loadingBtnSave: boolean = false;
  loadingBtnSend: boolean = false;
  loadingFetchData: boolean = false;

  // fetch customer name
  filteredCustomers: ClientData[] = [];
  customersResultPage: number = 1;
  pageSize: number = 50;
  lastQuery: string = '';
  loadingAutoComplete: boolean = false;
  selectedCustomer: any;
  hasMoreData = true
  loading = false
  lastLoadedIndex = 0
  typingTimer: any;
  doneTypingInterval: number = 200;

  percentageForMinorTypePrice: number = 1;  //default 1

   // plural pipe
   productsPluralMap = {
    '=0': 'productos',
    '=1': 'producto',
    'other': 'productos'
  }
   undsPluralMap = {
    '=0': 'unidades',
    '=1': 'unidad',
    'other': 'unidades'
  }

  @ViewChild('hiddenInputBarcode')
  hiddenInputBarcode!: ElementRef<HTMLInputElement>;

  // esc key listener
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this._router.navigateByUrl('/cotizador/listado');
      
    }
  }
  

  constructor(  
    private _cotizacionesService: CotizacionService,
    private _cartService: CartService,   
    private _companyService: CompanyService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _router: Router,
   ) {}
    
  ngOnInit(): void {
    this.getCotizacionData();        
    this.getCompanyPercentageForMinorTypePrice();
  }

  ngOnDestroy(): void {
    this._cartService.clearCart();
  }

  get cotizacionCartProducts() {
    return this._cartService.cotizacionProductsCart.reverse();
  }

  get cotizacionStatus(): typeof CotizacionStatus {
    return CotizacionStatus;
  }

  getCompanyPercentageForMinorTypePrice() {
    this._companyService.getCompanyPercentageForMinorTypePrice().subscribe(response => {
      this.percentageForMinorTypePrice = response.data;
    })
  }

  getCurrentDateTime() {
    const date = new Date();
    let ahoraPeru = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    return ahoraPeru;
  }


  getCotizacionData() {
    this.loadingFetchData = true;
    const cotizacionId: string | null = history.state?.cotizacionId || null;

    // new quotation (no id found in state)
    if (!cotizacionId) {
      this.loadingFetchData = false;        
      return;
    }

    // localStorage
    if ( (cotizacionId.toUpperCase()).startsWith('CT') ) {
        this.loadCotizacionFromLocalStorage(cotizacionId);
    }
    // API
    if ( (cotizacionId.toUpperCase()).startsWith('FV') ) {
        this.getCotizacionById(cotizacionId);
    }

    if( !(cotizacionId.toUpperCase()).startsWith('CT') && !(cotizacionId.toUpperCase()).startsWith('FV') ){
      this.loadCotizacionFromLocalStorage(cotizacionId);      
    }    
  } 

  private loadCotizacionFromLocalStorage(cotizacionId: string) {
    const foundCotizacion = this._cotizacionesService.findCotizacionInLocalStorageById(cotizacionId);

    if (!foundCotizacion) {
      this.cotizacion = {
        no: '',
        noClient: '',
        clientName: '',            
        status: CotizacionStatus.null,
        cart: [],

        minorPriceChecked: false,
        fecha: this.getCurrentDateTime(),
        totalPrice:  0,
        timestamp: 0
      };

      this.messageService.add({
        severity: 'error',
        summary: 'Error al obtener la cotización',
        detail: 'Se produjo un error al intentar obtener los datos de la cotización.',
        key: 'toast-generate-cotizacion',
        life: 3500
      });

      this.loadingFetchData = false;
      return;
    }

    this.cotizacion = foundCotizacion;
    this.selectedCustomer = {
      documento: '',
      nombres: foundCotizacion.clientName,
      telefono: '',
      direccion: '',      
    };
    this._cartService.cotizacionProductsCart = foundCotizacion.cart;

    this.loadingFetchData = false;
  }


  getCotizacionById(id: string) {
    this._cotizacionesService.getQuotationById(id).pipe(
      catchError( err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al obtener la cotización',
          detail: 'Se produjo un error al intentar obtener los datos de la cotización.',
          key: 'toast-generate-cotizacion',
          life: 3500
        }); 
        
        this.loadingFetchData = false;
        return EMPTY;
      })
    ).subscribe(cotizacion => {
      if (!cotizacion) return;

      this.cotizacion =  Mapper.mapRespQuotationByIdDtoQuotation(cotizacion.data);

      this.cotizacion.status = CotizacionStatus.Devuelto;
      this.cotizacion.clientName = cotizacion.data.clientName === 'NV' || cotizacion.data.clientName === 'NOTA DE VENTA' ? '' : this.cotizacion.clientName;
      this.cotizacion.noClient = cotizacion.data.noClient === 'NV' ? '' : this.cotizacion.noClient;
      this.cotizacion.cart.forEach( prod => prod.amount = prod.quantity * prod.price);
      this._cartService.cotizacionProductsCart = this.cotizacion.cart;      

      this.selectedCustomer = {
        documento: cotizacion.data.noClient,
        nombres: cotizacion.data.clientName,
        telefono: '',
        direccion: '',      
      };

      this.loadingFetchData = false
    })
  }
  

  addProductToCart(producto: Product) {
    const productToAdd = Mapper.mapProductToQuotationDetail(producto);
    this._cartService.addProductToCart(productToAdd);

    this.saveCotizacionInLocalStorage();
  }

  getTotalCartAmount() {
    return this._cartService.calculateTotalCartAmount();
  }

  getCartIGV() {
    return this._cartService.calculateIGV();
  }

  onSelectProduct(product: Product) {
    this.addProductToCart(product);

    this.selectedProduct = null;
  }

  // save with new id
  saveToLocalStorageCotizacion() {
    const cotCodeLocal = this.cotizacion.no;
    this.loadingBtnSave = true;

    this.cotizacion.totalPrice = this.getTotalCartAmount();

    this._cotizacionesService.saveCotizacionInLocalStorage(this.cotizacion);
    
    this.clearFormAndCart();
    this.loadingBtnSave = false;

    this.messageService.add({
      severity: 'info',
      summary: 'Cotización guardada',
      detail: `Se guardó la cotización con el código ${cotCodeLocal}.`,
      key: 'toast-generate-cotizacion',
      life: 3500
    });    
  }

  sendToDynamics() {
    this.loadingBtnSend = true; 
    
    this.cotizacion.cart = this._cartService.cotizacionProductsCart;
    this._cotizacionesService.addQuotation(
      {
        no: this.cotizacion.no,
        noClient: this.cotizacion.noClient,
        clientName: this.cotizacion.clientName,
        cart: this.cotizacion.cart,                                                        
        fecha: this.cotizacion.fecha,   
        minorPriceChecked: false,     
      }
    ).pipe(
      map(resp => {
        if(!resp.success) {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error al registrar la cotización',
            detail: 'La cotización no puedo ser registrada.',
            key: 'toast-generate-cotizacion',
            life: 2500
          });

          console.log({resp});
          this.loadingBtnSend = false;
        }
        else{
          this.messageService.add({
            severity: 'success',
            summary: 'Cotización generada correctamente.',
            detail: resp.data,
            key: 'toast-generate-cotizacion',
            life: 2500
          });

          this._cotizacionesService.deleteCotizacionFromLocalStorage(this.cotizacion.no);
          this.clearFormAndCart();

          console.log({resp});          
          this.loadingBtnSend = false;
        }
      }),
      catchError( err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar la cotización',
          detail: `Error: La cotización no puedo ser registrada.`,
          key: 'toast-generate-cotizacion',
          life: 2500
        });
        console.error({err});
        
        this.loadingBtnSend = false;
        return EMPTY;
      })
    ).subscribe();
        
  }

  updateInDynamics() {
    this.loadingBtnSend = true;

    this.cotizacion.cart = this._cartService.cotizacionProductsCart;    
    
    this._cotizacionesService.updateQuotation(
      {
        no: this.cotizacion.no,
        noClient: this.cotizacion.noClient,        
        clientName: this.cotizacion.clientName,
        cart: this.cotizacion.cart,                                                        
        fecha: this.cotizacion.fecha,
        minorPriceChecked: false,
      }
    ).pipe(
      map(resp => {
        if(!resp.success) {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error al actualizar la cotización',
            detail: 'La cotización no puedo ser actualizada.',
            key: 'toast-generate-cotizacion',
            life: 2500
          });

          console.log({resp});
          this.loadingBtnSend = false;
        }
        else{
          this.messageService.add({
            severity: 'success',
            summary: `Se actualizo correctamente la cotización ${this.cotizacion.no}.`,
            detail: resp.data,
            key: 'toast-generate-cotizacion',
            life: 2500
          });
          
          this._cotizacionesService.deleteCotizacionFromLocalStorage(this.cotizacion.no);
          this.clearFormAndCart();

          console.log({resp});
          this.loadingBtnSend = false;
        }
      }),
      catchError( error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar la cotización',
          detail: `Error: ${error.message}`,
          key: 'toast-generate-cotizacion',
          life: 2500
        });
        console.log({error});

        this.loadingBtnSend = false;
        return EMPTY;
      })
    ).subscribe();
    
  }

  isFormInvalid() {
    let isInvalid = {
      saveBtn: true,
      sendBtn: true,
      deleteBtn: true,
      printBtn: true,
    }

    // cart vacio
    if(this.cotizacionCartProducts.length === 0) {
      return isInvalid;
    }    

    // pendiente/local 
    if(this.cotizacion.status === CotizacionStatus.Pendiente && this.cotizacionCartProducts.length > 0){
      isInvalid.saveBtn = false;
      isInvalid.sendBtn = false;
      isInvalid.deleteBtn = false; 
      isInvalid.printBtn = false;      
      return isInvalid;
    }

    // devuelto y no cart vacio
    if(this.cotizacion.status === CotizacionStatus.Devuelto && this.cotizacionCartProducts.length > 0) {
      isInvalid.saveBtn = true;
      isInvalid.sendBtn = false;
      isInvalid.deleteBtn = false;
      isInvalid.printBtn = false;
      return isInvalid;
    }

    return isInvalid;
  }

  validateDocCliente(event: any) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }    
  }  

  validateOnlyNumbers(event: any) {
    let currentValue = event.target.value;

    const filteredValue = currentValue.replace(/[^0-9]/g, '');
    
    if (event.target.id === 'numDocCli') {
      this.cotizacion.noClient = filteredValue;
    } 
    event.target.value = filteredValue;
  }

  getClientDataMigo() {
    if(this.cotizacion.noClient.trim().length === 0 && this.cotizacion.status === CotizacionStatus.null) {
      return;
    } 

    if(this.cotizacion.noClient.trim().length === 0 && this.cotizacion.status === CotizacionStatus.Pendiente) {      
      this.cotizacion.clientName = '';      
      this.selectedCustomer = undefined;
      this.saveCotizacionInLocalStorage();
      return;
    }

    if(this.cotizacion.noClient.length !== 8 && this.cotizacion.noClient.length !== 11) {
      this.cotizacion.clientName = '';       
      this.selectedCustomer = undefined;
      this.saveCotizacionInLocalStorage();  
      return;
    }
    
    return this._companyService.getCustomerInfo(this.cotizacion.noClient).subscribe( data => {
      if(this.cotizacion.noClient.length === 8) {
        this.cotizacion.clientName = data.nombres || '';        
        this.selectedCustomer = data;
      }
      else {
        this.cotizacion.clientName = data.nombres || '';
        this.selectedCustomer = data;
      }

      this.saveCotizacionInLocalStorage();
    })
  }

  onNameChange() {    
    this.saveCotizacionInLocalStorage();    
  }

  clearFormAndCart() {
    this.cotizacion = {
      no: '',
      noClient: '',
      clientName: '',
      cart: [],

      minorPriceChecked: false,
      status: CotizacionStatus.null,
      fecha: this.getCurrentDateTime(),
      totalPrice: 0,
      timestamp: 0
    };

    this.selectedCustomer = undefined;
    this._cartService.clearCart();
  }


  onProductScanned(product: Product | null) {
    if(!product) {      
      this.productNotFoundVisibility = true;
      setTimeout(
        () => this.productNotFoundVisibility = false,
        1500
      )
      return;
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'Producto escaneado',
      detail: `Se agregó el producto ${product.description} a la cotización` ,
      key: 'toast-generate-cotizacion',
      life: 1500
    });

    this.addProductToCart(product);
  }

  onProductChange() {
    this.saveCotizacionInLocalStorage();
  }

  // auto save
  saveCotizacionInLocalStorage() {    
    this.cotizacion.totalPrice = this.getTotalCartAmount();
    this._cotizacionesService.saveCotizacionInLocalStorage(this.cotizacion);  
    
    // carrito vacío -> elimina del local
    // if(this._cartService.cotizacionProductsCart.length === 0 && this.cotizacion.no && this.cotizacion.status === CotizacionStatus.Pendiente) {                
    //   this.deleteCotizacion(false);
    // }
     
  }

  deleteCotizacion(showToast: boolean = true) {
    if(this.cotizacion.status === CotizacionStatus.Pendiente) {
      this._cotizacionesService.deleteCotizacionFromLocalStorage(this.cotizacion.no);
      
      if(showToast) {
        this.messageService.add({
          severity: 'success',
          summary: 'Cotización eliminada',
          detail: `La cotización ${this.cotizacion.no} fue eliminada exitosamente.`,
          key: 'toast-generate-cotizacion',
          life: 2500
        });
      }

      this.clearFormAndCart();
      this.loadingBtnDelete = false;
      return;
    }

    if(this.cotizacion.status === CotizacionStatus.Devuelto) {
      this.deleteCotizacionApi(this.cotizacion.no);
    }
  }

  deleteCotizacionApi(id: string) {
    this._cotizacionesService.deleteQuotation(id).pipe(
      map(resp => {
        if(!resp.success) {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error al eliminar la cotización',
            detail: `Ocurrio un error al intentar eliminar la cotización ${id}.`,
            key: 'toast-generate-cotizacion',
            life: 2500
          });

          console.log({resp});
          this.loadingBtnDelete = false;
        }
        else{
          this.messageService.add({
            severity: 'success',
            summary: 'Cotización eliminada correctamente.',
            detail: resp.data,
            key: 'toast-generate-cotizacion',
            life: 2500
          });
      
          this.clearFormAndCart();

          console.log({resp});
          this.loadingBtnDelete = false;
        }
      }),
      catchError( error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al eliminar la cotización',
          detail: `Se produjo un error al intentar eliminar la cotización.`,
          key: 'toast-generate-cotizacion',
          life: 2500
        });
        console.log({error});

        this.loadingBtnDelete = false;
        return EMPTY;
      })
    ).subscribe();
  }

  onPrecioPorMenorChange() {
    this._cartService.increasePrecioPorMenorInProducts(this.cotizacion.minorPriceChecked);

    this.saveCotizacionInLocalStorage();
  }

  // confirmationModal() {
  confirmationModal(event: Event) {
    this.confirmationService.confirm({
      target: 
        event.target as EventTarget,
        message: `¿Está seguro que desea eliminar la cotización ${this.cotizacion.no}?`,
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
          this.loadingBtnDelete = true;

          this.deleteCotizacion();          
        },
        reject: () => {     
          return;
        },
      });
  }

  onPrint() {
    console.log('print');
    
  }

  getStatusSeverity(status: number ) {
    switch(status) {
      case 0:
        return 'warn';
      case 1:
        return 'info';      
      default: 
        return 'secondary';
    }
  }

  // scanner desktop

  isDeviceMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
  }

  
  pageTitle() {
    if(this.cotizacion.status === this.cotizacionStatus.Devuelto || this.cotizacion.status === this.cotizacionStatus.Pendiente) {
      return  {
        title: `${this.cotizacion.no}`,
        isTagActive: true,
        tagLabel: this.cotizacionStatus[this.cotizacion.status],
        severity: this.cotizacion.status,
        showOptionsMenu: true,
      }                          
    }
    else {
        return {
          title: 'Generar cotización',
          isTagActive: false,     
          tagLabel: '',
          severity: -1,
          showOptionsMenu: true,
        }           
    }
  }
  
  productsUnitsCount() {
    let totalUnits = 0;
    this.cotizacionCartProducts.forEach( prod => totalUnits += prod.quantity);

    return totalUnits;
  }
      


  // search customers  
  writtingInterval(event :any) {

    const customer: string = this.selectedCustomer ? this.selectedCustomer.trim() : '';

    // No realizar búsqueda si el campo está vacío o solo tiene espacios
    if (customer.length === 0) {
      this.cotizacion.noClient = '';
      this.cotizacion.clientName = '';
      this.selectedCustomer = undefined;

      this.saveCotizacionInLocalStorage();
      return;
    }
    else{
      this.cotizacion.clientName = customer;
          
      this.saveCotizacionInLocalStorage();
    }

    // Si la búsqueda previa es igual al nuevo input (sin espacios), no hacer nada
    if (this.lastQuery === customer) {
        return;
    }

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.filterCustomers(event)
    }, this.doneTypingInterval);
  }

  filterCustomers(event: AutoCompleteCompleteEvent) {

    const query = event.query ? event.query.trim() : '';
    // Si la consulta está vacía o solo contiene espacios, no buscar
    if (query.length === 0 || this.lastQuery === query) {
      this.lastQuery = '';
      return;
    }

    // console.log('Realizando búsqueda...', query);
    this.lastQuery = query;

    // Reiniciar paginación y estado
    this.customersResultPage = 1
    this.hasMoreData = true
    this.loading = true
    this.lastLoadedIndex = 0
  

    this._companyService.getCustomers(event.query.trim(), this.customersResultPage, this.pageSize).subscribe({
      next: (resp) => {
        this.filteredCustomers = resp.data
        this.loading = false

        // Verificar si hay más datos para cargar
        this.hasMoreData = resp.data.length === this.pageSize
      },
      error: (err) => {
        console.error("Error fetching customers", err)
        this.loading = false
      },
    })
  }

  loadNextPageOfCustomers(event: LazyLoadEvent) {
    // Verificar si realmente necesitamos cargar más datos
    const lastIndex = event.last || 0

    if (
      !this.loading &&
      this.hasMoreData &&
      lastIndex > this.lastLoadedIndex &&
      lastIndex >= this.filteredCustomers.length - 5
    ) {
      this.loading = true
      this.customersResultPage++
      this.lastLoadedIndex = lastIndex

      this._companyService.getCustomers(this.lastQuery, this.customersResultPage, this.pageSize).subscribe({
        next: (resp) => {
          if (resp.data.length > 0) {
            this.filteredCustomers = [...this.filteredCustomers, ...resp.data]
            this.hasMoreData = resp.data.length === this.pageSize
          } else {
            this.hasMoreData = false
          }

          this.loading = false
        },
        error: (err) => {
          console.error("Error fetching more customers", err)
          this.loading = false
        },
      })
    }
  }


  onSelectCustomer(event:any) {
    // console.log(event);

    this.cotizacion.noClient = this.selectedCustomer?.documento || '';
    this.cotizacion.clientName = this.selectedCustomer?.nombres || '';    
    
    this.saveCotizacionInLocalStorage();
  }
}
