import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReqLogin } from '../../../core/models/req-login.interface';
import { API } from '../../../core/constants/API';
import { Response, ResponseWithData, ResponseWithDataCount } from '../../../core/models/response.interface';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { TokenClaim, UserNameClaim } from '../../../core/models/token-claim.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private _http: HttpClient) { }

  login(user: ReqLogin) {          
    const url: string = `${API.url}/auth/login`;
    return this._http.post<HttpResponse<any>>(url, user, { withCredentials: true, observe: 'response', responseType: 'text' as 'json' })
  }  

  logout() {
    const url: string = `${API.url}/auth/logout`;
    return this._http.post<HttpResponse<any>>(url, null, { withCredentials: true, responseType: 'text' as 'json' });
  }

  isLoggedIn() {
    const url: string = `${API.url}/auth/is-logged`;
    return this._http.get<Response>(url, { withCredentials: true });
  }

  getClaimsUsername(): Observable<UserNameClaim> {
    const url: string = `${API.url}/auth/claims`;
    return this._http.get<ResponseWithData<TokenClaim[]>>(url, { withCredentials: true }).pipe(
      map( resp => resp.data ),
      map( data => data.find( claim => claim.type === 'username' ) ),
      map( userNameClaim => {
        return {
          type: userNameClaim?.type,
          value: userNameClaim?.value
        }
      })
    )
  }

}
