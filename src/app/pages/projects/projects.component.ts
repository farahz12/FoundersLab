import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRocket, lucidePlus, lucideSearch, lucideFilter,
  lucideStar, lucideEye, lucideEdit, lucideChevronRight,
  lucideArrowUp, lucideArrowDown, lucideTrendingUp,
} from '@ng-icons/lucide';

interface Startup {
  name: string;
  founder: string;
  sector: string;
  stage: string;
  score: number;
  status: 'Active' | 'Review' | 'Funded' | 'Paused';
  description: string;
  team: number;
  raised: string;
  initials: string;
  color: string;
}

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideRocket, lucidePlus, lucideSearch, lucideFilter,
    lucideStar, lucideEye, lucideEdit, lucideChevronRight,
    lucideArrowUp, lucideArrowDown, lucideTrendingUp,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Startup Projects</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">{{ filtered().length }} projects in the ecosystem</p>
        </div>
        <button
          class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all hover:opacity-90"
          style="background:linear-gradient(135deg,#7C3AED,#3B82F6); color:#fff; padding:8px 16px;"
          aria-label="Add new project"
        >
          <ng-icon name="lucidePlus" [size]="'14'" />
          New Project
        </button>
      </div>

      <!-- Filters bar -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative">
          <ng-icon name="lucideSearch" [size]="'13'" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted);" />
          <input
            type="search"
            placeholder="Search startups..."
            aria-label="Search startups"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            class="text-xs rounded-lg border focus:outline-none"
            style="padding:6px 12px 6px 28px; background:var(--surface); border-color:var(--border); width:220px; font-family:var(--font-sans);"
          />
        </div>

        <div class="flex items-center gap-2">
          @for (f of stageFilters; track f) {
            <button
              (click)="stageFilter.set(f)"
              class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
              [style.background]="stageFilter() === f ? '#EDE9FE' : '#fff'"
              [style.color]="stageFilter() === f ? '#7C3AED' : '#6B7A99'"
              [style.border-color]="stageFilter() === f ? '#DDD6FE' : '#E5E9F5'"
              style="padding:5px 12px;"
            >{{ f }}</button>
          }
        </div>
      </div>

      <!-- Project cards grid -->
      <div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">
        @for (s of filtered(); track s.name) {
          <div class="rounded-xl border transition-all hover:shadow-md cursor-pointer group"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04); padding:20px;">

            <!-- Card header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center rounded-xl flex-shrink-0"
                  [style.background]="s.color + '22'"
                  style="width:40px; height:40px; font-size:13px; font-weight:700;"
                  [style.color]="s.color">
                  {{ s.initials }}
                </div>
                <div>
                  <h3 class="text-sm font-bold leading-tight" style="color:var(--text-primary);">{{ s.name }}</h3>
                  <p class="text-xs" style="color:var(--text-muted);">{{ s.founder }}</p>
                </div>
              </div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                [style.background]="statusBg(s.status)"
                [style.color]="statusColor(s.status)">
                {{ s.status }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-xs leading-relaxed mb-4 line-clamp-2" style="color:var(--text-secondary);">{{ s.description }}</p>

            <!-- Sector + Stage -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--badge-purple-bg); color:#7C3AED; font-weight:500;">{{ s.sector }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--surface-subtle); color:var(--text-body); font-weight:500;">{{ s.stage }}</span>
              <span class="text-xs" style="color:var(--text-muted);">· Team: {{ s.team }}</span>
            </div>

            <!-- AI Score bar -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium" style="color:var(--text-secondary);">AI Score</span>
                <span class="text-xs font-bold" [style.color]="s.score >= 80 ? '#059669' : s.score >= 65 ? '#D97706' : '#DC2626'">
                  {{ s.score }}/100
                </span>
              </div>
              <div style="height:5px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
                <div style="height:100%; border-radius:99px; transition:width 0.6s cubic-bezier(.4,0,.2,1);"
                  [style.width.%]="s.score"
                  [style.background]="s.score >= 80 ? 'linear-gradient(90deg,#059669,#34D399)' : s.score >= 65 ? 'linear-gradient(90deg,#D97706,#FBBF24)' : 'linear-gradient(90deg,#DC2626,#F87171)'">
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between" style="border-top:1px solid var(--border-subtle); padding-top:12px;">
              <span class="text-xs font-semibold" style="color:#059669;">{{ s.raised }}</span>
              <div class="flex items-center gap-2">
                <button class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                  [attr.aria-label]="'View ' + s.name">
                  <ng-icon name="lucideEye" [size]="'14'" />
                </button>
                <button class="flex items-center justify-center rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
                  style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:#7C3AED;"
                  [attr.aria-label]="'Edit ' + s.name">
                  <ng-icon name="lucideEdit" [size]="'14'" />
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProjectsComponent {
  protected readonly searchQuery = signal('');
  protected readonly stageFilter = signal('All');
  protected readonly stageFilters = ['All', 'Pre-seed', 'Seed', 'Series A'];

  protected readonly startups: Startup[] = [
    { name: 'TechFlow',      founder: 'Karim Bensalem',  sector: 'FinTech',      stage: 'Seed',     score: 87, status: 'Active', description: 'AI-powered financial management platform for SMEs, automating invoicing, cash flow forecasting, and compliance reporting.', team: 6,  raised: '$240K raised', initials: 'TF', color: '#7C3AED' },
    { name: 'GreenVenture',  founder: 'Amira Tounsi',    sector: 'CleanTech',    stage: 'Pre-seed', score: 72, status: 'Review', description: 'Decentralized solar energy marketplace connecting producers and consumers across North Africa using blockchain technology.', team: 4,  raised: '$80K raised',  initials: 'GV', color: '#059669' },
    { name: 'MedConnect',    founder: 'Sofia Mansouri',  sector: 'HealthTech',   stage: 'Series A', score: 91, status: 'Funded', description: 'Telemedicine platform bridging rural healthcare access gaps with AI diagnosis assistance and specialist video consultations.', team: 14, raised: '$1.2M raised', initials: 'MC', color: '#3B82F6' },
    { name: 'AgriSmart',     founder: 'Yacine Hamdi',    sector: 'AgriTech',     stage: 'Pre-seed', score: 64, status: 'Review', description: 'IoT sensor network for smart irrigation and crop monitoring, reducing water usage by 40% for smallholder farmers.', team: 3,  raised: '$45K raised',  initials: 'AS', color: '#D97706' },
    { name: 'EduHub',        founder: 'Nadia Cherouk',   sector: 'EdTech',       stage: 'Seed',     score: 78, status: 'Active', description: 'Adaptive learning platform for STEM education in underserved communities, with offline-first mobile experience.', team: 8,  raised: '$190K raised', initials: 'EH', color: '#EC4899' },
    { name: 'LogiTrack',     founder: 'Omar Ladraa',     sector: 'Logistics',    stage: 'Series A', score: 85, status: 'Active', description: 'Last-mile delivery optimization SaaS for e-commerce businesses, reducing delivery costs by 35% through AI routing.', team: 11, raised: '$780K raised', initials: 'LT', color: '#0891B2' },
    { name: 'SecureID',      founder: 'Meriem Bouzid',   sector: 'Cybersecurity',stage: 'Seed',     score: 89, status: 'Active', description: 'Biometric identity verification API for financial institutions, reducing fraud while improving onboarding UX.', team: 7,  raised: '$320K raised', initials: 'SI', color: '#7C3AED' },
    { name: 'AquaMonitor',   founder: 'Riad Ferhat',     sector: 'CleanTech',    stage: 'Pre-seed', score: 68, status: 'Paused', description: 'Real-time water quality monitoring system for municipal water treatment plants using spectroscopy and machine learning.', team: 5,  raised: '$60K raised',  initials: 'AM', color: '#059669' },
  ];

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const stage = this.stageFilter();
    return this.startups.filter(s => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q) || s.founder.toLowerCase().includes(q);
      const matchStage = stage === 'All' || s.stage === stage;
      return matchQ && matchStage;
    });
  });

  protected statusBg(status: string): string {
    const map: Record<string, string> = { Active: '#D1FAE5', Review: '#FEF3C7', Funded: '#DBEAFE', Paused: '#F3F4F6' };
    return map[status] ?? '#F3F4F6';
  }
  protected statusColor(status: string): string {
    const map: Record<string, string> = { Active: '#065F46', Review: '#92400E', Funded: '#1E40AF', Paused: '#6B7A99' };
    return map[status] ?? '#6B7A99';
  }
}
