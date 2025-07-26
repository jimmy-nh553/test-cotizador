import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Product } from '../../models/product.interface';
import { API } from '../../../../core/constants/API';
import { ResponseWithData, ResponseWithDataCount } from '../../../../core/models/response.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor( private _http: HttpClient ) { }

  // getProducts() {
  //   const url = `${API.url}/products`;
  //   return this._http.get<ResponseWithDataCount<Product>>(url, { withCredentials: true });    
  // }

  getProducts(searchNameOrCode?: string, page?: number, pageSize?: number) {
    const url = `${API.url}/products`;

    if(searchNameOrCode && page && pageSize) {    
      let params = new HttpParams()
            .set('productNo', searchNameOrCode)
            .set('productName', searchNameOrCode)
            .set('page', page)
            .set('pageSize', pageSize);
            
      return this._http.get<ResponseWithDataCount<Product>>(url, { params, withCredentials: true })
    }
    return this._http.get<ResponseWithDataCount<Product>>(url, { withCredentials: true })
  }


  getProduct(id: string) {
    const url = `${API.url}/products/${id}`;
    return this._http.get<ResponseWithData<Product>>(url, { withCredentials: true })
  }  
  
}
