import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorneoFormComponent } from './torneo-form.component';

describe('TorneoFormComponent', () => {
  let component: TorneoFormComponent;
  let fixture: ComponentFixture<TorneoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorneoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorneoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
