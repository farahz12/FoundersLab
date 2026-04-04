import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideGraduationCap, lucidePlus, lucideCalendar, lucideClock,
  lucideMessageSquare, lucideCheck, lucideTarget, lucideStar,
  lucideUser, lucideVideo, lucideChevronRight,
} from '@ng-icons/lucide';

interface Session { mentor: string; mentee: string; date: string; time: string; topic: string; status: 'Scheduled' | 'Completed' | 'Cancelled'; }
interface MentorRelation { mentor: string; expertise: string; sessions: number; nextSession: string; initials: string; color: string; rating: number; goals: number; goalsCompleted: number; }

@Component({
  selector: 'app-mentoring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideGraduationCap, lucidePlus, lucideCalendar, lucideClock,
    lucideMessageSquare, lucideCheck, lucideTarget, lucideStar,
    lucideUser, lucideVideo, lucideChevronRight,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Mentoring Sessions</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Manage your mentoring relationships and sessions</p>
        </div>
        <button class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer"
          style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
          <ng-icon name="lucidePlus" [size]="'14'" />
          Schedule Session
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        @for (s of mentoringStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-xs font-medium mb-1" style="color:var(--text-secondary);">{{ s.label }}</p>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Two column -->
      <div class="grid gap-5" style="grid-template-columns:1fr 1fr;">

        <!-- My Mentors -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">My Mentors</h3>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (rel of mentorRelations; track rel.mentor) {
              <div class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-full flex-shrink-0"
                      [style.background]="rel.color"
                      style="width:40px; height:40px; color:#fff; font-size:13px; font-weight:700;">
                      {{ rel.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ rel.mentor }}</p>
                      <p class="text-xs" style="color:var(--text-muted);">{{ rel.expertise }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <ng-icon name="lucideStar" [size]="'12'" style="color:var(--badge-amber-text);" />
                    <span class="text-xs font-bold" style="color:var(--badge-amber-text);">{{ rel.rating }}</span>
                  </div>
                </div>

                <!-- Goals progress -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs" style="color:var(--text-secondary);">
                      <ng-icon name="lucideTarget" [size]="'11'" style="display:inline;" />
                      Goals: {{ rel.goalsCompleted }}/{{ rel.goals }}
                    </span>
                    <span class="text-xs font-semibold" style="color:#1C4FC3;">{{ Math.round((rel.goalsCompleted/rel.goals)*100) }}%</span>
                  </div>
                  <div style="height:4px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
                    <div style="height:100%; border-radius:99px; background:linear-gradient(90deg,#1C4FC3,#1D1384);"
                      [style.width.%]="(rel.goalsCompleted/rel.goals)*100">
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1 text-xs" style="color:var(--text-secondary);">
                    <ng-icon name="lucideCalendar" [size]="'11'" />
                    {{ rel.sessions }} sessions · Next: {{ rel.nextSession }}
                  </div>
                  <button class="flex items-center gap-1 text-xs font-semibold"
                    style="color:#1C4FC3; background:transparent; border:none; cursor:pointer;">
                    <ng-icon name="lucideVideo" [size]="'12'" /> Join
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sessions history -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Session History</h3>
            <div class="flex items-center gap-2">
              @for (f of sessionFilters; track f) {
                <button
                  (click)="sessionFilter = f"
                  class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
                  [style.background]="sessionFilter === f ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
                  [style.color]="sessionFilter === f ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
                  [style.border-color]="sessionFilter === f ? 'var(--chip-active-border)' : 'transparent'"
                  style="padding:3px 10px;">{{ f }}</button>
              }
            </div>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (session of sessions; track session.date + session.mentor) {
              <div class="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div class="flex items-center justify-center rounded-lg flex-shrink-0"
                  style="width:38px; height:38px;"
                  [style.background]="session.status === 'Scheduled' ? 'var(--badge-blue-bg)' : session.status === 'Completed' ? 'var(--badge-green-bg)' : 'var(--badge-red-bg)'">
                  @if (session.status === 'Scheduled') {
                    <ng-icon name="lucideCalendar" [size]="'16'" style="color:var(--badge-blue-text);" />
                  } @else if (session.status === 'Completed') {
                    <ng-icon name="lucideCheck" [size]="'16'" style="color:var(--badge-green-text);" />
                  } @else {
                    <ng-icon name="lucideClock" [size]="'16'" style="color:var(--badge-red-text);" />
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ session.topic }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted);">
                    {{ session.mentor }} × {{ session.mentee }}
                  </p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted);">
                    {{ session.date }} · {{ session.time }}
                  </p>
                </div>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  [style.background]="session.status === 'Scheduled' ? 'var(--badge-blue-bg)' : session.status === 'Completed' ? 'var(--badge-green-bg)' : 'var(--badge-red-bg)'"
                  [style.color]="session.status === 'Scheduled' ? 'var(--badge-blue-text)' : session.status === 'Completed' ? 'var(--badge-green-text)' : 'var(--badge-red-text)'">
                  {{ session.status }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MentoringComponent {
  protected readonly Math = Math;
  protected sessionFilter = 'All';
  protected readonly sessionFilters = ['All', 'Scheduled', 'Completed'];

  protected readonly mentoringStats = [
    { label: 'Active Mentors',     value: '3'  },
    { label: 'Total Sessions',     value: '24' },
    { label: 'Goals Completed',    value: '14' },
    { label: 'Avg. Session Score', value: '4.8' },
  ];

  protected readonly mentorRelations: MentorRelation[] = [
    { mentor: 'Sarah Chen',      expertise: 'Investment & Fundraising', sessions: 8,  nextSession: 'Apr 8',  initials: 'SC', color: '#1C4FC3', rating: 4.9, goals: 5, goalsCompleted: 4 },
    { mentor: 'Ahmed Belkacemi', expertise: 'Product Strategy & Tech',  sessions: 10, nextSession: 'Apr 12', initials: 'AB', color: '#1D1384', rating: 4.8, goals: 6, goalsCompleted: 5 },
    { mentor: 'Marie Leclerc',   expertise: 'Legal & Compliance',       sessions: 6,  nextSession: 'Apr 20', initials: 'ML', color: '#059669', rating: 4.7, goals: 4, goalsCompleted: 3 },
  ];

  protected readonly sessions: Session[] = [
    { mentor: 'Sarah Chen',      mentee: 'TechFlow',     date: 'Apr 8, 2026',  time: '14:00', topic: 'Preparing for Series A pitch deck', status: 'Scheduled'  },
    { mentor: 'Ahmed Belkacemi', mentee: 'EduHub',       date: 'Apr 12, 2026', time: '10:00', topic: 'Product roadmap prioritization Q2',  status: 'Scheduled'  },
    { mentor: 'Marie Leclerc',   mentee: 'MedConnect',   date: 'Apr 20, 2026', time: '16:00', topic: 'GDPR compliance for health data',     status: 'Scheduled'  },
    { mentor: 'Sarah Chen',      mentee: 'LogiTrack',    date: 'Mar 28, 2026', time: '14:00', topic: 'Investor relations and KPIs',          status: 'Completed'  },
    { mentor: 'Ahmed Belkacemi', mentee: 'TechFlow',     date: 'Mar 21, 2026', time: '11:00', topic: 'API architecture review session',      status: 'Completed'  },
    { mentor: 'Marie Leclerc',   mentee: 'GreenVenture', date: 'Mar 15, 2026', time: '15:00', topic: 'Environmental permit requirements',    status: 'Completed'  },
    { mentor: 'Sarah Chen',      mentee: 'AgriSmart',    date: 'Mar 10, 2026', time: '09:00', topic: 'Cancelled by mentor',                 status: 'Cancelled'  },
  ];
}
