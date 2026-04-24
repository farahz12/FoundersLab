import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideGraduationCap, lucidePlus, lucideCalendar, lucideClock,
  lucideMessageSquare, lucideCheck, lucideTarget, lucideStar,
  lucideUser, lucideVideo, lucideChevronRight, lucideX,
} from '@ng-icons/lucide';

interface Session { mentor: string; mentee: string; date: string; time: string; topic: string; status: 'Scheduled' | 'Completed' | 'Cancelled'; }
interface MentorRelation { mentor: string; expertise: string; sessions: number; nextSession: string; initials: string; color: string; rating: number; goals: number; goalsCompleted: number; }

@Component({
  selector: 'app-mentoring',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideGraduationCap, lucidePlus, lucideCalendar, lucideClock,
    lucideMessageSquare, lucideCheck, lucideTarget, lucideStar,
    lucideUser, lucideVideo, lucideChevronRight, lucideX,
  })],
  template: `
    <div class="page-shell">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Mentoring Sessions</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Manage your mentoring relationships and sessions</p>
        </div>
        <div class="page-header-actions">
          <button (click)="showScheduleModal.set(true)" class="flex w-full items-center justify-center gap-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer sm:w-auto"
            style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
            <ng-icon name="lucidePlus" [size]="'14'" />
            Schedule Session
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid stats-grid--4">
        @for (s of mentoringStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-xs font-medium mb-1" style="color:var(--text-secondary);">{{ s.label }}</p>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Two column -->
      <div class="split-grid split-grid--equal">

        <!-- My Mentors -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">My Mentors</h3>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (rel of mentorRelations; track rel.mentor) {
              <div (click)="selectedMentor.set(rel); showMentorModal.set(true)" class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
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

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Session History</h3>
            <div class="chip-scroll">
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
              <div class="flex flex-col gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors sm:flex-row sm:items-start sm:gap-4">
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
                <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 sm:self-start"
                  [style.background]="session.status === 'Scheduled' ? 'var(--badge-blue-bg)' : session.status === 'Completed' ? 'var(--badge-green-bg)' : 'var(--badge-red-bg)'"
                  [style.color]="session.status === 'Scheduled' ? 'var(--badge-blue-text)' : session.status === 'Completed' ? 'var(--badge-green-text)' : 'var(--badge-red-text)'">
                  {{ session.status }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Schedule Session Modal -->
      @if (showScheduleModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Schedule Session">
          <div class="modal-backdrop" (click)="showScheduleModal.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <h2 class="text-base font-bold" style="color:var(--text-primary);">Schedule Session</h2>
              <button (click)="showScheduleModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1;">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Mentor</label>
                  <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                    <option value="">Select mentor</option>
                    <option>Sarah Chen</option>
                    <option>Ahmed Belkacemi</option>
                    <option>Marie Leclerc</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Topic</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="What would you like to discuss?" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Date</label>
                    <input type="date" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Time</label>
                    <input type="time" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Notes</label>
                  <textarea rows="3" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans); resize:vertical;" placeholder="Any additional notes..."></textarea>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showScheduleModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Cancel</button>
              <button (click)="showScheduleModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Schedule</button>
            </div>
          </div>
        </div>
      }

      <!-- View Mentor Detail Modal -->
      @if (showMentorModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="'Mentor: ' + (selectedMentor()?.mentor ?? '')">
          <div class="modal-backdrop" (click)="showMentorModal.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <!-- Header with gradient -->
            <div class="relative" style="padding:28px 24px 20px; background:linear-gradient(135deg,#1C4FC3,#1D1384); text-align:center;">
              <button (click)="showMentorModal.set(false)" class="absolute top-4 right-4 flex items-center justify-center rounded-lg" style="width:32px; height:32px; background:rgba(255,255,255,0.15); border:none; cursor:pointer; color:#fff;" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
              <div class="flex items-center justify-center rounded-full mx-auto mb-3" [style.background]="selectedMentor()?.color" style="width:64px; height:64px; color:#fff; font-size:20px; font-weight:800; border:3px solid rgba(255,255,255,0.2);">
                {{ selectedMentor()?.initials }}
              </div>
              <h2 style="color:#fff; font-size:18px; font-weight:700; letter-spacing:-0.02em; margin:0 0 4px;">{{ selectedMentor()?.mentor }}</h2>
              <p style="color:rgba(255,255,255,0.75); font-size:13px; margin:0;">{{ selectedMentor()?.expertise }}</p>
              <div class="flex items-center justify-center gap-1 mt-2">
                <ng-icon name="lucideStar" [size]="'13'" style="color:#FBBF24;" />
                <span style="color:#fff; font-size:14px; font-weight:700;">{{ selectedMentor()?.rating }}</span>
              </div>
            </div>
            <!-- Body -->
            <div style="padding:20px 24px; overflow-y:auto; flex:1;">
              <div class="space-y-3">
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideCalendar" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Sessions</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">{{ selectedMentor()?.sessions }} completed</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideClock" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Next Session</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">{{ selectedMentor()?.nextSession }}</p>
                  </div>
                </div>
                <!-- Goals progress -->
                <div class="rounded-lg p-3" style="background:var(--surface-subtle);">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="lucideTarget" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                    <p class="text-xs font-semibold" style="color:var(--text-secondary);">Goals Progress</p>
                  </div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs" style="color:var(--text-muted);">{{ selectedMentor()?.goalsCompleted }}/{{ selectedMentor()?.goals }} completed</span>
                    <span class="text-xs font-bold" style="color:#1C4FC3;">{{ Math.round(((selectedMentor()?.goalsCompleted ?? 0) / (selectedMentor()?.goals ?? 1)) * 100) }}%</span>
                  </div>
                  <div style="height:6px; background:var(--border); border-radius:99px; overflow:hidden;">
                    <div style="height:100%; border-radius:99px; background:linear-gradient(90deg,#1C4FC3,#1D1384);" [style.width.%]="((selectedMentor()?.goalsCompleted ?? 0) / (selectedMentor()?.goals ?? 1)) * 100"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showMentorModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Close</button>
              <button (click)="showMentorModal.set(false); showScheduleModal.set(true)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Schedule Session</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MentoringComponent {
  protected readonly Math = Math;
  protected readonly showScheduleModal = signal(false);
  protected readonly showMentorModal = signal(false);
  protected readonly selectedMentor = signal<MentorRelation | null>(null);
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
