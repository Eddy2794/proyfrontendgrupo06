import { NgTemplateOutlet, AsyncPipe, CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, Subscription, BehaviorSubject, combineLatest, timer, fromEvent } from 'rxjs';
import { map, startWith, catchError, delay, switchMap, take } from 'rxjs/operators';

import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { UserStateService } from '../../../services/user-state.service';
import { User, Persona } from '../../../models';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    ContainerComponent, 
    HeaderTogglerDirective, 
    SidebarToggleDirective, 
    IconDirective, 
    HeaderNavComponent, 
    NavItemComponent, 
    NavLinkDirective, 
    RouterLink, 
    RouterLinkActive, 
    NgTemplateOutlet, 
    BreadcrumbRouterComponent, 
    DropdownComponent, 
    DropdownToggleDirective, 
    AvatarComponent, 
    DropdownMenuDirective, 
    DropdownHeaderDirective, 
    DropdownItemDirective, 
    DropdownDividerDirective, 
    CommonModule, 
    AsyncPipe
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  // Observables para la información del usuario
  user$: Observable<any>;
  isAuthenticated$: Observable<string | null>;
  
  // Estado interno para manejo de usuario
  private userDataSubject = new BehaviorSubject<any>(null);
  private subscriptions: Subscription[] = [];

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(private auth: AuthService, private userStateService: UserStateService) {
    super();
    
    // Inicializar observables
    this.user$ = this.userDataSubject.asObservable();
    this.isAuthenticated$ = this.auth.token$;
    
    // Escuchar eventos de focus/visibility para restaurar usuario
    this.setupVisibilityListeners();
  }

  ngOnInit(): void {
    // Forzar inicialización del servicio de autenticación si es necesario
    this.auth.initializeAuthIfNeeded();
    
    // Cargar datos del usuario inmediatamente
    this.loadUserData();
    
    // Configurar timer para verificación periódica del usuario
    const userCheckTimer = timer(0, 2000).pipe(
      switchMap(() => this.auth.user$),
      take(10) // Limitar a 10 verificaciones para evitar loops infinitos
    ).subscribe(user => {
      if (user && !this.userDataSubject.value) {
        console.log('Usuario detectado en verificación periódica:', user);
        this.userDataSubject.next(user);
      }
    });
    
    // Suscribirse a cambios del usuario desde el servicio
    const userSub = this.auth.user$.subscribe(user => {
      console.log('Usuario actualizado en header:', user);
      this.userDataSubject.next(user);
    });
    
    // Suscribirse a cambios del token para recargar usuario si es necesario
    const tokenSub = this.auth.token$.subscribe(token => {
      if (token && !this.userDataSubject.value) {
        console.log('Token detectado, cargando datos del usuario...');
        this.loadUserData();
      } else if (!token) {
        console.log('Token perdido, limpiando datos del usuario');
        this.userDataSubject.next(null);
      }
    });
    
    this.subscriptions.push(userSub, tokenSub, userCheckTimer);
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configurar listeners para eventos de visibilidad y focus
   */
  private setupVisibilityListeners(): void {
    // Escuchar cuando la página vuelve a ser visible
    const visibilityListener = fromEvent(document, 'visibilitychange').subscribe(() => {
      if (!document.hidden && this.auth.token && !this.userDataSubject.value) {
        console.log('Página visible, verificando datos del usuario...');
        this.loadUserData();
      }
    });
    
    // Escuchar cuando la ventana obtiene el foco
    const focusListener = fromEvent(window, 'focus').subscribe(() => {
      if (this.auth.token && !this.userDataSubject.value) {
        console.log('Ventana enfocada, verificando datos del usuario...');
        this.loadUserData();
      }
    });
    
    this.subscriptions.push(visibilityListener, focusListener);
  }

  /**
   * Cargar datos del usuario desde el servicio
   */
  private loadUserData(): void {
    // Primero intentar usar el usuario en cache del servicio
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      console.log('Usuario encontrado en cache:', currentUser);
      this.userDataSubject.next(currentUser);
      return;
    }

    // Verificar localStorage directamente como fallback
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && this.auth.token) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Usuario restaurado desde localStorage:', user);
        this.userDataSubject.next(user);
        // También actualizar el servicio de auth
        this.auth.updateCurrentUser(user);
        return;
      } catch (error) {
        console.error('Error parseando usuario desde localStorage:', error);
      }
    }

    // Si no hay usuario en cache pero hay token, intentar refrescar desde backend
    if (this.auth.token) {
      console.log('No hay usuario en cache, refrescando desde backend...');
      const refreshSub = this.auth.refreshUserProfile().pipe(
        catchError(error => {
          console.error('Error refrescando perfil de usuario:', error);
          // Si falla el refresh, intentar usar el UserStateService
          this.userStateService.forceRestoreUserState();
          return [];
        })
      ).subscribe(user => {
        if (user) {
          console.log('Usuario refrescado exitosamente:', user);
          this.userDataSubject.next(user);
        }
      });
      
      this.subscriptions.push(refreshSub);
    }
  }

  /**
   * Forzar recarga de datos del usuario
   */
  public refreshUserData(): void {
    console.log('Forzando recarga de datos del usuario...');
    this.loadUserData();
  }

  sidebarId = input('sidebar1');

  public newMessages = [
    {
      id: 0,
      from: 'Jessica Williams',
      avatar: '7.jpg',
      status: 'success',
      title: 'Urgent: System Maintenance Tonight',
      time: 'Just now',
      link: 'apps/email/inbox/message',
      message: 'Attention team, we\'ll be conducting critical system maintenance tonight from 10 PM to 2 AM. Plan accordingly...'
    },
    {
      id: 1,
      from: 'Richard Johnson',
      avatar: '6.jpg',
      status: 'warning',
      title: 'Project Update: Milestone Achieved',
      time: '5 minutes ago',
      link: 'apps/email/inbox/message',
      message: 'Kudos on hitting sales targets last quarter! Let\'s keep the momentum. New goals, new victories ahead...'
    },
    {
      id: 2,
      from: 'Angela Rodriguez',
      avatar: '5.jpg',
      status: 'danger',
      title: 'Social Media Campaign Launch',
      time: '1:52 PM',
      link: 'apps/email/inbox/message',
      message: 'Exciting news! Our new social media campaign goes live tomorrow. Brace yourselves for engagement...'
    },
    {
      id: 3,
      from: 'Jane Lewis',
      avatar: '4.jpg',
      status: 'info',
      title: 'Inventory Checkpoint',
      time: '4:03 AM',
      link: 'apps/email/inbox/message',
      message: 'Team, it\'s time for our monthly inventory check. Accurate counts ensure smooth operations. Let\'s nail it...'
    },
    {
      id: 3,
      from: 'Ryan Miller',
      avatar: '4.jpg',
      status: 'info',
      title: 'Customer Feedback Results',
      time: '3 days ago',
      link: 'apps/email/inbox/message',
      message: 'Our latest customer feedback is in. Let\'s analyze and discuss improvements for an even better service...'
    }
  ];

  public newNotifications = [
    { id: 0, title: 'New user registered', icon: 'cilUserFollow', color: 'success' },
    { id: 1, title: 'User deleted', icon: 'cilUserUnfollow', color: 'danger' },
    { id: 2, title: 'Sales report is ready', icon: 'cilChartPie', color: 'info' },
    { id: 3, title: 'New client', icon: 'cilBasket', color: 'primary' },
    { id: 4, title: 'Server overloaded', icon: 'cilSpeedometer', color: 'warning' }
  ];

  public newStatus = [
    { id: 0, title: 'CPU Usage', value: 25, color: 'info', details: '348 Processes. 1/4 Cores.' },
    { id: 1, title: 'Memory Usage', value: 70, color: 'warning', details: '11444GB/16384MB' },
    { id: 2, title: 'SSD 1 Usage', value: 90, color: 'danger', details: '243GB/256GB' }
  ];

  public newTasks = [
    { id: 0, title: 'Upgrade NPM', value: 0, color: 'info' },
    { id: 1, title: 'ReactJS Version', value: 25, color: 'danger' },
    { id: 2, title: 'VueJS Version', value: 50, color: 'warning' },
    { id: 3, title: 'Add new layouts', value: 75, color: 'info' },
    { id: 4, title: 'Angular Version', value: 100, color: 'success' }
  ];

  // Método para logout con confirmación simple del navegador
  onLogout(): void {
    console.log('🚪 onLogout llamado - Mostrando confirmación del navegador');
    
    const confirmed = confirm('¿Estás seguro de que deseas cerrar sesión?\n\nSe cerrará tu sesión actual y serás redirigido a la página de login.');
    
    if (confirmed) {
      console.log('✅ Usuario confirmó logout');
      console.log('� Ejecutando auth.logout()...');
      this.auth.logout();
    } else {
      console.log('❌ Usuario canceló logout');
    }
  }

  /**
   * Obtener nombre de usuario para mostrar
   */
  getUserDisplayName(): string {
    const user = this.auth.currentUser;
    if (user?.persona && typeof user.persona !== 'string') {
      const persona = user.persona as Persona;
      return `${persona.nombres} ${persona.apellidos}`;
    }
    return user?.username || 'Usuario';
  }
}
