import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: 'listado',
        loadComponent: () => import('./pages/listado-page/listado-page.component').then(m => m.ListadoPageComponent),
        title: 'Listado de cotizaciones | GlobalTec'
    },
    {
        path: 'generar',
        loadComponent: () => import('./pages/generar-page/generar-page.component').then(m => m.GenerarPageComponent),
        title: 'Generar cotizaciones | GlobalTec'
    },
    {
        path: '**',
        redirectTo: 'listado'
    }
]