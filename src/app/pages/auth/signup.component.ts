import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const fg = control as FormGroup;
  return fg.get('password')?.value === fg.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  animations: [
    trigger('formReveal', [
      transition(':enter', [
        query(
          '.auth-field-group, .auth-btn-primary',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(55, [
              animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const { confirmPassword: _confirm, ...payload } = this.form.getRawValue();
      await this.authService.register(payload);
      await this.router.navigateByUrl(this.authService.getPostAuthRedirectPath());
    } catch (error: unknown) {
      const err = error as { error?: { message?: string; error?: string } };
      this.errorMessage.set(
        err?.error?.message ?? err?.error?.error ?? 'Registration failed. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
