import { TestBed } from '@angular/core/testing';

import { ProfesorCategoriaService } from './profesor-categoria.service';

describe('ProfesorCategoriaService', () => {
  let service: ProfesorCategoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfesorCategoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
