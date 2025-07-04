import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  /**
   * Obtiene las URLs de redirección para MercadoPago
   * Maneja automáticamente el entorno (desarrollo vs producción)
   */
  getRedirectUrls() {
    return environment.redirectUrls;
  }

  /**
   * Obtiene la URL base del frontend
   */
  getFrontendBaseUrl(): string {
    return environment.baseUrl;
  }

  /**
   * Obtiene la URL base de la API
   */
  getApiBaseUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Verifica si estamos en modo producción
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Obtiene la configuración de MercadoPago
   */
  getMercadoPagoConfig() {
    return environment.mercadopago;
  }

  /**
   * Construye una URL completa para redirecciones
   */
  buildRedirectUrl(path: string, queryParams?: Record<string, string>): string {
    const baseUrl = this.getFrontendBaseUrl();
    let url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Obtiene las URLs de redirección para MercadoPago con parámetros adicionales
   */
  getMercadoPagoRedirectUrls(additionalParams?: Record<string, string>) {
    const redirects = this.getRedirectUrls();
    
    if (!additionalParams) {
      return redirects;
    }
    
    const addParams = (url: string) => {
      const [baseUrl, existingParams] = url.split('?');
      const params = new URLSearchParams(existingParams || '');
      
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.set(key, value);
      });
      
      return `${baseUrl}?${params.toString()}`;
    };
    
    return {
      success: addParams(redirects.success),
      failure: addParams(redirects.failure),
      pending: addParams(redirects.pending)
    };
  }
}
