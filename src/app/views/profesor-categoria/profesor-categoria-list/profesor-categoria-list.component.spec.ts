import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorCategoriaListComponent } from './profesor-categoria-list.component';

describe('ProfesorCategoriaListComponent', () => {
  let component: ProfesorCategoriaListComponent;
  let fixture: ComponentFixture<ProfesorCategoriaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesorCategoriaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesorCategoriaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
