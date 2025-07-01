import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorneoCategoriaComponent } from './torneo-categoria.component';

describe('TorneoCategoriaComponent', () => {
  let component: TorneoCategoriaComponent;
  let fixture: ComponentFixture<TorneoCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorneoCategoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorneoCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
