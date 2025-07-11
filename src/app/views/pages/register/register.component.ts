import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, FormSelectDirective, ButtonDirective } from '@coreui/angular';
import { RegisterModel, TIPOS_DOCUMENTO, GENEROS } from '../../../models';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, FormSelectDirective, ButtonDirective, NgIf, NgFor, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent {
  form: FormGroup;
  error: string | null = null;
  success: string | null = null;
  isLoading = false;

  // Opciones para los selects usando las constantes del modelo
  tiposDocumento = TIPOS_DOCUMENTO;
  generos = GENEROS;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Datos personales
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      tipoDocumento: ['DNI', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', [Validators.minLength(7), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      
      // Dirección (opcional)
      calle: ['', Validators.maxLength(100)],
      ciudad: ['', Validators.maxLength(50)],
      departamento: ['', Validators.maxLength(50)],
      codigoPostal: ['', Validators.maxLength(10)],
      pais: ['Argentina', Validators.maxLength(50)],
      
      // Credenciales
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    // Limpiar errores personalizados del backend antes de validar
    this.clearCustomErrors();
    
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    // Crear instancia del modelo de registro
    const registerModel = new RegisterModel({
      // Datos de persona
      nombres: this.form.value.nombres?.trim(),
      apellidos: this.form.value.apellidos?.trim(),
      tipoDocumento: this.form.value.tipoDocumento,
      numeroDocumento: this.form.value.numeroDocumento?.trim(),
      fechaNacimiento: this.form.value.fechaNacimiento,
      genero: this.form.value.genero,
      telefono: this.form.value.telefono?.trim(),
      email: this.form.value.email?.trim(),
      
      // Dirección (solo si hay datos)
      direccion: this.buildAddress(this.form.value),
      
      // Credenciales de usuario
      username: this.form.value.username?.trim(),
      password: this.form.value.password
    });

    // Validar usando el modelo
    if (!registerModel.isValid) {
      this.isLoading = false;
      this.error = 'Por favor, complete todos los campos obligatorios correctamente.';
      return;
    }

    if (!registerModel.isEmailValid) {
      this.isLoading = false;
      this.error = 'Por favor, ingrese un email válido.';
      return;
    }

    if (!registerModel.isPasswordValid) {
      this.isLoading = false;
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (!registerModel.isUsernameValid) {
      this.isLoading = false;
      this.error = 'El nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos.';
      return;
    }

    // Enviar los datos usando el modelo
    this.auth.register(registerModel.toJSON()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.success = 'Registro exitoso. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        // Primero intentar obtener el mensaje de error específico del backend
        let errorMessage = 'Error en el registro. Intente nuevamente.';
        
        if (error.error?.error) {
          // Estructura: { error: "mensaje", code: "...", success: false }
          errorMessage = error.error.error;
        } else if (error.error?.message) {
          // Estructura alternativa: { message: "mensaje" }
          errorMessage = error.error.message;
        } else if (error.message) {
          // Error HTTP genérico
          errorMessage = error.message;
        }
        
        // Marcar campos específicos con error según el mensaje
        this.markFieldWithError(errorMessage);
        
        this.error = errorMessage;
      }
    });
  }

  private buildAddress(formData: any) {
    const address: any = {};
    
    if (formData.calle?.trim()) address.calle = formData.calle.trim();
    if (formData.ciudad?.trim()) address.ciudad = formData.ciudad.trim();
    if (formData.departamento?.trim()) address.departamento = formData.departamento.trim();
    if (formData.codigoPostal?.trim()) address.codigoPostal = formData.codigoPostal.trim();
    if (formData.pais?.trim()) address.pais = formData.pais.trim();
    
    // Solo retornar la dirección si tiene al menos un campo
    return Object.keys(address).length > 0 ? address : undefined;
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  private markFieldWithError(errorMessage: string) {
    // Limpiar errores personalizados previos
    this.clearCustomErrors();
    
    // Identificar qué campo tiene error basado en el mensaje del backend
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('número de documento') || errorLower.includes('documento')) {
      this.setFieldError('numeroDocumento', { backendError: 'Este número de documento ya está registrado' });
    } else if (errorLower.includes('email') || errorLower.includes('correo')) {
      this.setFieldError('email', { backendError: 'Este email ya está registrado' });
    } else if (errorLower.includes('usuario') || errorLower.includes('username')) {
      this.setFieldError('username', { backendError: 'Este nombre de usuario ya está en uso' });
    } else if (errorLower.includes('teléfono') || errorLower.includes('telefono')) {
      this.setFieldError('telefono', { backendError: 'Este teléfono ya está registrado' });
    }
    
    // Marcar todos los campos como touched para mostrar los errores
    this.markFormGroupTouched();
  }

  private setFieldError(fieldName: string, error: any) {
    const control = this.form.get(fieldName);
    if (control) {
      control.setErrors({ ...control.errors, ...error });
      control.markAsTouched();
    }
  }

  private clearCustomErrors() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        const { backendError, ...otherErrors } = control.errors;
        const hasOtherErrors = Object.keys(otherErrors).length > 0;
        control.setErrors(hasOtherErrors ? otherErrors : null);
      }
    });
  }

  // Métodos helper para validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      // Priorizar errores del backend
      if (errors['backendError']) return errors['backendError'];
      if (errors['required']) return `${fieldName} es obligatorio`;
      if (errors['email']) return 'Email inválido';
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['pattern']) return 'Solo se permiten letras y números';
      if (errors['passwordsMismatch']) return 'Las contraseñas no coinciden';
    }
    
    return '';
  }
}
