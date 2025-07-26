import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output,  } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'quantity-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './quantity-input.component.html',
  styleUrl: './quantity-input.component.css'
})
export class QuantityInputComponent {

  @Input()
  value: number | null = null;

  @Input()
  inputOrientation: 'vertical' | 'horizontal' = 'vertical';

  @Output()
  onValueChange: EventEmitter<number> = new EventEmitter();

  
  increment() {
    // Si el input está vacío o tiene un valor no válido, lo establecemos en 1 y salimos
    if (!this.value || this.value === null || this.value === 0) {
      this.value = 1;
      return;  
    }
  
    this.value += 1;
    this.onValueChange.emit(this.value);
  }

  decrement() {
    if (!this.value || this.value === null || this.value === 0) {
      this.value = 1;
      return; 
    }
  
    if (this.value === 1) {
      return;
    }
  
    this.value -= 1;
    this.onValueChange.emit(this.value);
  }

  validateOnBlur() {
    // Usamos un pequeño delay para evitar que el evento click ocurra antes de que Angular detecte el cambio
    setTimeout(() => {
      if (!this.value || this.value === null || this.value === 0) {
        this.value = 1;
        this.onValueChange.emit(this.value);
        return;
      }
    }, 100);

    if(this.value) {
      this.onValueChange.emit(this.value);
    }
  }

  validateOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
  
    // Permitir números (0-9) 
    if ( (charCode >= 48 && charCode <= 57) ) {
      return;
    }
  
    event.preventDefault();
  }


}
