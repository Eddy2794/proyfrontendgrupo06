import { Injectable } from '@angular/core';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private mp: any;
  private publicKey: string = '';

  constructor() {
    // La clave pública se configurará desde el componente
  }

  /**
   * Inicializar MercadoPago con la clave pública
   */
  initMercadoPago(publicKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.publicKey = publicKey;
      
      // Verificar si el script ya está cargado
      if (window.MercadoPago) {
        this.mp = new window.MercadoPago(publicKey);
        resolve();
        return;
      }

      // Cargar el script de MercadoPago
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        this.mp = new window.MercadoPago(publicKey);
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Error al cargar el SDK de MercadoPago'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Crear el checkout de MercadoPago
   */
  createCheckout(preferenceId: string, containerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mp) {
        reject(new Error('MercadoPago no está inicializado'));
        return;
      }

      try {
        const checkout = this.mp.checkout({
          preference: {
            id: preferenceId
          },
          render: {
            container: `#${containerId}`,
            label: 'Pagar'
          }
        });
        resolve(checkout);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Crear un botón de pago
   */
  createPaymentButton(preferenceId: string, containerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mp) {
        reject(new Error('MercadoPago no está inicializado'));
        return;
      }

      try {
        const checkout = this.mp.checkout({
          preference: {
            id: preferenceId
          },
          render: {
            container: `#${containerId}`,
            label: 'Pagar con MercadoPago'
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Redirigir al checkout de MercadoPago
   */
  redirectToCheckout(initPoint: string): void {
    window.open(initPoint, '_blank');
  }

  /**
   * Verificar si MercadoPago está disponible
   */
  isAvailable(): boolean {
    return !!this.mp;
  }
}
