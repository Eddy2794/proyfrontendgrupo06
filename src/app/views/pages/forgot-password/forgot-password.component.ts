import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TextColorDirective,
  AlertComponent,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    TextColorDirective,
    RouterLink,
    AlertComponent,
    SpinnerComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  resetForm!: FormGroup;
  
  step: 'email' | 'password' = 'email';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  verifiedEmail: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmitEmail(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { email } = this.forgotPasswordForm.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response.success) {
            this.successMessage = 'Email verificado. Ahora puedes establecer tu nueva contraseña.';
            this.verifiedEmail = email;
            this.step = 'password';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al verificar el email';
          if (this.error) {
            this.notificationService.showError(this.error);
          }
        }
      });
    }
  }

  onSubmitReset(): void {
    if (this.resetForm.valid) {
      this.loading = true;
      this.error = null;
      
      const email = this.verifiedEmail || this.forgotPasswordForm.get('email')?.value;
      const { newPassword } = this.resetForm.value;
      
      this.authService.resetPasswordSimple({
        email,
        newPassword,
        confirmPassword: this.resetForm.get('confirmPassword')?.value
      }).subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response.success) {
            this.notificationService.showSuccess('Contraseña actualizada correctamente');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al resetear la contraseña';
          if (this.error) {
            this.notificationService.showError(this.error);
          }
        }
      });
    }
  }

  backToEmail(): void {
    this.step = 'email';
    this.error = null;
    this.successMessage = null;
    this.resetForm.reset();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
