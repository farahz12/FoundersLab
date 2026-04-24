import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRocket,
  lucideTrendingUp,
  lucideUsers,
  lucideGraduationCap,
  lucideHandshake,
  lucideCalendar,
  lucideShield,
  lucideArrowRight,
  lucideCheck,
  lucideStar,
  lucideGlobe,
  lucideSparkles,
  lucideMapPin,
  lucideClock3,
  lucideChevronRight,
  lucideMail,
  lucidePhone,
  lucideLock,
  lucidePlay,
  lucideX,
} from '@ng-icons/lucide';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
} from '@angular/animations';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Event } from '../../models/event';

@Component({
  selector: 'app-landing',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideRocket, lucideTrendingUp, lucideUsers, lucideGraduationCap,
      lucideHandshake, lucideCalendar, lucideShield,
      lucideArrowRight, lucideCheck, lucideStar, lucideGlobe,
      lucideSparkles, lucideMapPin, lucideClock3, lucideChevronRight,
      lucideMail, lucidePhone, lucideLock, lucidePlay, lucideX,
    }),
  ],
  templateUrl: './landing.component.html',
  styleUrl:    './landing.component.css',
  animations: [
    trigger('heroEntry', [
      transition(':enter', [
        query('.hero-animate', [
          style({ opacity: 0, transform: 'translateY(36px)' }),
          stagger('120ms', [
            animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('featureCards', [
      state('hidden',  style({})),
      state('visible', style({})),
      transition('hidden => visible', [
        query('.rc', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          stagger('70ms', [
            animate('480ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('testimonialCards', [
      state('hidden',  style({})),
      state('visible', style({})),
      transition('hidden => visible', [
        query('.tc', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger('90ms', [
            animate('500ms cubic-bezier(0.25,0.46,0.45,0.94)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('revealLeft', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(-48px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
    trigger('revealRight', [
      state('hidden',  style({ opacity: 0, transform: 'translateX(48px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible',
        animate('700ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
    trigger('reveal', [
      state('hidden',  style({ opacity: 0, transform: 'translateY(32px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible',
        animate('650ms cubic-bezier(0.25,0.46,0.45,0.94)')),
    ]),
  ],
})
export class LandingComponent implements OnInit {
  private readonly cdr          = inject(ChangeDetectorRef);
  private readonly eventService = inject(EventService);
  private readonly authService  = inject(AuthService);

  protected readonly isLoggedIn     = computed(() => this.authService.isLoggedIn());
  protected readonly showVideoModal = signal(false);

  protected loadingEvents  = true;
  protected previewEvents: Event[] = [];

  protected readonly featuresState     = signal<'hidden' | 'visible'>('hidden');
  protected readonly testimonialsState = signal<'hidden' | 'visible'>('hidden');
  protected readonly statsState        = signal<'hidden' | 'visible'>('hidden');
  protected readonly aboutLeftState    = signal<'hidden' | 'visible'>('hidden');
  protected readonly aboutRightState   = signal<'hidden' | 'visible'>('hidden');
  protected readonly eventsState       = signal<'hidden' | 'visible'>('hidden');
  protected readonly ctaState          = signal<'hidden' | 'visible'>('hidden');
  protected readonly contactState      = signal<'hidden' | 'visible'>('hidden');

  protected readonly particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.round(Math.random() * 4 + 2),
    x: Math.round(Math.random() * 100),
    startY: Math.round(Math.random() * 30),
    dur: Math.round(Math.random() * 20 + 14),
    delay: -Math.round(Math.random() * 28),
  }));

  protected readonly stats = [
    { value: 500,  suffix: '+', label: 'Events Hosted' },
    { value: 1200, suffix: '+', label: 'Founders' },
    { value: 200,  suffix: '+', label: 'Mentors & Investors' },
    { value: 30,   suffix: '+', label: 'Cities' },
  ];

  protected readonly features = [
    {
      icon:  'lucideRocket',
      title: 'Startup Directory',
      desc:  'Browse and list your startup in our curated directory of vetted companies across all sectors.',
    },
    {
      icon:  'lucideGraduationCap',
      title: 'Expert Mentorship',
      desc:  'Connect with experienced mentors who\'ve built and scaled companies. Get guidance that moves the needle.',
    },
    {
      icon:  'lucideTrendingUp',
      title: 'Investor Network',
      desc:  'Get discovered by 50+ active angel investors and VCs actively looking for their next portfolio company.',
    },
  ];

  protected readonly trustedBrands = [
    'TechStars', 'Y Combinator Alumni', 'ESPRIT', 'Flat6Labs', 'AfricArena', 'Wamda',
  ];

  protected readonly teaserEvents = [
    { id: 1, title: 'Startup Pitch Night',  date: 'May 15, 2026', location: 'Tunis',  img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=360&fit=crop&q=80' },
    { id: 2, title: 'Founder Workshop',     date: 'Jun 3, 2026',  location: 'Sfax',   img: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&h=360&fit=crop&q=80' },
    { id: 3, title: 'Investor Meetup',      date: 'Jun 20, 2026', location: 'Sousse', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=360&fit=crop&q=80' },
  ];

  protected readonly galleryRow1 = [
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop&q=80',
  ];

  protected readonly galleryRow2 = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=260&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=260&fit=crop&q=80',
  ];

  protected readonly testimonials = [
    {
      text: 'FoundersLab connected me with a mentor who helped me pivot. Six months later, we raised our seed round. The events program alone is worth joining.',
      name: 'Amel Trabelsi', role: 'CEO, NovaTech — $250K seed',
      img:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=520&fit=crop&q=80',
    },
    {
      text: 'The quality of mentors and hands-on workshops are genuinely world-class. Real connections happen on FoundersLab — it\'s the only founder platform I actually use.',
      name: 'Karim Mansour', role: 'Co-founder, GreenRoute',
      img:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=520&fit=crop&q=80',
    },
    {
      text: 'The pitch event I attended led to my first investor meeting. The platform made it incredibly easy to prepare, register, and follow up. Highly recommend!',
      name: 'Lina Benali', role: 'Founder, EdSpark',
      img:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=520&fit=crop&q=80',
    },
  ];

  protected readonly howSteps = [
    { num: '01', title: 'Create Your Profile',    desc: 'Join FoundersLab and showcase your startup or expertise in minutes.' },
    { num: '02', title: 'Discover Opportunities', desc: 'Browse events, connect with mentors, and get matched with investors.' },
    { num: '03', title: 'Attend & Network',        desc: 'Join workshops, pitch competitions, and exclusive founder meetups.' },
    { num: '04', title: 'Grow & Scale',            desc: 'Leverage the community, resources, and feedback to accelerate your journey.' },
  ];

  protected readonly contactInfo = [
    { icon: 'lucideGlobe',    label: 'Location',     value: 'Tunis, Tunisia — serving founders worldwide' },
    { icon: 'lucideMail',     label: 'Email',        value: 'hello@founderslab.io' },
    { icon: 'lucideCalendar', label: 'Office hours', value: 'Mon–Fri, 9:00 AM – 6:00 PM CET' },
    { icon: 'lucideHandshake', label: 'Partnerships', value: 'partners@founderslab.io' },
  ];

  constructor() {
    afterNextRender(() => {
      this.initIntersectionObservers();
      this.initCountUp();
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.loadingEvents = false;
      return;
    }
    this.eventService.getAll({ status: 'PUBLIE' }).subscribe({
      next: (events) => {
        this.previewEvents = events.slice(0, 3);
        this.loadingEvents = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingEvents = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected onImgError(event: globalThis.Event, _id: number): void {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=360&fit=crop&q=80';
  }

  private initIntersectionObservers(): void {
    const sections: Array<{ selector: string; setter: () => void }> = [
      { selector: '.features-section',      setter: () => this.featuresState.set('visible') },
      { selector: '.testimonials-section',  setter: () => this.testimonialsState.set('visible') },
      { selector: '.stats-section',         setter: () => this.statsState.set('visible') },
      { selector: '.how-section',           setter: () => this.aboutLeftState.set('visible') },
      { selector: '.events-teaser-section', setter: () => this.eventsState.set('visible') },
      { selector: '.cta-banner',            setter: () => this.ctaState.set('visible') },
      { selector: '.contact-section',       setter: () => this.contactState.set('visible') },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => entry.target.matches(s.selector));
          if (match) {
            match.setter();
            observer.unobserve(entry.target);
            this.cdr.markForCheck();
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    sections.forEach(({ selector }) => {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    });
  }

  private initCountUp(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el     = entry.target as HTMLElement;
          const target = parseInt(el.dataset['count'] ?? '0', 10);
          let cur      = 0;
          const inc    = Math.ceil(target / 60);
          const tick   = () => {
            cur = Math.min(cur + inc, target);
            el.textContent = cur.toLocaleString();
            if (cur < target) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => observer.observe(c));
  }
}