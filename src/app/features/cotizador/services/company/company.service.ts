import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API } from '../../../../core/constants/API';
import { ClientData } from '../../../../core/models/migo.interface';
import { ResponseWithData } from '../../../../core/models/response.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private _http: HttpClient) { }
  
  getCompanyPercentageForMinorTypePrice() {
    const url = `${API.url}/company/percentage-for-minor-type-price`;
    return this._http.get<ResponseWithData<number>>(url, {withCredentials: true});
  }

  // CustomerByDoc
  getCustomerInfo(numDoc: string) {
    const url = `${API.url}/company/customer/${numDoc}`;
    return this._http.get<ClientData>(url, {withCredentials: true});
  }

  // Get customers (search by name opcional)
  getCustomers(searchName: string, page: number, pageSize: number) {
    const url = `${API.url}/company/customers`;    
    let params = new HttpParams()
      .set('nombres', searchName)
      .set('page', page)
      .set('pageSize', pageSize);

    return this._http.get<ResponseWithData<ClientData[]>>(url, {params, withCredentials: true});
  }

}
