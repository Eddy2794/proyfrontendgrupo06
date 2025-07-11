import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';

// CoreUI Components
import { 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  TableDirective,
  ButtonDirective,
  BadgeComponent,
  SpinnerComponent,
  TooltipDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  PaginationComponent,
  PageItemComponent,
  PageLinkDirective,
  AlertComponent,
  RowComponent,
  ColComponent
} from '@coreui/angular';

// CoreUI Icons
import { IconDirective } from '@coreui/icons-angular';

// Models and Services
import { User, UserRole, UserState, Persona } from '../../../models';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    TableDirective,
    ButtonDirective,
    BadgeComponent,
    SpinnerComponent,
    TooltipDirective,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    AlertComponent,
    RowComponent,
    ColComponent,
    IconDirective
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Datos y estado
  users: User[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Búsqueda
  searchTerm = '';
  selectedStatus: UserState | undefined = undefined;
  selectedRole: UserRole | undefined = undefined;
  private searchSubject = new Subject<string>();
  
  // Estados y roles disponibles
  userStates: UserState[] = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION'];
  userRoles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'TUTOR', 'MODERATOR'];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar usuarios con paginación y filtros
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;

    // Limpiar searchTerm si está vacío o solo contiene espacios
    const cleanSearchTerm = this.searchTerm?.trim() || undefined;
    
    console.log('Cargando página:', this.currentPage, 'Items por página:', this.itemsPerPage);
    
    this.userService.getAllUsers(
      this.currentPage, 
      this.itemsPerPage, 
      cleanSearchTerm, 
      this.selectedStatus, 
      this.selectedRole
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          if (response.success && response.data) {
            this.users = response.data.users;
            console.log('Usuarios recibidos:', this.users.length, this.users);
            // El backend devuelve pagination como objeto anidado
            if (response.data.pagination) {
              this.totalItems = response.data.pagination.total;
              this.totalPages = response.data.pagination.pages;
              console.log('Paginación:', {
                totalItems: this.totalItems,
                totalPages: this.totalPages,
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage
              });
            } else {
              // Fallback si no hay estructura de paginación
              this.totalItems = this.users?.length || 0;
              this.totalPages = 1;
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los usuarios: ' + (error.error?.message || error.message);
          this.loading = false;
          this.notificationService.showError('Error al cargar usuarios');
        }
      });
  }

  /**
   * Ejecutar búsqueda
   */
  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Limpiar filtros de búsqueda
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = undefined;
    this.selectedRole = undefined;
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Filtrar por estado
   */
  onStatusFilter(status: UserState | undefined): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Filtrar por rol
   */
  onRoleFilter(role: UserRole | undefined): void {
    this.selectedRole = role;
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Cambiar página
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  /**
   * Navegar a crear usuario
   */
  createUser(): void {
    this.router.navigate(['/user/form']);
  }

  /**
   * Navegar a editar usuario
   */
  editUser(user: User): void {
    this.router.navigate(['/user/form', user._id]);
  }

  /**
   * Mostrar modal de confirmación para eliminar
   */
  confirmDeleteUser(user: User): void {
    console.log('Confirmar eliminación de usuario:', user);
    
    const personaName = this.getFullName(user.persona);
    const personaEmail = this.getPersonaEmail(user.persona);
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar este usuario?\n\n` +
                          `Usuario: ${user.username}\n` +
                          `Nombre: ${personaName}\n` +
                          `Email: ${personaEmail}\n\n` +
                          `Esta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      this.deleteUser(user._id!);
    }
  }

  /**
   * Eliminar usuario
   */
  deleteUser(userId: string): void {
    if (!userId) {
      console.error('No hay ID de usuario para eliminar');
      return;
    }

    console.log('Intentando eliminar usuario con ID:', userId);
    
    this.userService.deleteUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          if (response.success) {
            this.notificationService.showSuccess('Usuario eliminado correctamente');
            this.loadUsers(); // Recargar la lista
          } else {
            console.error('Error en la respuesta:', response);
            this.notificationService.showError('Error al eliminar usuario: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error en deleteUser:', error);
          this.notificationService.showError('Error al eliminar usuario: ' + (error.error?.message || error.message));
        }
      });
  }

  /**
   * Cambiar estado del usuario
   */
  changeUserStatus(user: User, newStatus: UserState): void {
    if (!user._id) return;

    this.userService.updateUser(user._id, { estado: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notificationService.showSuccess('Estado actualizado correctamente');
            this.loadUsers();
          }
        },
        error: (error: any) => {
          this.notificationService.showError('Error al cambiar estado: ' + (error.error?.message || error.message));
        }
      });
  }

  /**
   * Cambiar rol del usuario
   */
  changeUserRole(user: User, newRole: UserRole): void {
    if (!user._id) return;

    this.userService.updateUser(user._id, { rol: newRole })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notificationService.showSuccess('Rol actualizado correctamente');
            this.loadUsers();
          }
        },
        error: (error: any) => {
          this.notificationService.showError('Error al cambiar rol: ' + (error.error?.message || error.message));
        }
      });
  }

  /**
   * Verificar email del usuario manualmente
   */
  verifyUserEmail(user: User): void {
    if (!user._id) return;

    const personaName = this.getFullName(user.persona);
    const personaEmail = this.getPersonaEmail(user.persona);
    
    const confirmMessage = `¿Confirmar verificación manual del email?\n\n` +
                          `Usuario: ${user.username}\n` +
                          `Nombre: ${personaName}\n` +
                          `Email: ${personaEmail}\n\n` +
                          `Esto marcará el email como verificado.`;
    
    if (confirm(confirmMessage)) {
      this.userService.verifyUserEmail(user._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.notificationService.showSuccess('Email verificado correctamente');
              this.loadUsers();
            }
          },
          error: (error: any) => {
            this.notificationService.showError('Error al verificar email: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  /**
   * Reset password del usuario
   */
  resetUserPassword(user: User): void {
    if (!user._id) {
      this.notificationService.showError('ID de usuario no válido');
      return;
    }

    const userName = this.getFullName(user.persona) || user.username;
    const confirmMessage = `¿Estás seguro de que quieres resetear la contraseña de ${userName}?\n\nSe generará una contraseña temporal que deberás proporcionar al usuario.`;
    
    if (confirm(confirmMessage)) {
      this.userService.resetUserPassword(user._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const { temporaryPassword, username } = response.data;
              
              // Mostrar la contraseña temporal en un alert
              const message = `Contraseña reseteada exitosamente para ${username || userName}.\n\nContraseña temporal: ${temporaryPassword}\n\nPor favor, proporciona esta contraseña al usuario y pídele que la cambie en su próximo login.`;
              
              alert(message);
              this.notificationService.showSuccess(`Contraseña reseteada para ${username || userName}`);
            }
          },
          error: (error) => {
            console.error('Error al resetear contraseña:', error);
            const errorMessage = error.error?.message || error.message || 'Error desconocido al resetear contraseña';
            this.notificationService.showError('Error al resetear contraseña: ' + errorMessage);
          }
        });
    }
  }

  /**
   * Obtener el color del badge según el estado
   */
  getStatusBadgeColor(estado?: UserState): string {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'secondary';
      case 'SUSPENDIDO': return 'danger';
      case 'PENDIENTE_VERIFICACION': return 'warning';
      default: return 'secondary';
    }
  }

  /**
   * Obtener el color del badge según el rol
   */
  getRoleBadgeColor(rol?: UserRole): string {
    switch (rol) {
      case 'SUPER_ADMIN': return 'danger';
      case 'ADMIN': return 'primary';
      case 'MODERATOR': return 'info';
      case 'TUTOR': return 'warning';
      case 'USER': return 'secondary';
      default: return 'secondary';
    }
  }

  /**
   * Obtener nombre completo de la persona
   */
  getFullName(persona: string | Persona): string {
    if (typeof persona === 'string' || !persona) return '';
    return `${persona.nombres || ''} ${persona.apellidos || ''}`.trim();
  }

  /**
   * Obtener email de la persona
   */
  getPersonaEmail(persona: string | Persona): string {
    if (typeof persona === 'string' || !persona) return '';
    return persona.email || '';
  }

  /**
   * Obtener número de documento de la persona
   */
  getPersonaDocument(persona: string | Persona): string {
    if (typeof persona === 'string' || !persona) return '';
    return persona.numeroDocumento || '';
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }

  /**
   * TrackBy function para optimizar la renderización de la lista
   */
  trackByUserId(index: number, user: User): string {
    return user._id || index.toString();
  }

  /**
   * TrackBy function para optimizar la renderización de las páginas
   */
  trackByPageNumber(index: number, page: number): number {
    return page;
  }

  /**
   * Obtener imagen de avatar del usuario
   */
  getUserAvatar(user: User): string {
    // Si el usuario tiene imagen de perfil, usarla
    if (user.imagenPerfil) {
      return user.imagenPerfil;
    }
    // Sino, usar la imagen predeterminada del header
    return './assets/images/avatars/avatar.png';
  }

  /**
   * Obtener páginas visibles para la paginación
   */
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Mostrar máximo 5 páginas
    
    // Si hay pocas páginas, mostrar todas
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Lógica para muchas páginas
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Obtener información para mostrar en el paginador
   */
  getDisplayInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }
}
