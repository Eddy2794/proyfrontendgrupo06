import { Component, OnInit } from '@angular/core';
import { NgStyle, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { LoginModel } from '../../../models';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective, IconDirective, NgStyle, NgIf, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.auth.hasValidToken) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Manejar token OAuth desde query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];
      const method = params['method'];
      const message = params['message'];
      
      if (error) {
        console.error('Error OAuth recibido:', error, message);
        this.error = message || 'Error en la autenticación con Google.';
        return;
      }
      
      if (token) {
        console.log('Token OAuth recibido en URL');
        // Limpiar cualquier error previo
        this.error = null;
        
        // Usar el método público del servicio para manejar el token OAuth
        this.auth.setOAuthToken(token).then(success => {
          if (!success) {
            console.error('Error procesando token OAuth');
            this.error = 'Error en la autenticación con Google. El token no es válido.';
          }
          // Si success es true, la navegación ya se manejó en el servicio
        }).catch(error => {
          console.error('Error en setOAuthToken:', error);
          this.error = 'Error procesando la autenticación con Google.';
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    this.error = null;
    
    // Crear instancia del modelo de login
    const loginModel = new LoginModel({
      username: this.form.value.username?.trim(),
      password: this.form.value.password
    });
    
    // Validar usando el modelo
    if (!loginModel.isValid) {
      this.error = 'Por favor, complete todos los campos.';
      return;
    }
    
    // Enviar los datos usando el modelo
    this.auth.login(loginModel.toJSON()).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // La redirección se maneja automáticamente en el servicio
        // Agregar un timeout adicional como fallback
        setTimeout(() => {
          if (window.location.hash === '#/login' || window.location.hash.includes('login')) {
            console.log('Redirección no funcionó, forzando navegación...');
            window.location.href = '/#/dashboard';
          }
        }, 2000);
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.error = this.getErrorMessage(err);
      }
    });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Extraer mensaje de error del response
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.error?.error) {
      return error.error.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Error de autenticación. Verifica tus credenciales.';
  }

  loginWithGoogle(): void {
    // Redirige al backend Express para iniciar OAuth con Google
    const oauthUrl = `${environment.apiUrl}/auth/google`;
    window.location.href = oauthUrl;
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
