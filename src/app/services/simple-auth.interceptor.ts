import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SimpleAuthInterceptor implements HttpInterceptor {

  // Este interceptor es redundante si usas AuthInterceptor, puedes eliminarlo o dejarlo vacío
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}
