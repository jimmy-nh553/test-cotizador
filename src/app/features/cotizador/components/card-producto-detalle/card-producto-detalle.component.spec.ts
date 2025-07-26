import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProductoDetalleComponent } from './card-producto-detalle.component';

describe('CardProductoDetalleComponent', () => {
  let component: CardProductoDetalleComponent;
  let fixture: ComponentFixture<CardProductoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProductoDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardProductoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
