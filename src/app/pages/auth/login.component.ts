import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff, lucideMail } from '@ng-icons/lucide';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideMail, lucideEye, lucideEyeOff })],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form-stack">
      <div>
        <h1 class="text-2xl font-bold mb-2" style="color:var(--text-primary);">Sign In</h1>
        <p class="text-sm" style="color:var(--text-muted);">Authenticate against the merged user service.</p>
      </div>

      @if (errorMessage) {
        <div class="rounded-lg px-3 py-2 text-sm" style="background:var(--badge-red-bg); color:var(--badge-red-text);">
          {{ errorMessage }}
        </div>
      }

      <label class="auth-field">
        <span>Email</span>
        <div class="auth-input-shell">
          <ng-icon name="lucideMail" [size]="'16'" />
          <input formControlName="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>
      </label>

      <label class="auth-field">
        <span>Password</span>
        <div class="auth-input-shell auth-input-shell--with-action">
          <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" />
          <button type="button" class="auth-input-action" (click)="showPassword.set(!showPassword())">
            <ng-icon [name]="showPassword() ? 'lucideEyeOff' : 'lucideEye'" [size]="'16'" />
          </button>
        </div>
      </label>

      <button type="submit" class="auth-submit" [disabled]="form.invalid || isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </button>

      <p class="text-sm" style="color:var(--text-muted);">
        Need an account?
        <a routerLink="/auth/signup" style="color:var(--text-primary); text-decoration:underline; text-underline-offset:2px;">Create one</a>
      </p>
    </form>
  `,
})
export class LoginComponent {
  protected readonly showPassword = signal(false);
  protected readonly form: FormGroup;
  protected isSubmitting = false;
  protected errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.authService.getPostAuthRedirectPath());
    } catch (error: any) {
      this.errorMessage = error?.error?.message || error?.error?.error || 'Sign-in failed.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
