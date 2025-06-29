import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Mostrar notificación de éxito
   */
  showSuccess(title: string, message?: string, duration = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      autoClose: true,
      duration
    });
  }

  /**
   * Mostrar notificación de error
   */
  showError(title: string, message?: string, duration = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      autoClose: true,
      duration
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  showWarning(title: string, message?: string, duration = 4000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration
    });
  }

  /**
   * Mostrar notificación informativa
   */
  showInfo(title: string, message?: string, duration = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      autoClose: true,
      duration
    });
  }

  /**
   * Agregar notificación a la lista
   */
  private addNotification(notification: NotificationItem): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remover si está configurado
    if (notification.autoClose && notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Remover notificación específica
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
