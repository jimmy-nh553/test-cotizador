import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarPageComponent } from './generar-page.component';

describe('GenerarPageComponent', () => {
  let component: GenerarPageComponent;
  let fixture: ComponentFixture<GenerarPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
