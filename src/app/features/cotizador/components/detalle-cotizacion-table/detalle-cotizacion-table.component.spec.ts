import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCotizacionTableComponent } from './detalle-cotizacion-table.component';

describe('DetalleCotizacionTableComponent', () => {
  let component: DetalleCotizacionTableComponent;
  let fixture: ComponentFixture<DetalleCotizacionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCotizacionTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCotizacionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
