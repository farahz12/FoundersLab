import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar, lucidePlus, lucideMapPin, lucideUsers, lucideVideo,
  lucideClock, lucideSearch, lucideEdit,
} from '@ng-icons/lucide';

interface Event {
  title: string;
  type: 'Pitch' | 'Workshop' | 'Webinar' | 'Bootcamp' | 'Conference';
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  capacity: number;
  registered: number;
  status: 'Upcoming' | 'Ongoing' | 'Past' | 'Cancelled';
  organizer: string;
  description: string;
  tags: string[];
  coverSeed: string;
}

@Component({
  selector: 'app-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideCalendar, lucidePlus, lucideMapPin, lucideUsers, lucideVideo,
    lucideClock, lucideSearch, lucideEdit,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Events</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Manage webinars, workshops, pitch sessions &amp; more</p>
        </div>
        <button class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90"
          style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
          <ng-icon name="lucidePlus" [size]="'14'" />
          Create Event
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        @for (s of eventStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-xs font-medium mb-1" style="color:var(--text-secondary);">{{ s.label }}</p>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative">
          <ng-icon name="lucideSearch" [size]="'13'"
            style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted);" />
          <input type="search" placeholder="Search events..."
            aria-label="Search events"
            [value]="searchQ()"
            (input)="searchQ.set($any($event.target).value)"
            class="text-xs rounded-lg border focus:outline-none"
            style="padding:6px 12px 6px 28px; background:var(--surface); border-color:var(--border); width:200px; font-family:var(--font-sans);" />
        </div>
        <div class="flex items-center gap-2">
          @for (f of typeFilters; track f) {
            <button (click)="typeFilter.set(f)"
              class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
              [style.background]="typeFilter() === f ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
              [style.color]="typeFilter() === f ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
              [style.border-color]="typeFilter() === f ? 'var(--chip-active-border)' : 'var(--chip-inactive-border)'"
              style="padding:5px 12px;">{{ f }}</button>
          }
        </div>
        <div class="flex items-center gap-2 ml-auto">
          @for (v of ['grid', 'list']; track v) {
            <button (click)="viewMode.set(v)"
              class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
              [style.background]="viewMode() === v ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
              [style.color]="viewMode() === v ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
              [style.border-color]="viewMode() === v ? 'var(--chip-active-border)' : 'var(--chip-inactive-border)'"
              style="padding:5px 12px;">
              {{ v === 'grid' ? '⊞ Grid' : '☰ List' }}
            </button>
          }
        </div>
      </div>

      <!-- Events grid -->
      @if (viewMode() === 'grid') {
        <div class="grid gap-5" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">
          @for (event of filteredEvents(); track event.title) {
            <article class="rounded-2xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
              style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">

              <!-- Cover image -->
              <div class="relative overflow-hidden" style="height:160px;">
                <img
                  [src]="'https://picsum.photos/seed/' + event.coverSeed + '/600/320'"
                  [alt]="event.title"
                  loading="lazy"
                  style="width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease; display:block;"
                  class="group-hover:scale-105"
                />
                <!-- Gradient overlay -->
                <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(11,15,42,0.7) 0%, transparent 60%);"></div>

                <!-- Badges on image -->
                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
                    [style.background]="typeBg(event.type)"
                    [style.color]="typeColor(event.type)">
                    {{ event.type }}
                  </span>
                </div>
                <span class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                  [style.background]="statusBg(event.status)"
                  [style.color]="statusColor(event.status)">
                  {{ event.status }}
                </span>

                <!-- Date on image bottom-left -->
                <div class="absolute bottom-3 left-3">
                  <p class="text-sm font-bold" style="color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.5);">
                    {{ event.date }}
                  </p>
                  <p class="text-xs" style="color:rgba(255,255,255,0.75);">{{ event.time }}</p>
                </div>

                <!-- Online/Location badge on image bottom-right -->
                <div class="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1"
                  style="background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);">
                  @if (event.isOnline) {
                    <ng-icon name="lucideVideo" [size]="'11'" style="color:#fff;" />
                    <span class="text-xs" style="color:#fff;">Online</span>
                  } @else {
                    <ng-icon name="lucideMapPin" [size]="'11'" style="color:#fff;" />
                    <span class="text-xs" style="color:#fff;">{{ event.location }}</span>
                  }
                </div>
              </div>

              <!-- Card content -->
              <div style="padding:16px;">
                <h3 class="text-sm font-bold mb-1 leading-snug" style="color:var(--text-primary);">{{ event.title }}</h3>
                <p class="text-xs leading-relaxed mb-3 line-clamp-2" style="color:var(--text-secondary);">{{ event.description }}</p>

                <!-- Organizer -->
                <p class="text-xs mb-3" style="color:var(--text-muted);">
                  By <span class="font-semibold" style="color:var(--text-secondary);">{{ event.organizer }}</span>
                </p>

                <!-- Capacity -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-1 text-xs" style="color:var(--text-secondary);">
                      <ng-icon name="lucideUsers" [size]="'12'" />
                      {{ event.registered }} / {{ event.capacity }} registered
                    </div>
                    <span class="text-xs font-semibold"
                      [style.color]="(event.registered/event.capacity) > 0.85 ? '#059669' : '#1C4FC3'">
                      {{ Math.round((event.registered/event.capacity)*100) }}%
                    </span>
                  </div>
                  <div style="height:4px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
                    <div style="height:100%; border-radius:99px; transition:width 0.4s;"
                      [style.width.%]="(event.registered/event.capacity)*100"
                      [style.background]="(event.registered/event.capacity) > 0.85 ? 'linear-gradient(90deg,#059669,#34D399)' : 'linear-gradient(90deg,#1C4FC3,#1D1384)'">
                    </div>
                  </div>
                </div>

                <!-- Tags -->
                <div class="flex items-center flex-wrap gap-1.5 mb-3">
                  @for (tag of event.tags; track tag) {
                    <span class="text-xs px-1.5 py-0.5 rounded" style="background:var(--surface-subtle); color:var(--text-secondary); font-weight:500;">{{ tag }}</span>
                  }
                </div>

                <!-- Action -->
                <div class="flex items-center gap-2">
                  @if (event.status === 'Upcoming') {
                    <button class="flex-1 text-xs font-semibold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-90"
                      style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px;">
                      Register Now
                    </button>
                  } @else {
                    <button class="flex-1 text-xs font-semibold rounded-xl cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      style="background:var(--surface-subtle); color:var(--text-secondary); border:none; padding:8px;">
                      View Details
                    </button>
                  }
                  <button class="flex items-center justify-center rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    style="width:34px; height:34px; background:var(--surface-subtle); border:none; cursor:pointer; color:var(--text-muted); flex-shrink:0;"
                    [attr.aria-label]="'Edit ' + event.title">
                    <ng-icon name="lucideEdit" [size]="'14'" />
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <!-- Events list (alternate view) -->
      @if (viewMode() === 'list') {
        <div class="space-y-3">
          @for (event of filteredEvents(); track event.title) {
            <div class="rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-pointer flex"
              style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">

              <!-- Thumbnail -->
              <div class="relative overflow-hidden flex-shrink-0" style="width:120px;">
                <img
                  [src]="'https://picsum.photos/seed/' + event.coverSeed + '/240/160'"
                  [alt]="event.title"
                  loading="lazy"
                  style="width:100%; height:100%; object-fit:cover; display:block;"
                />
                <div class="absolute inset-0" style="background:linear-gradient(to right, transparent 60%, rgba(11,15,42,0.1));"></div>
              </div>

              <!-- Date column -->
              <div class="flex flex-col items-center justify-center flex-shrink-0"
                style="width:72px; background:linear-gradient(135deg,#1F2937,#1D1384); padding:16px 8px;">
                <span class="text-xs font-semibold" style="color:#93C5FD;">{{ event.date.split(' ')[0] }}</span>
                <span class="text-xl font-bold leading-none" style="color:#fff;">{{ event.date.split(' ')[1] }}</span>
                <span class="text-xs" style="color:#93C5FD;">{{ event.date.split(' ')[2] }}</span>
              </div>

              <!-- Content -->
              <div class="flex flex-col justify-center flex-1 px-5 py-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-semibold px-1.5 py-0.5 rounded"
                        [style.background]="typeBg(event.type)" [style.color]="typeColor(event.type)">{{ event.type }}</span>
                      <span class="text-xs font-medium px-1.5 py-0.5 rounded-full"
                        [style.background]="statusBg(event.status)" [style.color]="statusColor(event.status)">{{ event.status }}</span>
                    </div>
                    <h3 class="text-sm font-bold" style="color:var(--text-primary);">{{ event.title }}</h3>
                    <div class="flex items-center gap-3 mt-1 text-xs" style="color:var(--text-muted);">
                      <span class="flex items-center gap-1">
                        <ng-icon name="lucideClock" [size]="'11'" /> {{ event.time }}
                      </span>
                      <span class="flex items-center gap-1">
                        @if (event.isOnline) {
                          <ng-icon name="lucideVideo" [size]="'11'" /> Online
                        } @else {
                          <ng-icon name="lucideMapPin" [size]="'11'" /> {{ event.location }}
                        }
                      </span>
                      <span class="flex items-center gap-1">
                        <ng-icon name="lucideUsers" [size]="'11'" /> {{ event.registered }}/{{ event.capacity }}
                      </span>
                    </div>
                  </div>
                  @if (event.status === 'Upcoming') {
                    <button class="text-xs font-semibold rounded-lg border-none cursor-pointer flex-shrink-0"
                      style="background:var(--badge-purple-bg); color:#1C4FC3; padding:7px 14px;">Register</button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class EventsComponent {
  protected readonly Math = Math;
  protected readonly searchQ   = signal('');
  protected readonly typeFilter = signal('All');
  protected readonly viewMode   = signal('grid');
  protected readonly typeFilters = ['All', 'Pitch', 'Workshop', 'Webinar', 'Bootcamp'];

  protected readonly events: Event[] = [
    { title: 'Pitch Day Spring 2026',            type: 'Pitch',      date: 'Apr 10 2026', time: '14:00 – 18:00', location: 'Algiers Tech Park',     isOnline: false, capacity: 100, registered: 87,  status: 'Upcoming', organizer: 'FoundersLab',      description: 'Quarterly pitch competition where top startups present to a panel of investors and industry experts for live feedback and funding.',           tags: ['Startups', 'Investors', 'Competition'], coverSeed: 'pitchday2026'    },
    { title: 'Fundraising Strategies Workshop',   type: 'Workshop',   date: 'Apr 15 2026', time: '10:00 – 13:00', location: 'Online',                isOnline: true,  capacity: 50,  registered: 42,  status: 'Upcoming', organizer: 'Sarah Chen',       description: 'Hands-on workshop covering term sheets, cap tables, and negotiation tactics for first-time fundraisers raising their first round.',           tags: ['Fundraising', 'Finance', 'Founders'],   coverSeed: 'workshop2026'    },
    { title: 'AI in Startups — Webinar',          type: 'Webinar',    date: 'Apr 20 2026', time: '18:00 – 19:30', location: 'Online',                isOnline: true,  capacity: 200, registered: 134, status: 'Upcoming', organizer: 'Ahmed Belkacemi',  description: 'How to leverage LLMs and AI tools to accelerate product development, automate operations, and build AI-powered startup products.',            tags: ['AI', 'Product', 'Tech'],                coverSeed: 'aiwebinar2026'   },
    { title: 'Product-Market Fit Bootcamp',       type: 'Bootcamp',   date: 'May 2 2026',  time: '09:00 – 17:00', location: 'Oran Innovation Hub',   isOnline: false, capacity: 30,  registered: 18,  status: 'Upcoming', organizer: 'FoundersLab',      description: 'Intensive full-day bootcamp with frameworks and hands-on exercises to help early-stage founders identify and validate product-market fit.',    tags: ['PMF', 'Strategy', 'Early-Stage'],       coverSeed: 'bootcamp2026'    },
    { title: 'MENA Startup Conference 2026',      type: 'Conference', date: 'May 20 2026', time: '09:00 – 18:00', location: 'Casablanca Business Hub', isOnline: false, capacity: 500, registered: 312, status: 'Upcoming', organizer: 'Regional Council', description: 'Annual gathering of 500+ founders, investors, and ecosystem builders from across the MENA region. Keynotes, panels, and networking.',          tags: ['MENA', 'Networking', 'Ecosystem'],      coverSeed: 'conference2026'  },
    { title: 'Legal Compliance for Startups',     type: 'Webinar',    date: 'Mar 25 2026', time: '16:00 – 17:30', location: 'Online',                isOnline: true,  capacity: 100, registered: 98,  status: 'Past',     organizer: 'Marie Leclerc',    description: 'Overview of Algerian startup legal framework, tax obligations, and ANSS startup label application process with Q&A session.',                  tags: ['Legal', 'Compliance', 'ANSS'],          coverSeed: 'legalwebinar'    },
    { title: 'Pitch Prep Workshop',               type: 'Workshop',   date: 'Mar 12 2026', time: '14:00 – 17:00', location: 'Algiers Tech Park',     isOnline: false, capacity: 25,  registered: 25,  status: 'Past',     organizer: 'FoundersLab',      description: 'Mock pitch sessions with feedback from experienced investors and founders. Fully booked. Recording available on request.',                    tags: ['Pitch', 'Practice', 'Investors'],       coverSeed: 'pitchprep'       },
  ];

  protected readonly filteredEvents = computed(() => {
    const q    = this.searchQ().toLowerCase();
    const type = this.typeFilter();
    return this.events.filter(e => {
      const matchQ    = !q || e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
      const matchType = type === 'All' || e.type === type;
      return matchQ && matchType;
    });
  });

  protected readonly eventStats = [
    { label: 'Total Events',    value: this.events.length },
    { label: 'Upcoming',        value: this.events.filter(e => e.status === 'Upcoming').length },
    { label: 'Total Attendees', value: this.events.reduce((s, e) => s + e.registered, 0) },
    { label: 'Avg. Fill Rate',  value: Math.round(this.events.reduce((s, e) => s + (e.registered / e.capacity) * 100, 0) / this.events.length) + '%' },
  ];

  protected typeBg(type: string): string {
    const m: Record<string, string> = { Pitch: 'var(--badge-purple-bg)', Workshop: 'var(--badge-blue-bg)', Webinar: 'var(--badge-green-bg)', Bootcamp: 'var(--badge-amber-bg)', Conference: 'var(--badge-red-bg)' };
    return m[type] ?? 'var(--badge-neutral-bg)';
  }
  protected typeColor(type: string): string {
    const m: Record<string, string> = { Pitch: 'var(--badge-purple-text)', Workshop: 'var(--badge-blue-text)', Webinar: 'var(--badge-green-text)', Bootcamp: 'var(--badge-amber-text)', Conference: 'var(--badge-red-text)' };
    return m[type] ?? 'var(--badge-neutral-text)';
  }
  protected statusBg(status: string): string {
    const m: Record<string, string> = { Upcoming: 'var(--badge-green-bg)', Ongoing: 'var(--badge-blue-bg)', Past: 'var(--badge-neutral-bg)', Cancelled: 'var(--badge-red-bg)' };
    return m[status] ?? 'var(--badge-neutral-bg)';
  }
  protected statusColor(status: string): string {
    const m: Record<string, string> = { Upcoming: 'var(--badge-green-text)', Ongoing: 'var(--badge-blue-text)', Past: 'var(--badge-neutral-text)', Cancelled: 'var(--badge-red-text)' };
    return m[status] ?? 'var(--badge-neutral-text)';
  }
}
