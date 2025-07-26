import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../../features/cotizador/services/product/product.service';
import { Product } from '../../../features/cotizador/models/product.interface';

import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { catchError, EMPTY, map } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { CartService } from '../../../features/cotizador/services/cart/cart.service';

@Component({
  selector: 'shared-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoComplete,
    InputIconModule,
    IconFieldModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  @Input()
  checkedPrecioMenor: boolean = false;

  selectedProduct: any;
  filteredProducts: any[] = [];

  @Input()
  percentageForMinorTypePrice: number = 1;

  @Output()
  onSelectedProduct: EventEmitter<Product> = new EventEmitter();

  // search product
  customersResultPage: number = 1;
  pageSize: number = 35;
  lastQuery: string = '';
  loadingAutoComplete: boolean = false;
  hasMoreData = true
  loading = false
  lastLoadedIndex = 0
  typingTimer: any;
  doneTypingInterval: number = 200;

  constructor( 
    private _productService: ProductService,
    private _cartService: CartService
   ) {}    

  writtingInterval(event :any) {
    const product: string = this.selectedProduct ? this.selectedProduct.trim() : '';

    // No realizar búsqueda si el campo está vacío o solo tiene espacios
    if (product.length === 0) {
      this.selectedProduct = null;
      return;
   }

  // Si la búsqueda previa es igual al nuevo input (sin espacios), no hacer nada
    if (this.lastQuery === product) {
        return;
    }

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.filterProducts(event)
    }, this.doneTypingInterval);
  }

  filterProducts(event: AutoCompleteCompleteEvent) {
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

    
    this._productService.getProducts(event.query.trim(), this.customersResultPage, this.pageSize).pipe(
      map(resp => resp.data.result),
      map(prods => { return prods.map( prod => { 
          if(!this.checkedPrecioMenor) { //precio por menor NO ACTIVADO
            return { 
              ...prod,
              originalPrice: prod.unitPrice
            }
          }
          else { //precio por menor ACTIVADO
            let incrementedPrice = prod.unitPrice * this.percentageForMinorTypePrice;
            // verifica si el redondeo está activado
            if(this._cartService.getRoundedPriceConfig()){
              // incrementedPrice = Math.round(incrementedPrice); //rendondea a enteros mayor o menor ( 1.4 => 1 | 1.5 => 2 )
              incrementedPrice = Math.ceil(incrementedPrice); //rendondea a enteros siempre al mayor ( 1.01 => 2 | 1.4 => 2 | 1.5 => 2 )
            }

            return { 
              ...prod,
              originalPrice: prod.unitPrice,
              // unitPrice: prod.unitPrice * this.percentageForMinorTypePrice
              unitPrice: incrementedPrice
            }
          }
        })
      }),
      catchError( err => {
        if ( err.status === 404){
          this.filteredProducts = [];
          this.loading = false;
        }
        return EMPTY;
      })
    )
    .subscribe({
      next: (prods) => {
        this.filteredProducts = prods;        
        this.loading = false;

        // Verificar si hay más datos para cargar
        this.hasMoreData = prods.length === this.pageSize
      },
      error: (err) => {
        console.error("Error fetching products", err)
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
      lastIndex >= this.filteredProducts.length - 5
    ) {
      this.loading = true
      this.customersResultPage++
      this.lastLoadedIndex = lastIndex

      this._productService.getProducts(this.lastQuery, this.customersResultPage, this.pageSize).pipe(
        map(resp => resp.data.result),
        map(prods => { 
          return prods.map( prod => {
            if(!this.checkedPrecioMenor) { //precio por menor NO ACTIVADO
              return {
                ...prod,
                originalPrice: prod.unitPrice
              }
            }
            else { //precio por menor ACTIVADO
              let incrementedPrice = prod.unitPrice * this.percentageForMinorTypePrice;
              // verifica si el redondeo está activado
              if(this._cartService.getRoundedPriceConfig()){
                // incrementedPrice = Math.round(incrementedPrice); //rendondea a enteros mayor o menor ( 1.4 => 1 | 1.5 => 2 )
                incrementedPrice = Math.ceil(incrementedPrice); //rendondea a enteros siempre al mayor ( 1.01 => 2 | 1.4 => 2 | 1.5 => 2 )
              }

              return { 
                ...prod,
                originalPrice: prod.unitPrice,
                unitPrice: incrementedPrice
              }
            }
          })          
        })
      )
      .subscribe({
        next: (prods) => {
          if (prods.length > 0) {
            console.log({prods});
            
            this.filteredProducts = [...this.filteredProducts, ...prods]
            this.hasMoreData = prods.length === this.pageSize;

            console.log('this.filteredProducts',this.filteredProducts);
            
          } else {
            this.hasMoreData = false
          }

          this.loading = false
        },
        error: (err) => {
          console.error("Error fetching more products", err)
          this.loading = false
        },
      })
    }
  }

  onSelectProduct(event:any) {
    this.onSelectedProduct.emit(event.value);
    this.selectedProduct = null;
  }
}
