import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorCategoriaFormComponent } from './profesor-categoria-form.component';

describe('ProfesorCategoriaFormComponent', () => {
  let component: ProfesorCategoriaFormComponent;
  let fixture: ComponentFixture<ProfesorCategoriaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesorCategoriaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesorCategoriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
