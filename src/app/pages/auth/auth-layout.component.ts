import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen">
      <!-- ══ LEFT — Hero image ══ -->
      <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-between"
        style="background:#0a0a0a;">

        <!-- Background image -->
        <img src="artistic-blurry-colorful-wallpaper-background.jpg" alt=""
          style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;" />

        <!-- Logo -->
        <div class="relative z-10 p-8">
          <img src="white.png" alt="FoundersLab" style="width:32px; height:32px; object-fit:contain;" />
        </div>

        <!-- Tagline -->
        <div class="relative z-10 p-8 pb-12">
          <p class="text-xs font-medium tracking-wider uppercase mb-3" style="color:rgba(255,255,255,0.5);">
            Built for Founders
          </p>
          <p class="text-2xl font-semibold leading-snug" style="color:#fff; max-width:420px;">
            We help startups accelerate growth through mentoring, funding, and a powerful community network.
          </p>
        </div>
      </div>

      <!-- ══ RIGHT — Form area ══ -->
      <div class="flex-1 flex items-center justify-center px-6 py-12"
        style="background:var(--background);">
        <div class="w-full" style="max-width:380px;">
          <!-- Mobile logo -->
          <div class="flex lg:hidden mb-10">
            <img src="colour.png" alt="FoundersLab" style="width:32px; height:32px; object-fit:contain;" />
          </div>

          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
