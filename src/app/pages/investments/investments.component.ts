import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp, lucidePlus, lucideFilter, lucideSearch,
  lucideDollarSign, lucideBuilding, lucideCheck, lucideX,
  lucideClock, lucideEye, lucideMessageSquare, lucideStar,
} from '@ng-icons/lucide';

interface InvestorProfile { name: string; type: string; focus: string[]; ticketMin: string; ticketMax: string; initials: string; color: string; matched: number; }
interface Request { startup: string; investor: string; status: 'Pending' | 'Accepted' | 'Declined'; date: string; amount: string; }

@Component({
  selector: 'app-investments',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideTrendingUp, lucidePlus, lucideFilter, lucideSearch,
    lucideDollarSign, lucideBuilding, lucideCheck, lucideX,
    lucideClock, lucideEye, lucideMessageSquare, lucideStar,
  })],
  template: `
    <div class="page-shell">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Investment Management</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Track investor matching and funding opportunities</p>
        </div>
        <div class="page-header-actions">
          <button (click)="showCriteriaModal.set(true)" class="flex w-full items-center justify-center gap-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer sm:w-auto"
            style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
            <ng-icon name="lucidePlus" [size]="'14'" />
            Set Investment Criteria
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid stats-grid--4">
        @for (s of investStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-xs font-medium mb-1" style="color:var(--text-secondary);">{{ s.label }}</p>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Two column -->
      <div class="split-grid split-grid--equal">

        <!-- Investor profiles -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Investor Profiles</h3>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full" style="background:var(--badge-purple-bg); color:#1C4FC3;">
              {{ investors.length }} investors
            </span>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (inv of investors; track inv.name) {
              <div class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-xl flex-shrink-0"
                      [style.background]="inv.color + '22'"
                      [style.color]="inv.color"
                      style="width:38px; height:38px; font-size:11px; font-weight:700;">
                      {{ inv.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ inv.name }}</p>
                      <p class="text-xs" style="color:var(--text-muted);">{{ inv.type }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <ng-icon name="lucideStar" [size]="'12'" style="color:var(--badge-amber-text);" />
                    <span class="text-xs font-semibold" style="color:var(--badge-amber-text);">{{ inv.matched }} matches</span>
                  </div>
                </div>
                <!-- Focus sectors -->
                <div class="flex flex-wrap gap-1.5 mb-2">
                  @for (f of inv.focus; track f) {
                    <span class="text-xs px-1.5 py-0.5 rounded" style="background:var(--surface-subtle); color:var(--text-body); font-weight:500;">{{ f }}</span>
                  }
                </div>
                <!-- Ticket -->
                <div class="flex items-center justify-between">
                  <span class="text-xs" style="color:var(--text-secondary);">Ticket: {{ inv.ticketMin }} – {{ inv.ticketMax }}</span>
                  <button class="text-xs font-semibold rounded-lg"
                    style="background:var(--badge-purple-bg); color:#1C4FC3; border:none; cursor:pointer; padding:4px 10px;">
                    Express Interest
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Interest requests -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Interest Requests</h3>
            <div class="chip-scroll">
              @for (status of statusFilters; track status) {
                <button
                  (click)="statusFilter = status"
                  class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
                  [style.background]="statusFilter === status ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
                  [style.color]="statusFilter === status ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
                  [style.border-color]="statusFilter === status ? 'var(--chip-active-border)' : 'transparent'"
                  style="padding:3px 10px;">{{ status }}</button>
              }
            </div>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (req of requests; track req.startup + req.investor) {
              <div class="flex flex-col gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors sm:flex-row sm:items-center sm:gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-semibold truncate" style="color:var(--text-primary);">{{ req.startup }}</p>
                    <span class="text-xs" style="color:var(--text-muted);">×</span>
                    <p class="text-xs font-medium truncate" style="color:var(--text-secondary);">{{ req.investor }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs" style="color:var(--text-muted);">{{ req.date }}</span>
                    <span class="text-xs font-semibold" style="color:var(--badge-green-text);">{{ req.amount }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 sm:self-center">
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                    [style.background]="req.status === 'Accepted' ? 'var(--badge-green-bg)' : req.status === 'Declined' ? 'var(--badge-red-bg)' : 'var(--badge-amber-bg)'"
                    [style.color]="req.status === 'Accepted' ? 'var(--badge-green-text)' : req.status === 'Declined' ? 'var(--badge-red-text)' : 'var(--badge-amber-text)'">
                    @if (req.status === 'Accepted') {
                      <ng-icon name="lucideCheck" [size]="'10'" />
                    } @else if (req.status === 'Declined') {
                      <ng-icon name="lucideX" [size]="'10'" />
                    } @else {
                      <ng-icon name="lucideClock" [size]="'10'" />
                    }
                    {{ req.status }}
                  </span>
                  <button (click)="selectedRequest.set(req); showRequestModal.set(true)" class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                    aria-label="View request detail">
                    <ng-icon name="lucideEye" [size]="'13'" />
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Set Investment Criteria Modal -->
    @if (showCriteriaModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Set Investment Criteria">
        <div class="modal-backdrop" (click)="showCriteriaModal.set(false)"></div>
        <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
          <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
            <h2 class="text-base font-bold" style="color:var(--text-primary);">Set Investment Criteria</h2>
            <button (click)="showCriteriaModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
              <ng-icon name="lucideX" [size]="'16'" />
            </button>
          </div>
          <div style="padding:24px; overflow-y:auto; flex:1;" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Startup Name</label>
              <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter startup name" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Sector Focus</label>
              <div class="flex flex-wrap gap-2">
                @for (sector of sectorOptions; track sector) {
                  <label class="flex items-center gap-1.5 text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5" style="background:var(--surface-subtle); color:var(--text-body);">
                    <input type="checkbox" class="accent-blue-600" />
                    {{ sector }}
                  </label>
                }
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Min Ticket</label>
                <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="$50K" />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Max Ticket</label>
                <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="$500K" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Preferred Stage</label>
              <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                <option value="">Select stage</option>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Notes</label>
              <textarea class="w-full text-sm rounded-lg border focus:outline-none resize-none" rows="3" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Additional notes..."></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
            <button (click)="showCriteriaModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Cancel</button>
            <button (click)="showCriteriaModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Save</button>
          </div>
        </div>
      </div>
    }

    <!-- View Request Detail Modal -->
    @if (showRequestModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="View Request Detail">
        <div class="modal-backdrop" (click)="showRequestModal.set(false)"></div>
        <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
          <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
            <h2 class="text-base font-bold" style="color:var(--text-primary);">Request Detail</h2>
            <button (click)="showRequestModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
              <ng-icon name="lucideX" [size]="'16'" />
            </button>
          </div>
          <div style="padding:24px; overflow-y:auto; flex:1;" class="flex flex-col gap-3">
            @if (selectedRequest(); as req) {
              <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                <ng-icon name="lucideBuilding" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                <div>
                  <p class="text-xs" style="color:var(--text-muted);">Startup</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary);">{{ req.startup }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                <ng-icon name="lucideStar" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                <div>
                  <p class="text-xs" style="color:var(--text-muted);">Investor</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary);">{{ req.investor }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                <ng-icon name="lucideTrendingUp" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                <div>
                  <p class="text-xs" style="color:var(--text-muted);">Status</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary);">
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                      [style.background]="req.status === 'Accepted' ? 'var(--badge-green-bg)' : req.status === 'Declined' ? 'var(--badge-red-bg)' : 'var(--badge-amber-bg)'"
                      [style.color]="req.status === 'Accepted' ? 'var(--badge-green-text)' : req.status === 'Declined' ? 'var(--badge-red-text)' : 'var(--badge-amber-text)'">
                      {{ req.status }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                <ng-icon name="lucideClock" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                <div>
                  <p class="text-xs" style="color:var(--text-muted);">Date</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary);">{{ req.date }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                <ng-icon name="lucideDollarSign" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                <div>
                  <p class="text-xs" style="color:var(--text-muted);">Amount</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary);">{{ req.amount }}</p>
                </div>
              </div>

              <!-- Timeline -->
              <div class="mt-2">
                <p class="text-xs font-semibold mb-3" style="color:var(--text-secondary);">Request Timeline</p>
                <div class="flex flex-col gap-3 pl-3" style="border-left:2px solid var(--border-subtle);">
                  @for (step of requestTimeline; track step.label) {
                    <div class="flex items-start gap-3 relative">
                      <div class="flex items-center justify-center rounded-full flex-shrink-0" style="width:24px; height:24px; margin-left:-15px;"
                        [style.background]="step.done ? '#1C4FC3' : 'var(--surface-subtle)'"
                        [style.color]="step.done ? '#fff' : 'var(--text-muted)'">
                        <ng-icon name="lucideCheck" [size]="'12'" />
                      </div>
                      <div>
                        <p class="text-sm font-medium" style="color:var(--text-primary);">{{ step.label }}</p>
                        <p class="text-xs" style="color:var(--text-muted);">{{ step.date }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
            <button (click)="showRequestModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Close</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class InvestmentsComponent {
  protected showCriteriaModal = signal(false);
  protected showRequestModal = signal(false);
  protected selectedRequest = signal<Request | null>(null);

  protected readonly sectorOptions = ['FinTech', 'CleanTech', 'HealthTech', 'AgriTech', 'EdTech', 'Logistics', 'Cybersecurity'];
  protected readonly requestTimeline = [
    { label: 'Interest Submitted', date: 'Mar 25, 2026', done: true },
    { label: 'Under Review', date: 'Mar 27, 2026', done: true },
    { label: 'Due Diligence', date: 'Mar 30, 2026', done: true },
    { label: 'Terms Negotiation', date: 'Apr 2, 2026', done: false },
    { label: 'Deal Closed', date: 'Pending', done: false },
  ];

  protected statusFilter = 'All';
  protected readonly statusFilters = ['All', 'Pending', 'Accepted', 'Declined'];

  protected readonly investStats = [
    { label: 'Active Investors',   value: '34'    },
    { label: 'Total Committed',    value: '$4.2M' },
    { label: 'Pending Requests',   value: '12'    },
    { label: 'Deals Closed',       value: '8'     },
  ];

  protected readonly investors: InvestorProfile[] = [
    { name: 'North Africa Ventures', type: 'VC Fund',       focus: ['FinTech', 'HealthTech', 'SaaS'], ticketMin: '$100K', ticketMax: '$500K', initials: 'NAV', color: '#1C4FC3', matched: 6 },
    { name: 'Tech Africa Fund',      type: 'Corporate VC',  focus: ['EdTech', 'AgriTech', 'Logistics'], ticketMin: '$50K', ticketMax: '$300K', initials: 'TAF', color: '#1D1384', matched: 4 },
    { name: 'Green Capital Partners',type: 'Impact Fund',   focus: ['CleanTech', 'AgriTech'], ticketMin: '$200K', ticketMax: '$1M', initials: 'GCP', color: '#059669', matched: 3 },
    { name: 'Atlas Angel Network',   type: 'Angel Network', focus: ['Pre-seed', 'Seed', 'Any sector'], ticketMin: '$20K', ticketMax: '$100K', initials: 'AAN', color: '#D97706', matched: 5 },
  ];

  protected readonly requests: Request[] = [
    { startup: 'MedConnect',   investor: 'North Africa Ventures', status: 'Accepted',  date: 'Apr 2, 2026',  amount: '$400K' },
    { startup: 'TechFlow',     investor: 'Atlas Angel Network',   status: 'Pending',   date: 'Apr 3, 2026',  amount: '$80K'  },
    { startup: 'GreenVenture', investor: 'Green Capital Partners',status: 'Pending',   date: 'Mar 28, 2026', amount: '$250K' },
    { startup: 'LogiTrack',    investor: 'Tech Africa Fund',      status: 'Accepted',  date: 'Mar 20, 2026', amount: '$200K' },
    { startup: 'AgriSmart',    investor: 'Green Capital Partners',status: 'Declined',  date: 'Mar 15, 2026', amount: '$120K' },
    { startup: 'EduHub',       investor: 'Tech Africa Fund',      status: 'Pending',   date: 'Apr 1, 2026',  amount: '$150K' },
    { startup: 'SecureID',     investor: 'North Africa Ventures', status: 'Accepted',  date: 'Feb 28, 2026', amount: '$300K' },
  ];
}
