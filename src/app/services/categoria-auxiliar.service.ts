import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CategoriaAuxiliarService {

  private apiUrl = 'http://localhost:3000/api/categorias';

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/');
  }
}
