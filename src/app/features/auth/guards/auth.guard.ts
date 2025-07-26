import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    
    return authService.isLoggedIn().pipe(
        map(resp => {        
            if(!resp.success){
                return false;
            }
            else{
                return true;                
            }
        }),
        catchError((err) => {
            router.navigateByUrl('/');
            return of(false);
        })
    );
};