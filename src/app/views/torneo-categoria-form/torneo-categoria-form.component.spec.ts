import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorneoCategoriaFormComponent } from './torneo-categoria-form.component';

describe('TorneoCategoriaFormComponent', () => {
  let component: TorneoCategoriaFormComponent;
  let fixture: ComponentFixture<TorneoCategoriaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorneoCategoriaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorneoCategoriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
