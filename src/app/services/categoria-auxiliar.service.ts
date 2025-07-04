import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaAuxiliarService {

  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/');
  }
}
