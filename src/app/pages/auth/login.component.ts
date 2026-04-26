import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff, lucideMail } from '@ng-icons/lucide';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideMail, lucideEye, lucideEyeOff })],
  animations: [
    trigger('formReveal', [
      transition(':enter', [
        query(
          '.auth-field-group, .auth-remember-row, .auth-btn-primary, .auth-divider, .auth-btn-social',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.authService.getPostAuthRedirectPath());
    } catch (error: unknown) {
      const err = error as { error?: { message?: string; error?: string } };
      this.errorMessage.set(
        err?.error?.message ?? err?.error?.error ?? 'Sign-in failed. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
