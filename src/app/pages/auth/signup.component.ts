import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form-stack">
      <div>
        <h1 class="text-2xl font-bold mb-2" style="color:var(--text-primary);">Create an account</h1>
        <p class="text-sm" style="color:var(--text-muted);">Register directly against the merged backend.</p>
      </div>

      @if (errorMessage) {
        <div class="rounded-lg px-3 py-2 text-sm" style="background:var(--badge-red-bg); color:var(--badge-red-text);">
          {{ errorMessage }}
        </div>
      }

      <div class="auth-grid">
        <label class="auth-field">
          <span>First name</span>
          <input formControlName="name" type="text" placeholder="Jane" autocomplete="given-name" />
        </label>
        <label class="auth-field">
          <span>Last name</span>
          <input formControlName="prenom" type="text" placeholder="Doe" autocomplete="family-name" />
        </label>
      </div>

      <label class="auth-field">
        <span>Email</span>
        <input formControlName="email" type="email" placeholder="you@example.com" autocomplete="email" />
      </label>

      <label class="auth-field">
        <span>Password</span>
        <div class="auth-input-shell auth-input-shell--with-action">
          <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" placeholder="Minimum 6 characters" autocomplete="new-password" />
          <button type="button" class="auth-input-action" (click)="showPassword.set(!showPassword())">
            <ng-icon [name]="showPassword() ? 'lucideEyeOff' : 'lucideEye'" [size]="'16'" />
          </button>
        </div>
      </label>

      <label class="auth-field">
        <span>Confirm password</span>
        <div class="auth-input-shell auth-input-shell--with-action">
          <input formControlName="confirmPassword" [type]="showConfirm() ? 'text' : 'password'" placeholder="Repeat your password" autocomplete="new-password" />
          <button type="button" class="auth-input-action" (click)="showConfirm.set(!showConfirm())">
            <ng-icon [name]="showConfirm() ? 'lucideEyeOff' : 'lucideEye'" [size]="'16'" />
          </button>
        </div>
      </label>

      @if (form.hasError('passwordMismatch') && form.touched) {
        <p class="text-xs" style="color:var(--badge-red-text);">Passwords do not match.</p>
      }

      <button type="submit" class="auth-submit" [disabled]="form.invalid || isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="text-sm" style="color:var(--text-muted);">
        Already registered?
        <a routerLink="/auth/login" style="color:var(--text-primary); text-decoration:underline; text-underline-offset:2px;">Sign in</a>
      </p>
    </form>
  `,
})
export class SignupComponent {
  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly form: FormGroup;
  protected isSubmitting = false;
  protected errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        prenom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const { confirmPassword: _confirm, ...payload } = this.form.getRawValue();
      await this.authService.register(payload);
      await this.router.navigateByUrl(this.authService.getPostAuthRedirectPath());
    } catch (error: any) {
      this.errorMessage = error?.error?.message || error?.error?.error || 'Registration failed.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private passwordMatchValidator(form: FormGroup): Record<string, boolean> | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
