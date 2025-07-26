import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerUsbComponent } from './scanner-usb.component';

describe('ScannerUsbComponent', () => {
  let component: ScannerUsbComponent;
  let fixture: ComponentFixture<ScannerUsbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerUsbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerUsbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
