import { Injectable } from '@angular/core';
import { CotizacionStatus, GenerateQuotation_BL, ModifyQuotation_BL, Quotation, QuotationHeader, RespQuotationByIdDto, RespQuotationDetailDto, RespQuotationsDto } from '../../models/cotizacion.interface';

import { CartService } from '../cart/cart.service';
import { API } from '../../../../core/constants/API';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Response, ResponseWithData } from '../../../../core/models/response.interface';
import { catchError, EmptyError, map, Observable, of } from 'rxjs';
import { CompanyService } from '../company/company.service';
import { Mapper } from '../../../../shared/utils/mapper';
import { MigrationService } from '../migration/migration.service';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService{

  private cotizacionesFromLocalStorage: Quotation[] = [];
  private percentageForMinorTypePrice: number = 1;  

  constructor( 
    private _http: HttpClient,
    private _cartService: CartService,
    private _migrationService: MigrationService,
   ) {
    setTimeout( () => { //obtener porcentaje
      this.percentageForMinorTypePrice = this._cartService.percentageForMinorTypePrice;
    }, 300)  
   }
 

  // API

  // All Quotations header and details
  getQuotation() {
    this.getCotizacionesFromLocalStorage();
  
    const url = `${API.url}/quotation`;
    return this._http.get<ResponseWithData<RespQuotationsDto[]>>(url, { withCredentials: true }).pipe(
      map(response => response.data),
      map(cotizaciones =>
        cotizaciones.map((cotizacion: RespQuotationsDto) => ({
          ...cotizacion,
          noClient: cotizacion.noClient, 
          clientName: cotizacion.clientName, 
          status: CotizacionStatus.Devuelto
        }))
      ),
      map(data => [...this.cotizacionesFromLocalStorage, ...data]),
      catchError(error => {
        console.error('Error trying to get quotations:', error);
        return of(this.cotizacionesFromLocalStorage);
      })
    );
  }

  getQuotationById(id: string) {    

    const url = `${API.url}/quotation/${id}`;
    return this._http.get<ResponseWithData<RespQuotationByIdDto>>(url, { withCredentials: true });
  }

  getQuotationHeaders(): Observable<Quotation[]> {    
    this.getCotizacionesFromLocalStorage();

    const url = `${API.url}/quotation/headers`;
    return this._http.get<ResponseWithData<QuotationHeader[]>>(url, { withCredentials: true }).pipe(    
      map(response => response.data),
      map(cotizaciones =>
        cotizaciones.map((cotizacion: QuotationHeader) => ({
          ...cotizacion,
          status: CotizacionStatus.Devuelto
        }))
      ),
      map(data => [ //reverse() - más recientes me muestran arriba
        ...this.cotizacionesFromLocalStorage.reverse(),
        ...data.map(header => Mapper.mapQuotationHeaderToQuotation(header)),
      ]),
      catchError(error => {
        console.error('Error trying to get quotations:', error);
        return of(this.cotizacionesFromLocalStorage.reverse());
      })
    );
    
  }
  

  getQuotationDetailById(id: string) {
    const url = `${API.url}/quotation/detail/${id}`;
    return this._http.get<ResponseWithData<RespQuotationDetailDto[]>>(url, { withCredentials: true })
  }

  
  // addQuotation(cotizacionAdd: GenerateQuotation_BL) {
  addQuotation(cotizacionAdd: Quotation) {
    
    const url = `${API.url}/quotation`;
    return this._http.post<ResponseWithData<string>>(url, cotizacionAdd, { withCredentials: true });
  }

  // updateQuotation(cotizacionUpdate: ModifyQuotation_BL) {
  updateQuotation(cotizacionUpdate: Quotation) {
    
    const url = `${API.url}/quotation`;
    return this._http.put<ResponseWithData<string>>(url, cotizacionUpdate, { withCredentials: true });
  }

  deleteQuotation(id: string) {
    const url = `${API.url}/quotation/${id}`;    

    return this._http.delete<ResponseWithData<string>>(url, { withCredentials: true });
  }

  
  // Local Storage
  getNewId() {
    const date = new Date();
    const randomNum1 = () => Math.floor(Math.random() * 10);    
    const randomNum2 = () => Math.floor(Math.random() * 10);

    let newId = `CT-${date.getMilliseconds()}${randomNum1()}${date.getSeconds()}${randomNum2()}-D`;

    return newId;
  }



  getCotizacionesFromLocalStorage() {
    // migración de localStorage data si es necearia
    this._migrationService.migrateQuotation();

    const storage = localStorage.getItem('backup-data-local');    
    
    if(storage) {
      this.cotizacionesFromLocalStorage =  JSON.parse(storage);
      
      // this.cotizacionesFromLocalStorage.sort((a, b) => b.timestamp! - a.timestamp!); // Ordena por timestamp (descendente)
      this.cotizacionesFromLocalStorage.sort((a, b) => a.timestamp! - b.timestamp!); // Ordena por timestamp (ascendente)
      return;
    }
    this.cotizacionesFromLocalStorage = [];
  }

  findCotizacionInLocalStorageById(id: string)  {
    // console.log('service',id);
    
    this.getCotizacionesFromLocalStorage();
    // console.log(this.cotizacionesFromLocalStorage);
    
    const index = this.cotizacionesFromLocalStorage.findIndex( cot => cot.no === id);
    // console.log({index});
    
    if (index === -1) {      
      return null;
    }

    
    // console.log(this.cotizacionesFromLocalStorage[index]);
    
    return this.cotizacionesFromLocalStorage[index];
  }

  // saveCotizacionInLocalStorage(cotizacion: RespQuotationsDto) {
  saveCotizacionInLocalStorage(cotizacion: Quotation) {
    this.getCotizacionesFromLocalStorage();
    
    if(cotizacion.status === CotizacionStatus.Devuelto) {
      return;
    }

    const index = this.cotizacionesFromLocalStorage.findIndex( cot => cot.no === cotizacion.no);
    
    // nueva cotizacion (guarda storage)
    if (index === -1) {
      cotizacion.no = cotizacion.no || this.getNewId();
      // cotizacion.date = new Date();
      cotizacion.cart = this._cartService.cotizacionProductsCart;
      cotizacion.status = CotizacionStatus.Pendiente;  
      cotizacion.timestamp = Date.now();
        
      this.cotizacionesFromLocalStorage.push(cotizacion);
      // this.cotizacionesFromLocalStorage.unshift(cotizacion);

      this.saveInLocalStorage('backup-data-local', this.cotizacionesFromLocalStorage);
      return;
    }
    
    cotizacion.cart = this._cartService.cotizacionProductsCart;
    this.cotizacionesFromLocalStorage[index] = cotizacion;         
    
    this.saveInLocalStorage('backup-data-local', this.cotizacionesFromLocalStorage);
  }

  saveInLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
 
  deleteCotizacionFromLocalStorage(noCotizacion: string) {    
    const updatedCotizaciones = this.cotizacionesFromLocalStorage.filter( cot => cot.no !== noCotizacion );
    this.saveInLocalStorage('backup-data-local', updatedCotizaciones);
  }  


  roundProductsPriceInQuotations(isRoundedActive: boolean) {            
    this.cotizacionesFromLocalStorage.forEach( cot => {
      let totalPriceCot = 0;
      if(cot.minorPriceChecked) {        
        cot.cart.forEach( prod => {                            
          prod.amount = 0;
          if(isRoundedActive) {                        
            prod.price = Math.round(prod.price);            
          }
          else {                        
            prod.price = (prod.originalPrice! ) * this.percentageForMinorTypePrice;
            console.log(this.percentageForMinorTypePrice);
            
          }
          prod.amount += prod.price * prod.quantity;
          totalPriceCot += prod.amount;
        })
        cot.totalPrice = totalPriceCot;        
      }
    })
    this.saveInLocalStorage('backup-data-local', this.cotizacionesFromLocalStorage);    
  }

}
