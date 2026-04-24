import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRocket, lucideUsers, lucideTrendingUp, lucideCalendar,
  lucideArrowUp, lucideArrowRight, lucideMapPin, lucideVideo,
  lucideActivity, lucideMessageSquare, lucideStar,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { EventService } from '../../services/event.service';
import { EventMapMarker } from '../../models/event';

interface Stat { label: string; value: string; delta: string; up: boolean; icon: string; color: string; bg: string; }
interface Startup { name: string; sector: string; stage: string; score: number; status: string; founder: string; }
interface DashEvent { title: string; type: string; date: string; time: string; attendees: number; icon: string; }
interface Activity { user: string; action: string; time: string; initials: string; color: string; }

@Component({
  selector: 'app-home',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideRocket, lucideUsers, lucideTrendingUp, lucideCalendar,
    lucideArrowUp, lucideArrowRight, lucideMapPin, lucideVideo,
    lucideActivity, lucideMessageSquare, lucideStar,
  })],
  template: `

    <div class="page-shell">
      <!-- Welcome -->
      <div class="page-header">
        <div>
          <h2 class="text-xl font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">
            Welcome back, Farah Zouari 👋
          </h2>
          <p class="text-sm mt-0.5" style="color:var(--text-secondary);">Here's what's happening across your ecosystem today.</p>
        </div>
        <div class="page-header-actions">
          <a routerLink="/app/projects"
            class="flex w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md sm:w-auto"
            style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
            <ng-icon name="lucideRocket" [size]="'14'" />
            New Project
          </a>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid stats-grid--4">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl p-5 border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium" style="color:var(--text-secondary);">{{ stat.label }}</span>
              <div class="flex items-center justify-center rounded-lg"
                style="width:34px; height:34px;"
                [style.background]="stat.bg">
                <ng-icon [name]="stat.icon" [size]="'16'" [style.color]="stat.color" />
              </div>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ stat.value }}</span>
              <span class="text-xs font-medium mb-0.5 flex items-center gap-0.5"
                [style.color]="stat.up ? 'var(--badge-green-text)' : 'var(--badge-red-text)'">
                <ng-icon name="lucideArrowUp" [size]="'11'" [style.transform]="stat.up ? '' : 'rotate(180deg)'" />
                {{ stat.delta }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Two column layout -->
      <div class="split-grid split-grid--dashboard">

        <!-- Startups table -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Recent Startups</h3>
            <a routerLink="/app/projects" class="text-xs font-semibold flex items-center gap-1" style="color:#1C4FC3;">
              View all <ng-icon name="lucideArrowRight" [size]="'12'" />
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr style="background:var(--surface-subtle);">
                  <th class="text-left px-5 py-2.5 text-xs font-semibold" style="color:var(--text-secondary);">Startup</th>
                  <th class="text-left px-3 py-2.5 text-xs font-semibold" style="color:var(--text-secondary);">Sector</th>
                  <th class="text-left px-3 py-2.5 text-xs font-semibold" style="color:var(--text-secondary);">Stage</th>
                  <th class="text-left px-3 py-2.5 text-xs font-semibold" style="color:var(--text-secondary);">AI Score</th>
                  <th class="text-left px-3 py-2.5 text-xs font-semibold" style="color:var(--text-secondary);">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (s of startups; track s.name) {
                  <tr class="border-t transition-colors hover:bg-gray-50 dark:hover:bg-gray-800" style="border-color:var(--border-subtle);">
                    <td class="px-5 py-3">
                      <div>
                        <p class="text-xs font-semibold" style="color:var(--text-primary);">{{ s.name }}</p>
                        <p class="text-xs" style="color:var(--text-muted);">{{ s.founder }}</p>
                      </div>
                    </td>
                    <td class="px-3 py-3">
                      <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--badge-purple-bg); color:var(--badge-purple-text); font-weight:500;">
                        {{ s.sector }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-xs" style="color:var(--text-secondary); font-weight:500;">{{ s.stage }}</td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold" [style.color]="s.score >= 80 ? 'var(--badge-green-text)' : s.score >= 65 ? 'var(--badge-amber-text)' : 'var(--badge-red-text)'">
                          {{ s.score }}
                        </span>
                        <div style="width:40px; height:4px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
                          <div style="height:100%; border-radius:99px; transition:width 0.3s;"
                            [style.width.%]="s.score"
                            [style.background]="s.score >= 80 ? 'var(--badge-green-text)' : s.score >= 65 ? 'var(--badge-amber-text)' : 'var(--badge-red-text)'">
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-3">
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                        [style.background]="s.status === 'Active' ? 'var(--badge-green-bg)' : s.status === 'Review' ? 'var(--badge-amber-bg)' : 'var(--badge-blue-bg)'"
                        [style.color]="s.status === 'Active' ? 'var(--badge-green-text)' : s.status === 'Review' ? 'var(--badge-amber-text)' : 'var(--badge-blue-text)'">
                        {{ s.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right column -->
        <div class="flex flex-col gap-4">

          <!-- Upcoming events -->
          <div class="rounded-xl border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Upcoming Events</h3>
              <a routerLink="/app/events" class="text-xs font-semibold flex items-center gap-1" style="color:#1C4FC3;">
                View all <ng-icon name="lucideArrowRight" [size]="'12'" />
              </a>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (event of upcomingEvents; track event.title) {
                <div class="flex gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div class="flex items-center justify-center rounded-lg flex-shrink-0"
                    style="width:36px; height:36px; background:var(--badge-purple-bg);">
                    <ng-icon [name]="event.icon" [size]="'16'" style="color:var(--badge-purple-text);" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold leading-tight truncate" style="color:var(--text-primary);">{{ event.title }}</p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted);">{{ event.date }} · {{ event.time }}</p>
                    <div class="flex items-center gap-1 mt-0.5">
                      <ng-icon name="lucideUsers" [size]="'10'" style="color:var(--text-muted);" />
                      <span class="text-xs" style="color:var(--text-muted);">{{ event.attendees }} registered</span>
                    </div>
                  </div>
                  <span class="text-xs font-medium px-1.5 py-0.5 rounded self-start flex-shrink-0"
                    style="background:var(--badge-purple-bg); color:var(--badge-purple-text);">{{ event.type }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Community activity -->
          <div class="rounded-xl border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Recent Activity</h3>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (a of activity; track a.time) {
                <div class="flex items-start gap-3 px-5 py-3">
                  <div class="flex items-center justify-center rounded-full flex-shrink-0"
                    [style.background]="a.color"
                    style="width:28px; height:28px; color:#fff; font-size:10px; font-weight:700;">
                    {{ a.initials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs leading-snug" style="color:var(--text-body);">
                      <span class="font-semibold" style="color:var(--text-primary);">{{ a.user }}</span>
                      {{ a.action }}
                    </p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted);">{{ a.time }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Events Map -->
      <div class="rounded-xl border overflow-hidden"
        style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
        <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
          <div>
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Events Map</h3>
            <p class="text-xs mt-0.5" style="color:var(--text-muted);">In-person events across the region</p>
          </div>
          <a routerLink="/app/events" class="text-xs font-semibold flex items-center gap-1" style="color:#1C4FC3;">
            View all <ng-icon name="lucideArrowRight" [size]="'12'" />
          </a>
        </div>
        <div style="height:380px; position:relative;">
          @if (loadingMapMarkers) {
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
              <p class="text-sm" style="color:var(--text-muted);">Loading map…</p>
            </div>
          } @else {
            <app-map [markers]="mapMarkers"></app-map>
          }
        </div>
      </div>

    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected mapMarkers: EventMapMarker[] = [];
  protected loadingMapMarkers = true;

  ngOnInit(): void {
    this.eventService.getEventsForMap().subscribe({
      next: (markers) => {
        this.mapMarkers = markers;
        this.loadingMapMarkers = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingMapMarkers = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected readonly stats: Stat[] = [
    { label: 'Total Startups',       value: '48',  delta: '+3 this month', up: true,  icon: 'lucideRocket',      color: 'var(--badge-purple-text)', bg: 'var(--badge-purple-bg)' },
    { label: 'Active Mentors',        value: '127', delta: '+8 this month', up: true,  icon: 'lucideUsers',       color: 'var(--badge-blue-text)',   bg: 'var(--badge-blue-bg)'   },
    { label: 'Investments Matched',   value: '23',  delta: '+2 this week',  up: true,  icon: 'lucideTrendingUp',  color: 'var(--badge-green-text)',  bg: 'var(--badge-green-bg)'  },
    { label: 'Events This Month',     value: '12',  delta: '-1 vs last',    up: false, icon: 'lucideCalendar',    color: 'var(--badge-amber-text)',  bg: 'var(--badge-amber-bg)'  },
  ];

  protected readonly startups: Startup[] = [
    { name: 'TechFlow',    sector: 'FinTech',      stage: 'Seed',      score: 87, status: 'Active', founder: 'Karim Bensalem'   },
    { name: 'GreenVenture',sector: 'CleanTech',    stage: 'Pre-seed',  score: 72, status: 'Review', founder: 'Amira Tounsi'     },
    { name: 'MedConnect',  sector: 'HealthTech',   stage: 'Series A',  score: 91, status: 'Active', founder: 'Sofia Mansouri'   },
    { name: 'AgriSmart',   sector: 'AgriTech',     stage: 'Pre-seed',  score: 64, status: 'Review', founder: 'Yacine Hamdi'     },
    { name: 'EduHub',      sector: 'EdTech',       stage: 'Seed',      score: 78, status: 'Active', founder: 'Nadia Cherouk'    },
    { name: 'LogiTrack',   sector: 'Logistics',    stage: 'Series A',  score: 85, status: 'Active', founder: 'Omar Ladraa'      },
  ];

  protected readonly upcomingEvents: DashEvent[] = [
    { title: 'Pitch Day Spring 2026',        type: 'Pitch',    date: 'Apr 10', time: '14:00', attendees: 87,  icon: 'lucideRocket'   },
    { title: 'Fundraising Workshop',          type: 'Workshop', date: 'Apr 15', time: '10:00', attendees: 42,  icon: 'lucideActivity' },
    { title: 'AI in Startups Webinar',        type: 'Webinar',  date: 'Apr 20', time: '18:00', attendees: 134, icon: 'lucideVideo'    },
  ];

  protected readonly activity: Activity[] = [
    { user: 'Karim B.',  action: 'submitted a new project update for TechFlow.',   time: '2 min ago',  initials: 'KB', color: '#1C4FC3' },
    { user: 'Sarah C.',  action: 'scheduled a mentoring session with EduHub.',     time: '18 min ago', initials: 'SC', color: '#1D1384' },
    { user: 'Na Ventures',action: 'expressed interest in MedConnect.',             time: '1h ago',     initials: 'NV', color: '#059669' },
    { user: 'Amira T.',  action: 'posted in the CleanTech community forum.',       time: '3h ago',     initials: 'AT', color: '#D97706' },
  ];
}
