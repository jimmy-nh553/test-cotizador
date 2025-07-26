import { Routes } from '@angular/router';
import { PublicGuard } from './features/auth/guards/public.guard';
import { AuthGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent:() => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
        canActivate: [PublicGuard],
        title: 'Inicia sesión para ingresar al sistema | GlobalTec'
    },
    {
        path: 'cotizador',
        loadChildren: () => import('./features/cotizador/cotizador.routes').then(m => m.routes),
        canActivate: [AuthGuard]        
    },
    {
        path: '**',
        redirectTo: ''
    }
];
