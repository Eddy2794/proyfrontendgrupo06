import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TorneoCategoria } from '../models/torneo-categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TorneoCategoriaService {

  private apiUrl = `${environment.apiUrl}/torneos-categorias`;

  constructor(private http: HttpClient) { }

  getTorneosCategorias(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/', {
      params: {
        activa: 'true'
      }
    });
  }

  getTorneoCategoria(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  addTorneo(torneoCategoria: TorneoCategoria): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneoCategoria);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  updateTorneo(torneoCategoria: TorneoCategoria): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneoCategoria);
    return this.http.put(this.apiUrl + '/' + torneoCategoria._id, body, httpOption);
  }

  deleteTorneo(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }

}
