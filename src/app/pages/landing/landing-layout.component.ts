import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMenu, lucideX, lucideCalendar, lucideRocket,
  lucideLayoutDashboard, lucideLogOut,
  lucideSun, lucideMoon, lucideUser, lucideSettings, lucideChevronDown,
} from '@ng-icons/lucide';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-landing-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideMenu, lucideX, lucideCalendar, lucideRocket, lucideLayoutDashboard, lucideLogOut,
    lucideSun, lucideMoon, lucideUser, lucideSettings, lucideChevronDown,
  })],
  templateUrl: './landing-layout.component.html',
  styleUrl:    './landing-layout.component.css',
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
  animations: [
    trigger('pillLeft', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(-340px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('600ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('pillCenter', [
      state('hidden',  style({ opacity: 0, transform: 'scale(0.6)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible',
        animate('600ms 40ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('pillRight', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(340px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('600ms var(--ease-spring, cubic-bezier(0.25,0.46,0.45,0.94))')
      ),
    ]),
    trigger('navSettle', [
      transition('* => settled', [
        animate('700ms 620ms cubic-bezier(0.25,0.46,0.45,0.94)',
          keyframes([
            style({ transform: 'translateY(0)',    offset: 0 }),
            style({ transform: 'translateY(-5px)', offset: 0.45 }),
            style({ transform: 'translateY(0)',    offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('badge', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('350ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
    trigger('mobileOverlay', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('280ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class LandingLayoutComponent implements OnInit, OnDestroy {
  private readonly authService  = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  protected readonly mobileMenu   = signal(false);
  protected readonly scrolled     = signal(false);
  protected readonly pillState    = signal<'hidden' | 'visible'>('hidden');
  protected readonly settleState  = signal<'idle' | 'settled'>('idle');
  protected readonly showBadge    = signal(false);
  protected readonly activeLink   = signal('home');
  protected readonly userDropdownOpen = signal(false);

  protected readonly isLoggedIn         = computed(() => this.authService.isLoggedIn());
  protected readonly canAccessDashboard = computed(() =>
    this.authService.hasRole('ADMIN', 'MENTOR', 'PARTNER', 'PARTENAIRE')
  );
  protected readonly userInitial = computed(() => {
    const e = this.authService.getEmail();
    return e ? e[0].toUpperCase() : '?';
  });
  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');
  protected readonly userName = computed(() => {
    const e = this.authService.getEmail();
    return e || 'User';
  });

  private badgeTimer?: ReturnType<typeof setTimeout>;

  protected readonly navLinks = [
    { id: 'home',     label: 'Home',     route: '/',       type: 'route' },
    { id: 'events',   label: 'Events',   route: '/events', type: 'route' },
    { id: 'services', label: 'Services', anchor: 'services', type: 'anchor' },
    { id: 'about',    label: 'About',    anchor: 'about',    type: 'anchor' },
    { id: 'contact',  label: 'Contact',  anchor: 'contact',  type: 'anchor' },
  ];

  ngOnInit(): void {
    setTimeout(() => this.pillState.set('visible'), 60);
    setTimeout(() => this.settleState.set('settled'), 720);
    setTimeout(() => this.showBadge.set(true), 950);
    this.badgeTimer = setTimeout(() => this.showBadge.set(false), 5000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.badgeTimer);
  }

  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 72);
  }

  protected setActive(id: string): void { this.activeLink.set(id); }

  protected scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.setActive(anchor);
    this.mobileMenu.set(false);
  }

  protected dismissBadge(): void { this.showBadge.set(false); }

  protected logout(): void {
    this.authService.logout();
    this.mobileMenu.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.theme.set(this.themeService.theme() === 'dark' ? 'light' : 'dark');
  }

  protected toggleUserDropdown(): void { this.userDropdownOpen.set(!this.userDropdownOpen()); }
  protected closeUserDropdown(): void { this.userDropdownOpen.set(false); }
}