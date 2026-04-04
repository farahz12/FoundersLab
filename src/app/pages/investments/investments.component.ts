import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideTrendingUp, lucidePlus, lucideFilter, lucideSearch,
    lucideDollarSign, lucideBuilding, lucideCheck, lucideX,
    lucideClock, lucideEye, lucideMessageSquare, lucideStar,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Investment Management</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Track investor matching and funding opportunities</p>
        </div>
        <button class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer"
          style="background:linear-gradient(135deg,#7C3AED,#3B82F6); color:#fff; padding:8px 16px;">
          <ng-icon name="lucidePlus" [size]="'14'" />
          Set Investment Criteria
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        @for (s of investStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-xs font-medium mb-1" style="color:var(--text-secondary);">{{ s.label }}</p>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Two column -->
      <div class="grid gap-5" style="grid-template-columns:1fr 1fr;">

        <!-- Investor profiles -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Investor Profiles</h3>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full" style="background:var(--badge-purple-bg); color:#7C3AED;">
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
                    style="background:var(--badge-purple-bg); color:#7C3AED; border:none; cursor:pointer; padding:4px 10px;">
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
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Interest Requests</h3>
            <div class="flex items-center gap-2">
              @for (status of statusFilters; track status) {
                <button
                  (click)="statusFilter = status"
                  class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
                  [style.background]="statusFilter === status ? '#EDE9FE' : 'transparent'"
                  [style.color]="statusFilter === status ? '#7C3AED' : '#9CA3AF'"
                  [style.border-color]="statusFilter === status ? '#DDD6FE' : 'transparent'"
                  style="padding:3px 10px;">{{ status }}</button>
              }
            </div>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (req of requests; track req.startup + req.investor) {
              <div class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-semibold truncate" style="color:var(--text-primary);">{{ req.startup }}</p>
                    <span class="text-xs" style="color:var(--text-muted);">×</span>
                    <p class="text-xs font-medium truncate" style="color:var(--text-secondary);">{{ req.investor }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs" style="color:var(--text-muted);">{{ req.date }}</span>
                    <span class="text-xs font-semibold" style="color:#059669;">{{ req.amount }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                    [style.background]="req.status === 'Accepted' ? '#D1FAE5' : req.status === 'Declined' ? '#FEE2E2' : '#FEF3C7'"
                    [style.color]="req.status === 'Accepted' ? '#065F46' : req.status === 'Declined' ? '#991B1B' : '#92400E'">
                    @if (req.status === 'Accepted') {
                      <ng-icon name="lucideCheck" [size]="'10'" />
                    } @else if (req.status === 'Declined') {
                      <ng-icon name="lucideX" [size]="'10'" />
                    } @else {
                      <ng-icon name="lucideClock" [size]="'10'" />
                    }
                    {{ req.status }}
                  </span>
                  <button class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);">
                    <ng-icon name="lucideEye" [size]="'13'" />
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InvestmentsComponent {
  protected statusFilter = 'All';
  protected readonly statusFilters = ['All', 'Pending', 'Accepted', 'Declined'];

  protected readonly investStats = [
    { label: 'Active Investors',   value: '34'    },
    { label: 'Total Committed',    value: '$4.2M' },
    { label: 'Pending Requests',   value: '12'    },
    { label: 'Deals Closed',       value: '8'     },
  ];

  protected readonly investors: InvestorProfile[] = [
    { name: 'North Africa Ventures', type: 'VC Fund',       focus: ['FinTech', 'HealthTech', 'SaaS'], ticketMin: '$100K', ticketMax: '$500K', initials: 'NAV', color: '#7C3AED', matched: 6 },
    { name: 'Tech Africa Fund',      type: 'Corporate VC',  focus: ['EdTech', 'AgriTech', 'Logistics'], ticketMin: '$50K', ticketMax: '$300K', initials: 'TAF', color: '#3B82F6', matched: 4 },
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
