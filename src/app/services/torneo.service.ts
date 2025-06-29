import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Torneo } from '../models/torneo';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {

  private apiUrl = 'http://localhost:3000/api/torneos'; 

  constructor(private http: HttpClient) { }

  getTorneos(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/');
  }

  getTorneo(id: string): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.get(this.apiUrl + '/' + id, httpOptions);
  }

  addTorneo(torneo: Torneo): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneo);
    return this.http.post(this.apiUrl + '/', body, httpOption);
  }

  updateTorneo(torneo: Torneo): Observable<any> {
    let httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    let body: any = JSON.stringify(torneo);
    return this.http.put(this.apiUrl + '/' + torneo._id, body, httpOption);
  }

  deleteTorneo(id: string): Observable<any> { 
    let httpOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    }
    return this.http.delete(this.apiUrl + '/' + id, httpOptions);
  }
}