import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBell, lucideCalendar, lucideChevronDown, lucideGraduationCap,
  lucideHandshake, lucideLayoutDashboard, lucideMap, lucideRocket,
  lucideScale, lucideSearch, lucideSettings, lucideTrendingUp,
  lucideUsers, lucideLogOut, lucideUser, lucideX, lucideMail,
  lucideBriefcase, lucideShield, lucideGlobe, lucideCheck,
  lucideAlertCircle, lucideEdit, lucideMoon, lucideSun, lucideStar,
  lucideMonitor,
} from '@ng-icons/lucide';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../services/theme.service';

interface NavItem { icon: string; label: string; route: string; }
interface Notification { id: number; title: string; body: string; time: string; read: boolean; type: 'alert' | 'info' | 'success'; }

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      lucideBell, lucideCalendar, lucideChevronDown, lucideGraduationCap,
      lucideHandshake, lucideLayoutDashboard, lucideMap, lucideRocket,
      lucideScale, lucideSearch, lucideSettings, lucideTrendingUp,
      lucideUsers, lucideLogOut, lucideUser, lucideX, lucideMail,
      lucideBriefcase, lucideShield, lucideGlobe, lucideCheck,
      lucideAlertCircle, lucideEdit, lucideMoon, lucideSun, lucideStar,
      lucideMonitor,
    }),
  ],
  template: `
    <div class="flex h-screen overflow-hidden" style="background:var(--background);">

      <!-- ══ SIDEBAR (width driven by sidebarExpanded signal) ══ -->
      <aside
        class="sidebar-nav fixed inset-y-0 left-0 z-30 flex flex-col"
        [style.width]="sidebarExpanded() ? '220px' : '60px'"
        [style.box-shadow]="sidebarExpanded() ? '4px 0 28px rgba(0,0,0,0.32)' : 'none'"
        style="background:#1F2937; border-right:1px solid rgba(255,255,255,0.07);"
        aria-label="Main navigation"
        (mouseenter)="sidebarExpanded.set(true)"
        (mouseleave)="sidebarExpanded.set(false)"
      >
        <!-- Logo row -->
        <div class="flex items-center flex-shrink-0"
          style="height:56px; padding:0 12px; border-bottom:1px solid rgba(255,255,255,0.07); min-width:0;">
          <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
            <img src="white.png" alt="FoundersLab" style="width:24px; height:24px; object-fit:contain;" />
          </div>
          <span class="sidebar-label ml-2.5 font-bold text-white"
            [style.opacity]="sidebarExpanded() ? 1 : 0"
            [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
            style="font-size:14px; letter-spacing:-0.02em;">
            FoundersLab
          </span>
        </div>

        <!-- Nav items -->
        <nav class="flex flex-col gap-0.5 py-3 flex-1" style="padding-inline:10px; overflow:hidden;">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active-nav"
              class="nav-item relative flex items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style="height:40px; padding:0 2px; color:var(--text-secondary); text-decoration:none;"
              [attr.aria-label]="item.label"
            >
              <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
                <ng-icon [name]="item.icon" [size]="'17'" />
              </div>
              <span class="sidebar-label ml-2.5 text-sm font-medium"
                [style.opacity]="sidebarExpanded() ? 1 : 0"
                [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
                style="color:#D1D5DB;">
                {{ item.label }}
              </span>
            </a>
          }
        </nav>

        <!-- Bottom: Settings + Profile -->
        <div class="flex flex-col gap-1" style="border-top:1px solid rgba(255,255,255,0.07); padding:12px 10px 14px;">
          <!-- Settings -->
          <button
            (click)="showSettings.set(true)"
            class="nav-item relative flex items-center rounded-lg transition-colors duration-150 w-full"
            style="height:40px; padding:0 2px; color:var(--text-secondary); background:transparent; border:none; cursor:pointer;"
            aria-label="Open settings"
          >
            <div class="nav-icon-wrapper flex items-center justify-center" style="width:36px; height:36px; flex-shrink:0;">
              <ng-icon name="lucideSettings" [size]="'17'" />
            </div>
            <span class="sidebar-label ml-2.5 text-sm font-medium"
              [style.opacity]="sidebarExpanded() ? 1 : 0"
              [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'"
              style="color:#D1D5DB;">
              Settings
            </span>
          </button>

          <!-- Profile -->
          <button
            (click)="showProfile.set(true)"
            class="relative flex items-center rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
            style="height:44px; padding:0 2px; background:transparent; border:none; cursor:pointer; margin-top:4px;"
            aria-label="Open profile"
          >
            <div class="flex items-center justify-center rounded-full"
              style="width:36px; height:36px; flex-shrink:0; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:12px; font-weight:700;">
              MS
            </div>
            <div class="sidebar-label ml-2.5 text-left"
              [style.opacity]="sidebarExpanded() ? 1 : 0"
              [style.transition-delay]="sidebarExpanded() ? '0.1s' : '0s'">
              <p style="font-size:12px; font-weight:600; color:#fff; line-height:1.3;">Mohamed Slimane</p>
              <p style="font-size:11px; color:var(--text-secondary);">Founder</p>
            </div>
          </button>
        </div>
      </aside>

      <!-- ══ MAIN AREA (offset by sidebar width) ══ -->
      <div class="flex flex-col flex-1 overflow-hidden" style="margin-left:60px;">

        <!-- TOPBAR -->
        <header
          class="flex items-center gap-3 px-6 flex-shrink-0"
          style="height:56px; background:var(--surface); border-bottom:1px solid var(--border); position:relative; z-index:20;"
          role="banner"
        >
          <div class="flex-1">
            <h1 class="text-sm font-semibold" style="color:var(--text-primary); letter-spacing:-0.01em;">
              {{ currentPageTitle() }}
            </h1>
          </div>

          <!-- Search -->
          <div class="relative hidden md:block">
            <ng-icon name="lucideSearch" [size]="'14'"
              style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted);" />
            <input type="search" placeholder="Search..." aria-label="Search"
              class="focus:outline-none"
              style="padding:6px 12px 6px 32px; background:var(--surface-input); border:1.5px solid var(--border); border-radius:8px; width:200px; font-family:var(--font-sans); font-size:13px; color:var(--text-body);" />
          </div>

          <!-- Notifications bell -->
          <div class="relative">
            <button
              (click)="showNotifications.set(!showNotifications())"
              class="relative flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style="width:36px; height:36px; color:var(--text-secondary); background:transparent; border:none; cursor:pointer;"
              aria-label="Notifications"
              [attr.aria-expanded]="showNotifications()"
            >
              <ng-icon name="lucideBell" [size]="'18'" />
              @if (unreadCount() > 0) {
                <span aria-hidden="true" class="absolute rounded-full flex items-center justify-center"
                  style="top:5px; right:5px; width:16px; height:16px; background:var(--badge-notification-bg); color:var(--badge-notification-text); font-size:9px; font-weight:700;">
                  {{ unreadCount() }}
                </span>
              }
            </button>
          </div>

          <!-- User info (topbar) -->
          <button
            (click)="showProfile.set(true)"
            class="flex items-center gap-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            style="padding:4px 8px; background:transparent; border:none;"
            aria-label="Open profile"
          >
            <div class="flex items-center justify-center rounded-full flex-shrink-0"
              style="width:32px; height:32px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:11px; font-weight:700;">
              MS
            </div>
            <div class="hidden md:block text-left">
              <p class="text-xs font-semibold leading-none" style="color:var(--text-primary);">Mohamed Slimane</p>
              <p class="text-xs leading-none mt-0.5" style="color:var(--text-muted);">Founder</p>
            </div>
            <ng-icon name="lucideChevronDown" [size]="'13'" style="color:var(--text-muted);" />
          </button>
        </header>

        <!-- PAGE CONTENT -->
        <main class="flex-1 overflow-auto p-6" id="main-content">
          <router-outlet />
        </main>
      </div>


      <!-- ══════════════════════════════════════ -->
      <!-- NOTIFICATIONS DROPDOWN               -->
      <!-- ══════════════════════════════════════ -->
      @if (showNotifications()) {
        <div class="fixed inset-0 z-40" (click)="showNotifications.set(false)" aria-hidden="true"></div>
        <div
          class="fixed z-50 rounded-2xl overflow-hidden"
          style="top:62px; right:16px; width:340px; background:var(--surface); box-shadow:0 8px 40px rgba(11,15,42,0.18); border:1px solid var(--border);"
          role="dialog" aria-label="Notifications"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <div>
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Notifications</h3>
              <p class="text-xs" style="color:var(--text-muted);">{{ unreadCount() }} unread</p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="markAllRead()" class="text-xs font-semibold" style="color:#1C4FC3; background:transparent; border:none; cursor:pointer;">
                Mark all read
              </button>
              <button (click)="showNotifications.set(false)"
                class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                aria-label="Close notifications">
                <ng-icon name="lucideX" [size]="'14'" />
              </button>
            </div>
          </div>

          <!-- Notification list -->
          <div style="max-height:360px; overflow-y:auto;">
            @for (n of notifications(); track n.id) {
              <div class="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                style="border-bottom:1px solid var(--border-subtle);"
                [style.background]="n.read ? 'var(--surface)' : 'var(--surface-accent)'"
              >
                <div class="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                  style="width:32px; height:32px;"
                  [style.background]="n.type === 'alert' ? 'var(--badge-amber-bg)' : n.type === 'success' ? 'var(--badge-green-bg)' : 'var(--badge-purple-bg)'">
                  @if (n.type === 'alert') {
                    <ng-icon name="lucideAlertCircle" [size]="'14'" style="color:var(--badge-amber-text);" />
                  } @else if (n.type === 'success') {
                    <ng-icon name="lucideCheck" [size]="'14'" style="color:var(--badge-green-text);" />
                  } @else {
                    <ng-icon name="lucideBell" [size]="'14'" style="color:var(--badge-purple-text);" />
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold" style="color:var(--text-primary);">{{ n.title }}</p>
                  <p class="text-xs mt-0.5 leading-snug" style="color:var(--text-secondary);">{{ n.body }}</p>
                  <p class="text-xs mt-1" style="color:var(--text-muted);">{{ n.time }}</p>
                </div>
                @if (!n.read) {
                  <div class="flex-shrink-0 rounded-full mt-1.5" style="width:7px; height:7px; background:#1C4FC3;"></div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 text-center" style="border-top:1px solid var(--border-subtle);">
            <button class="text-xs font-semibold" style="color:#1C4FC3; background:transparent; border:none; cursor:pointer;">
              View all notifications
            </button>
          </div>
        </div>
      }


      <!-- ══════════════════════════════════════ -->
      <!-- PROFILE MODAL                        -->
      <!-- ══════════════════════════════════════ -->
      @if (showProfile()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="User profile">
          <div class="modal-backdrop" (click)="showProfile.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:380px; max-width:92vw; box-shadow:0 24px 64px rgba(0,0,0,0.28);">

            <!-- Profile header gradient -->
            <div class="relative" style="background:linear-gradient(135deg,#1F2937 0%,#1D1384 60%,#1D1384 100%); padding:32px 24px 24px; text-align:center;">
              <button
                (click)="showProfile.set(false)"
                class="absolute flex items-center justify-center rounded-lg transition-colors hover:bg-white dark:bg-gray-900/10"
                style="top:16px; right:16px; width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:#93C5FD;"
                aria-label="Close profile"
              >
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
              <div class="flex items-center justify-center rounded-full mx-auto mb-3"
                style="width:72px; height:72px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:22px; font-weight:800; border:3px solid rgba(255,255,255,0.15);">
                MS
              </div>
              <h2 style="color:#fff; font-size:18px; font-weight:700; letter-spacing:-0.02em; margin:0 0 4px;">Mohamed Slimane</h2>
              <p style="color:rgb(229 231 235); font-size:13px; margin:0;">Founder · FoundersLab</p>
              <span class="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                style="background:rgba(108,62,255,0.25); color:#93C5FD;">
                <ng-icon name="lucideStar" [size]="'11'" />
                Premium Plan
              </span>
            </div>

            <!-- Profile body -->
            <div style="padding:20px 24px;">
              <div class="space-y-3">
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideMail" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Email</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">slimane&#64;founderslab.io</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideBriefcase" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Role</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">Founder &amp; Admin</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideGlobe" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Member since</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">January 2026</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 mt-5">
                <button
                  (click)="showProfile.set(false)"
                  class="flex items-center justify-center gap-1.5 rounded-xl flex-1 text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
                  style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:10px;">
                  <ng-icon name="lucideEdit" [size]="'14'" />
                  Edit Profile
                </button>
                <button
                  (click)="showProfile.set(false)"
                  class="flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-gray-800"
                  style="background:#FEF2F2; color:var(--badge-red-text); border:none; padding:10px 16px;">
                  <ng-icon name="lucideLogOut" [size]="'14'" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      }


      <!-- ══════════════════════════════════════ -->
      <!-- SETTINGS MODAL                       -->
      <!-- ══════════════════════════════════════ -->
      @if (showSettings()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Settings">
          <div class="modal-backdrop" (click)="showSettings.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:480px; max-width:92vw; box-shadow:0 24px 64px rgba(0,0,0,0.28);">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <div>
                <h2 class="text-base font-bold" style="color:var(--text-primary);">Settings</h2>
                <p class="text-xs mt-0.5" style="color:var(--text-muted);">Manage your account and preferences</p>
              </div>
              <button (click)="showSettings.set(false)"
                class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                aria-label="Close settings">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>

            <!-- Body -->
            <div style="max-height:70vh; overflow-y:auto; padding:24px;">
              <div class="space-y-6">

                <!-- Appearance -->
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon name="lucideSun" [size]="'15'" style="color:#1C4FC3;" />
                    <h3 class="text-sm font-semibold" style="color:var(--text-primary);">Appearance</h3>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    @for (theme of themes; track theme.label) {
                      <button
                        (click)="themeService.theme.set(theme.id)"
                        class="rounded-xl border-2 p-3 cursor-pointer text-center transition-all"
                        style="background:var(--surface-subtle); font-family:var(--font-sans);"
                        [style.border-color]="themeService.theme() === theme.id ? '#1C4FC3' : 'var(--border)'"
                      >
                        <ng-icon [name]="theme.icon" [size]="'18'" style="display:block; margin:0 auto 4px;"></ng-icon>
                        <p class="text-xs font-medium" [style.color]="themeService.theme() === theme.id ? '#1C4FC3' : 'var(--text-body)'">
                          {{ theme.label }}
                        </p>
                      </button>
                    }
                  </div>
                </div>

                <!-- Notifications -->
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon name="lucideBell" [size]="'15'" style="color:#1C4FC3;" />
                    <h3 class="text-sm font-semibold" style="color:var(--text-primary);">Notifications</h3>
                  </div>
                  <div class="space-y-2">
                    @for (pref of notifPrefs; track pref.label) {
                      <div class="flex items-center justify-between rounded-xl p-3.5" style="background:var(--surface-subtle);">
                        <div>
                          <p class="text-sm font-medium" style="color:var(--text-primary);">{{ pref.label }}</p>
                          <p class="text-xs" style="color:var(--text-muted);">{{ pref.desc }}</p>
                        </div>
                        <button
                          (click)="pref.enabled = !pref.enabled"
                          class="relative rounded-full transition-colors flex-shrink-0"
                          style="width:40px; height:22px; border:none; cursor:pointer;"
                          [style.background]="pref.enabled ? '#1C4FC3' : '#D1D5DB'"
                          [attr.aria-checked]="pref.enabled"
                          role="switch"
                          [attr.aria-label]="pref.label"
                        >
                          <span class="absolute top-0.5 rounded-full transition-transform"
                            style="width:18px; height:18px; background:var(--surface); box-shadow:0 1px 3px rgba(0,0,0,0.2);"
                            [style.transform]="pref.enabled ? 'translateX(20px)' : 'translateX(2px)'">
                          </span>
                        </button>
                      </div>
                    }
                  </div>
                </div>

                <!-- Security -->
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon name="lucideShield" [size]="'15'" style="color:#1C4FC3;" />
                    <h3 class="text-sm font-semibold" style="color:var(--text-primary);">Security</h3>
                  </div>
                  <div class="space-y-2">
                    <button class="flex items-center justify-between w-full rounded-xl p-3.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-left cursor-pointer"
                      style="background:var(--surface-subtle); border:none;">
                      <div>
                        <p class="text-sm font-medium" style="color:var(--text-primary);">Change password</p>
                        <p class="text-xs" style="color:var(--text-muted);">Last changed 30 days ago</p>
                      </div>
                      <ng-icon name="lucideChevronDown" [size]="'14'" style="color:var(--text-muted); transform:rotate(-90deg);" />
                    </button>
                    <button class="flex items-center justify-between w-full rounded-xl p-3.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-left cursor-pointer"
                      style="background:var(--surface-subtle); border:none;">
                      <div>
                        <p class="text-sm font-medium" style="color:var(--text-primary);">Two-factor authentication</p>
                        <p class="text-xs" style="color:var(--text-muted);">Not enabled</p>
                      </div>
                      <span class="text-xs font-semibold px-2 py-0.5 rounded" style="background:var(--badge-amber-bg); color:var(--badge-amber-text);">Recommended</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showSettings.set(false)"
                class="text-sm font-semibold rounded-xl cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">
                Cancel
              </button>
              <button (click)="showSettings.set(false)"
                class="text-sm font-semibold rounded-xl cursor-pointer transition-opacity hover:opacity-90"
                style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">
                Save changes
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class LayoutComponent {
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  protected readonly sidebarExpanded   = signal(false);
  protected readonly showProfile      = signal(false);
  protected readonly showSettings     = signal(false);
  protected readonly showNotifications = signal(false);

  protected readonly themes = [
    { id: 'light' as const, label: 'Light', icon: 'lucideSun' },
    { id: 'dark'  as const, label: 'Dark',  icon: 'lucideMoon' },
    { id: 'system'as const, label: 'System',icon: 'lucideMonitor' },
  ];

  protected readonly notifPrefs = [
    { label: 'New matches',     desc: 'When an investor matches your startup',     enabled: true  },
    { label: 'Session reminders', desc: '1 hour before a mentoring session',        enabled: true  },
    { label: 'Event updates',   desc: 'Changes to events you have registered for', enabled: false },
    { label: 'Community replies', desc: 'When someone replies to your discussion',  enabled: true  },
  ];

  protected readonly notificationsList = signal<Notification[]>([
    { id: 1, title: 'Startup Label renewal',     body: 'Your label expires on Apr 30. Submit renewal documents.',        time: '5 min ago',   read: false, type: 'alert'   },
    { id: 2, title: 'New investor match',         body: 'North Africa Ventures expressed interest in TechFlow.',         time: '1h ago',      read: false, type: 'success' },
    { id: 3, title: 'Session reminder',           body: 'Mentoring session with Sarah Chen in 1 hour.',                  time: '2h ago',      read: false, type: 'info'    },
    { id: 4, title: 'Event registration open',    body: 'Pitch Day Spring 2026 registration is now open.',               time: '4h ago',      read: false, type: 'info'    },
    { id: 5, title: 'Community reply',            body: 'Ahmed Belkacemi replied to your FinTech discussion.',           time: 'Yesterday',   read: true,  type: 'info'    },
    { id: 6, title: 'Investment accepted',        body: 'LogiTrack × Tech Africa Fund deal has been accepted.',          time: 'Mar 20',      read: true,  type: 'success' },
  ]);

  protected readonly notifications = this.notificationsList.asReadonly();

  protected readonly unreadCount = computed(() =>
    this.notificationsList().filter(n => !n.read).length
  );

  protected markAllRead(): void {
    this.notificationsList.update(list => list.map(n => ({ ...n, read: true })));
  }

  protected readonly navItems: NavItem[] = [
    { icon: 'lucideLayoutDashboard', label: 'Dashboard',    route: '/dashboard'    },
    { icon: 'lucideRocket',          label: 'Projects',     route: '/projects'     },
    { icon: 'lucideUsers',           label: 'Community',    route: '/community'    },
    { icon: 'lucideScale',           label: 'Legal',        route: '/legal'        },
    { icon: 'lucideTrendingUp',      label: 'Investments',  route: '/investments'  },
    { icon: 'lucideGraduationCap',   label: 'Mentoring',    route: '/mentoring'    },
    { icon: 'lucideMap',             label: 'Roadmaps',     route: '/roadmaps'     },
    { icon: 'lucideHandshake',       label: 'Partnerships', route: '/partnerships' },
    { icon: 'lucideCalendar',        label: 'Events',       route: '/events'       },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  protected readonly currentPageTitle = computed(() => {
    this.url();
    const segment = this.router.url.split('/')[1]?.split('?')[0] ?? '';
    return this.navItems.find((n) => n.route === '/' + segment)?.label ?? 'FoundersLab';
  });
}
