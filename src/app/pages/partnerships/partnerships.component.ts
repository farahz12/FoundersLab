import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHandshake, lucidePlus, lucideBuilding, lucideUsers,
  lucideCalendar, lucideCheck, lucideEdit, lucideTrash,
  lucideArrowUp, lucideExternalLink, lucideRefreshCw, lucideX,
} from '@ng-icons/lucide';

interface Partner {
  name: string;
  type: string;
  country: string;
  status: 'Active' | 'Pending' | 'Expired';
  since: string;
  expires: string;
  students: number;
  startups: number;
  initials: string;
  color: string;
  benefits: string[];
}

@Component({
  selector: 'app-partnerships',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideHandshake, lucidePlus, lucideBuilding, lucideUsers,
    lucideCalendar, lucideCheck, lucideEdit, lucideTrash,
    lucideArrowUp, lucideExternalLink, lucideRefreshCw, lucideX,
  })],
  template: `
    <div class="page-shell">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Partnerships</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Manage institutional partnerships and conventions</p>
        </div>
        <div class="page-header-actions">
          <button (click)="showAddPartner.set(true)" class="flex w-full items-center justify-center gap-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer sm:w-auto"
            style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
            <ng-icon name="lucidePlus" [size]="'14'" />
            Add Partner
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid stats-grid--4">
        @for (s of partnerStats; track s.label) {
          <div class="rounded-xl border p-4"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium" style="color:var(--text-secondary);">{{ s.label }}</p>
              <div class="flex items-center gap-0.5 text-xs" style="color:var(--badge-green-text);">
                <ng-icon name="lucideArrowUp" [size]="'10'" />
                {{ s.delta }}
              </div>
            </div>
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
          </div>
        }
      </div>

      <!-- Partners grid -->
      <div class="card-grid-auto">
        @for (p of partners; track p.name) {
          <div class="rounded-xl border overflow-hidden"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">

            <!-- Card header -->
            <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center rounded-xl flex-shrink-0"
                    [style.background]="p.color + '22'"
                    [style.color]="p.color"
                    style="width:42px; height:42px; font-size:12px; font-weight:700;">
                    {{ p.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold" style="color:var(--text-primary);">{{ p.name }}</p>
                    <p class="text-xs" style="color:var(--text-muted);">{{ p.type }} · {{ p.country }}</p>
                  </div>
                </div>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  [style.background]="p.status === 'Active' ? 'var(--badge-green-bg)' : p.status === 'Pending' ? 'var(--badge-amber-bg)' : 'var(--badge-red-bg)'"
                  [style.color]="p.status === 'Active' ? 'var(--badge-green-text)' : p.status === 'Pending' ? 'var(--badge-amber-text)' : 'var(--badge-red-text)'">
                  {{ p.status }}
                </span>
              </div>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-2 divide-x" style="divide-color:var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
              <div class="px-5 py-3 text-center">
                <p class="text-lg font-bold" style="color:var(--text-primary);">{{ p.students }}</p>
                <p class="text-xs" style="color:var(--text-muted);">Students</p>
              </div>
              <div class="px-5 py-3 text-center">
                <p class="text-lg font-bold" style="color:var(--text-primary);">{{ p.startups }}</p>
                <p class="text-xs" style="color:var(--text-muted);">Startups</p>
              </div>
            </div>

            <!-- Benefits -->
            <div class="px-5 py-3" style="border-bottom:1px solid var(--border-subtle);">
              <p class="text-xs font-semibold mb-2" style="color:var(--text-secondary);">Benefits</p>
              <div class="flex flex-col gap-1">
                @for (benefit of p.benefits; track benefit) {
                  <div class="flex items-center gap-1.5">
                    <ng-icon name="lucideCheck" [size]="'11'" style="color:var(--badge-green-text); flex-shrink:0;" />
                    <span class="text-xs" style="color:var(--text-body);">{{ benefit }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-xs" style="color:var(--text-muted);">
                Since {{ p.since }} · Expires {{ p.expires }}
              </div>
              <div class="flex items-center gap-1">
                <button class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                  [attr.aria-label]="'Edit partnership with ' + p.name">
                  <ng-icon name="lucideEdit" [size]="'13'" />
                </button>
                @if (p.status !== 'Active') {
                  <button class="flex items-center justify-center rounded-lg hover:bg-green-50 dark:hover:bg-gray-800 transition-colors"
                    style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:var(--badge-green-text);"
                    [attr.aria-label]="'Renew partnership with ' + p.name">
                    <ng-icon name="lucideRefreshCw" [size]="'13'" />
                  </button>
                }
                <button (click)="selectedPartner.set(p); showPartnerDetail.set(true)" class="flex items-center justify-center rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
                  style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:#1C4FC3;"
                  [attr.aria-label]="'View partnership details with ' + p.name">
                  <ng-icon name="lucideExternalLink" [size]="'13'" />
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Add Partner Modal -->
      @if (showAddPartner()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Add Partner">
          <div class="modal-backdrop" (click)="showAddPartner.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <h2 class="text-base font-bold" style="color:var(--text-primary);">Add Partner</h2>
              <button (click)="showAddPartner.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1;">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Organization Name</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter organization name" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Type</label>
                    <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                      <option value="">Select type</option>
                      <option>University</option>
                      <option>Incubator</option>
                      <option>Accelerator</option>
                      <option>NGO</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Country</label>
                    <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Country" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Start Date</label>
                    <input type="date" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Expiry Date</label>
                    <input type="date" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Benefits</label>
                  <textarea rows="3" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans); resize:vertical;" placeholder="One benefit per line..."></textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Contact Email</label>
                  <input type="email" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="contact@organization.com" />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showAddPartner.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Cancel</button>
              <button (click)="showAddPartner.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Add Partner</button>
            </div>
          </div>
        </div>
      }

      <!-- View Partner Detail Modal -->
      @if (showPartnerDetail()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="'Partner: ' + (selectedPartner()?.name ?? '')">
          <div class="modal-backdrop" (click)="showPartnerDetail.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <!-- Header -->
            <div class="relative" style="padding:28px 24px 20px; background:linear-gradient(135deg,#1C4FC3,#1D1384); text-align:center;">
              <button (click)="showPartnerDetail.set(false)" class="absolute top-4 right-4 flex items-center justify-center rounded-lg" style="width:32px; height:32px; background:rgba(255,255,255,0.15); border:none; cursor:pointer; color:#fff;" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
              <div class="flex items-center justify-center rounded-xl mx-auto mb-3" [style.background]="(selectedPartner()?.color ?? '#1C4FC3') + '33'" style="width:56px; height:56px; font-size:16px; font-weight:800; border:2px solid rgba(255,255,255,0.2);" [style.color]="'#fff'">
                {{ selectedPartner()?.initials }}
              </div>
              <h2 style="color:#fff; font-size:18px; font-weight:700; letter-spacing:-0.02em; margin:0 0 4px;">{{ selectedPartner()?.name }}</h2>
              <p style="color:rgba(255,255,255,0.75); font-size:13px; margin:0;">{{ selectedPartner()?.type }} · {{ selectedPartner()?.country }}</p>
              <span class="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full" style="background:rgba(255,255,255,0.2); color:#fff;">{{ selectedPartner()?.status }}</span>
            </div>
            <!-- Body -->
            <div style="padding:20px 24px; overflow-y:auto; flex:1;">
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-lg p-3 text-center" style="background:var(--surface-subtle);">
                    <p class="text-lg font-bold" style="color:var(--text-primary);">{{ selectedPartner()?.students }}</p>
                    <p class="text-xs" style="color:var(--text-muted);">Students</p>
                  </div>
                  <div class="rounded-lg p-3 text-center" style="background:var(--surface-subtle);">
                    <p class="text-lg font-bold" style="color:var(--text-primary);">{{ selectedPartner()?.startups }}</p>
                    <p class="text-xs" style="color:var(--text-muted);">Startups</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-lg p-3" style="background:var(--surface-subtle);">
                  <ng-icon name="lucideCalendar" [size]="'15'" style="color:#1C4FC3; flex-shrink:0;" />
                  <div>
                    <p class="text-xs" style="color:var(--text-muted);">Duration</p>
                    <p class="text-sm font-medium" style="color:var(--text-primary);">Since {{ selectedPartner()?.since }} · Expires {{ selectedPartner()?.expires }}</p>
                  </div>
                </div>
                <div class="rounded-lg p-3" style="background:var(--surface-subtle);">
                  <p class="text-xs font-semibold mb-2" style="color:var(--text-secondary);">Benefits</p>
                  <div class="flex flex-col gap-1.5">
                    @for (benefit of selectedPartner()?.benefits ?? []; track benefit) {
                      <div class="flex items-center gap-1.5">
                        <ng-icon name="lucideCheck" [size]="'11'" style="color:var(--badge-green-text); flex-shrink:0;" />
                        <span class="text-xs" style="color:var(--text-body);">{{ benefit }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showPartnerDetail.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PartnershipsComponent {
  protected readonly showAddPartner = signal(false);
  protected readonly showPartnerDetail = signal(false);
  protected readonly selectedPartner = signal<Partner | null>(null);
  protected readonly partnerStats = [
    { label: 'Active Partners',   value: '12', delta: '+2'   },
    { label: 'Total Students',    value: '847', delta: '+124' },
    { label: 'Linked Startups',   value: '34', delta: '+6'   },
    { label: 'Conventions Active',value: '8',  delta: '+1'   },
  ];

  protected readonly partners: Partner[] = [
    {
      name: 'University of Algiers', type: 'University', country: 'Algeria', status: 'Active',
      since: 'Sep 2024', expires: 'Sep 2026', students: 320, startups: 12,
      initials: 'UA', color: '#1C4FC3',
      benefits: ['Access to innovation lab', 'Startup bootcamp programs', 'Co-mentoring with professors'],
    },
    {
      name: 'ITIC Incubator', type: 'Incubator', country: 'Algeria', status: 'Active',
      since: 'Jan 2025', expires: 'Jan 2027', students: 0, startups: 18,
      initials: 'IT', color: '#1D1384',
      benefits: ['Co-working space access', 'Joint pitch events', 'Shared investor network'],
    },
    {
      name: 'Startup Lab Morocco', type: 'Accelerator', country: 'Morocco', status: 'Active',
      since: 'Mar 2025', expires: 'Mar 2027', students: 85, startups: 9,
      initials: 'MS', color: '#059669',
      benefits: ['Cross-border market access', 'Joint funding rounds', 'Regional network'],
    },
    {
      name: 'Enabel Belgium', type: 'NGO', country: 'Belgium', status: 'Active',
      since: 'Jun 2024', expires: 'Jun 2026', students: 200, startups: 7,
      initials: 'EN', color: '#D97706',
      benefits: ['EU grant access', 'International mentors', 'Tech transfer program'],
    },
    {
      name: 'Tunis Business School', type: 'University', country: 'Tunisia', status: 'Pending',
      since: '—', expires: '—', students: 0, startups: 0,
      initials: 'TB', color: '#0891B2',
      benefits: ['MBA startup track', 'Research collaboration', 'Alumni network'],
    },
    {
      name: 'GreenHub Accelerator', type: 'Accelerator', country: 'Egypt', status: 'Expired',
      since: 'Jan 2024', expires: 'Jan 2025', students: 42, startups: 4,
      initials: 'GH', color: '#9CA3AF',
      benefits: ['CleanTech focus', 'Regional exposure'],
    },
  ];
}
