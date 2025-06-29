import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { 
  ToastComponent, 
  ToastHeaderComponent, 
  ToastBodyComponent,
  ToasterComponent,
  ToasterPlacement
} from '@coreui/angular';
import { NotificationService, NotificationItem } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  template: `
    <c-toaster 
      [placement]="toasterPlacement.TopEnd"
      class="position-fixed top-0 end-0 p-3"
      style="z-index: 11;">
      
      <c-toast 
        *ngFor="let notification of notifications; trackBy: trackByFn"
        [visible]="true"
        [autohide]="notification.autoClose ?? true"
        [delay]="notification.duration ?? 3000"
        (visibleChange)="onToastVisibleChange($event, notification.id)"
        [color]="getToastColor(notification.type)"
        class="mb-2">
        
        <c-toast-header [closeButton]="true">
          <div class="d-flex align-items-center">
            <div 
              class="rounded me-2 d-flex align-items-center justify-content-center"
              [style.width.px]="20"
              [style.height.px]="20"
              [style.background-color]="getIconBackgroundColor(notification.type)">
              <span 
                class="text-white" 
                [style.font-size.px]="12"
                [innerHTML]="getIcon(notification.type)">
              </span>
            </div>
            <strong class="me-auto">{{ notification.title }}</strong>
          </div>
        </c-toast-header>
        
        <c-toast-body *ngIf="notification.message">
          {{ notification.message }}
        </c-toast-body>
      </c-toast>
    </c-toaster>
  `,
  imports: [
    CommonModule,
    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastBodyComponent
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  toasterPlacement = ToasterPlacement;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByFn(index: number, item: NotificationItem): string {
    return item.id;
  }

  onToastVisibleChange(visible: boolean, id: string): void {
    if (!visible) {
      this.notificationService.removeNotification(id);
    }
  }

  getToastColor(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  }

  getIconBackgroundColor(type: string): string {
    switch (type) {
      case 'success': return '#198754';
      case 'error': return '#dc3545';
      case 'warning': return '#fd7e14';
      case 'info': return '#0dcaf0';
      default: return '#0d6efd';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}
