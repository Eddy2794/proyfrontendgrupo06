import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoQrComponent } from './pago-qr.component';

describe('PagoQrComponent', () => {
  let component: PagoQrComponent;
  let fixture: ComponentFixture<PagoQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
