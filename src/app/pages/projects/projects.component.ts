import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRocket, lucidePlus, lucideSearch, lucideFilter,
  lucideStar, lucideEye, lucideEdit, lucideChevronRight,
  lucideArrowUp, lucideArrowDown, lucideTrendingUp, lucideX,
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
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    lucideRocket, lucidePlus, lucideSearch, lucideFilter,
    lucideStar, lucideEye, lucideEdit, lucideChevronRight,
    lucideArrowUp, lucideArrowDown, lucideTrendingUp, lucideX,
  })],
  template: `
    <div class="page-shell">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Startup Projects</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">{{ filtered().length }} projects in the ecosystem</p>
        </div>
        <div class="page-header-actions">
          <button
            (click)="showCreateModal.set(true)"
            class="flex w-full items-center justify-center gap-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer transition-all hover:opacity-90 sm:w-auto"
            style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;"
            aria-label="Add new project"
          >
            <ng-icon name="lucidePlus" [size]="'14'" />
            New Project
          </button>
        </div>
      </div>

      <!-- Filters bar -->
      <div class="filter-toolbar">
        <div class="relative filter-toolbar__grow">
          <ng-icon name="lucideSearch" [size]="'13'" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted);" />
          <input
            type="search"
            placeholder="Search startups..."
            aria-label="Search startups"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            class="input-full text-xs rounded-lg border focus:outline-none"
            style="padding:6px 12px 6px 28px; background:var(--surface); border-color:var(--border); font-family:var(--font-sans);"
          />
        </div>

        <div class="chip-scroll">
          @for (f of stageFilters; track f) {
            <button
              (click)="stageFilter.set(f)"
              class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
              [style.background]="stageFilter() === f ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
              [style.color]="stageFilter() === f ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
              [style.border-color]="stageFilter() === f ? 'var(--chip-active-border)' : 'var(--chip-inactive-border)'"
              style="padding:5px 12px;"
            >{{ f }}</button>
          }
        </div>
      </div>

      <!-- Project cards grid -->
      <div class="card-grid-auto">
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
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--badge-purple-bg); color:#1C4FC3; font-weight:500;">{{ s.sector }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--surface-subtle); color:var(--text-body); font-weight:500;">{{ s.stage }}</span>
              <span class="text-xs" style="color:var(--text-muted);">· Team: {{ s.team }}</span>
            </div>

            <!-- AI Score bar -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium" style="color:var(--text-secondary);">AI Score</span>
                <span class="text-xs font-bold" [style.color]="s.score >= 80 ? 'var(--badge-green-text)' : s.score >= 65 ? 'var(--badge-amber-text)' : 'var(--badge-red-text)'">
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
              <span class="text-xs font-semibold" style="color:var(--badge-green-text);">{{ s.raised }}</span>
              <div class="flex items-center gap-2">
                <button (click)="selectedProject.set(s); showViewModal.set(true)" class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                  [attr.aria-label]="'View ' + s.name">
                  <ng-icon name="lucideEye" [size]="'14'" />
                </button>
                <button (click)="selectedProject.set(s); showEditModal.set(true)" class="flex items-center justify-center rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
                  style="width:28px; height:28px; background:transparent; border:none; cursor:pointer; color:#1C4FC3;"
                  [attr.aria-label]="'Edit ' + s.name">
                  <ng-icon name="lucideEdit" [size]="'14'" />
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Create Project Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Create New Project">
          <div class="modal-backdrop" (click)="showCreateModal.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <h2 class="text-base font-bold" style="color:var(--text-primary);">Create New Project</h2>
              <button (click)="showCreateModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1;">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Project Name</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter project name" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Founder</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter founder name" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Sector</label>
                  <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                    <option value="">Select sector</option>
                    <option>FinTech</option>
                    <option>CleanTech</option>
                    <option>HealthTech</option>
                    <option>AgriTech</option>
                    <option>EdTech</option>
                    <option>Logistics</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Stage</label>
                  <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);">
                    <option value="">Select stage</option>
                    <option>Pre-seed</option>
                    <option>Seed</option>
                    <option>Series A</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Description</label>
                  <textarea rows="3" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans); resize:vertical;" placeholder="Describe your project..."></textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Team Size</label>
                  <input type="number" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter team size" />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showCreateModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Cancel</button>
              <button (click)="showCreateModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Create Project</button>
            </div>
          </div>
        </div>
      }

      <!-- View Project Detail Modal -->
      @if (showViewModal() && selectedProject()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="'View ' + selectedProject()!.name">
          <div class="modal-backdrop" (click)="showViewModal.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(580px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <h2 class="text-base font-bold" style="color:var(--text-primary);">Project Details</h2>
              <button (click)="showViewModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1;">
              <div class="flex items-center gap-3 mb-5">
                <div class="flex items-center justify-center rounded-xl flex-shrink-0" [style.background]="selectedProject()!.color + '22'" style="width:48px; height:48px; font-size:15px; font-weight:700;" [style.color]="selectedProject()!.color">
                  {{ selectedProject()!.initials }}
                </div>
                <div>
                  <h3 class="text-sm font-bold" style="color:var(--text-primary);">{{ selectedProject()!.name }}</h3>
                  <p class="text-xs" style="color:var(--text-muted);">{{ selectedProject()!.founder }}</p>
                </div>
                <span class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" [style.background]="statusBg(selectedProject()!.status)" [style.color]="statusColor(selectedProject()!.status)">
                  {{ selectedProject()!.status }}
                </span>
              </div>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">Sector</span>
                    <span class="text-sm font-medium" style="color:var(--text-primary);">{{ selectedProject()!.sector }}</span>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">Stage</span>
                    <span class="text-sm font-medium" style="color:var(--text-primary);">{{ selectedProject()!.stage }}</span>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">Team Size</span>
                    <span class="text-sm font-medium" style="color:var(--text-primary);">{{ selectedProject()!.team }}</span>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">Raised</span>
                    <span class="text-sm font-semibold" style="color:var(--badge-green-text);">{{ selectedProject()!.raised }}</span>
                  </div>
                </div>
                <div>
                  <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">AI Score</span>
                  <div class="flex items-center gap-3">
                    <div style="flex:1; height:6px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
                      <div style="height:100%; border-radius:99px; transition:width 0.6s cubic-bezier(.4,0,.2,1);" [style.width.%]="selectedProject()!.score" [style.background]="selectedProject()!.score >= 80 ? 'linear-gradient(90deg,#059669,#34D399)' : selectedProject()!.score >= 65 ? 'linear-gradient(90deg,#D97706,#FBBF24)' : 'linear-gradient(90deg,#DC2626,#F87171)'"></div>
                    </div>
                    <span class="text-sm font-bold" [style.color]="selectedProject()!.score >= 80 ? 'var(--badge-green-text)' : selectedProject()!.score >= 65 ? 'var(--badge-amber-text)' : 'var(--badge-red-text)'">{{ selectedProject()!.score }}/100</span>
                  </div>
                </div>
                <div>
                  <span class="block text-xs font-semibold mb-1" style="color:var(--text-muted);">Description</span>
                  <p class="text-sm leading-relaxed" style="color:var(--text-secondary);">{{ selectedProject()!.description }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showViewModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Edit Project Modal -->
      @if (showEditModal() && selectedProject()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="'Edit ' + selectedProject()!.name">
          <div class="modal-backdrop" (click)="showEditModal.set(false)"></div>
          <div class="relative rounded-2xl overflow-hidden" style="background:var(--surface); width:min(520px, calc(100vw - 24px)); box-shadow:0 24px 64px rgba(0,0,0,0.28); max-height:85vh; display:flex; flex-direction:column;">
            <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--border-subtle);">
              <h2 class="text-base font-bold" style="color:var(--text-primary);">Edit Project</h2>
              <button (click)="showEditModal.set(false)" class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close">
                <ng-icon name="lucideX" [size]="'16'" />
              </button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1;">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Project Name</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" [value]="selectedProject()!.name" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Founder</label>
                  <input type="text" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" [value]="selectedProject()!.founder" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Sector</label>
                  <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" [value]="selectedProject()!.sector">
                    <option value="">Select sector</option>
                    <option [selected]="selectedProject()!.sector === 'FinTech'">FinTech</option>
                    <option [selected]="selectedProject()!.sector === 'CleanTech'">CleanTech</option>
                    <option [selected]="selectedProject()!.sector === 'HealthTech'">HealthTech</option>
                    <option [selected]="selectedProject()!.sector === 'AgriTech'">AgriTech</option>
                    <option [selected]="selectedProject()!.sector === 'EdTech'">EdTech</option>
                    <option [selected]="selectedProject()!.sector === 'Logistics'">Logistics</option>
                    <option [selected]="selectedProject()!.sector === 'Cybersecurity'">Cybersecurity</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Stage</label>
                  <select class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" [value]="selectedProject()!.stage">
                    <option value="">Select stage</option>
                    <option [selected]="selectedProject()!.stage === 'Pre-seed'">Pre-seed</option>
                    <option [selected]="selectedProject()!.stage === 'Seed'">Seed</option>
                    <option [selected]="selectedProject()!.stage === 'Series A'">Series A</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Description</label>
                  <textarea rows="3" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans); resize:vertical;">{{ selectedProject()!.description }}</textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Team Size</label>
                  <input type="number" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" [value]="selectedProject()!.team" />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4" style="border-top:1px solid var(--border-subtle);">
              <button (click)="showEditModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px;">Cancel</button>
              <button (click)="showEditModal.set(false)" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px;">Save</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class ProjectsComponent {
  protected readonly searchQuery = signal('');
  protected readonly stageFilter = signal('All');
  protected readonly stageFilters = ['All', 'Pre-seed', 'Seed', 'Series A'];

  protected readonly showCreateModal = signal(false);
  protected readonly showViewModal = signal(false);
  protected readonly showEditModal = signal(false);
  protected readonly selectedProject = signal<Startup | null>(null);

  protected readonly startups: Startup[] = [
    { name: 'TechFlow',      founder: 'Karim Bensalem',  sector: 'FinTech',      stage: 'Seed',     score: 87, status: 'Active', description: 'AI-powered financial management platform for SMEs, automating invoicing, cash flow forecasting, and compliance reporting.', team: 6,  raised: '$240K raised', initials: 'TF', color: '#1C4FC3' },
    { name: 'GreenVenture',  founder: 'Amira Tounsi',    sector: 'CleanTech',    stage: 'Pre-seed', score: 72, status: 'Review', description: 'Decentralized solar energy marketplace connecting producers and consumers across North Africa using blockchain technology.', team: 4,  raised: '$80K raised',  initials: 'GV', color: '#059669' },
    { name: 'MedConnect',    founder: 'Sofia Mansouri',  sector: 'HealthTech',   stage: 'Series A', score: 91, status: 'Funded', description: 'Telemedicine platform bridging rural healthcare access gaps with AI diagnosis assistance and specialist video consultations.', team: 14, raised: '$1.2M raised', initials: 'MC', color: '#1D1384' },
    { name: 'AgriSmart',     founder: 'Yacine Hamdi',    sector: 'AgriTech',     stage: 'Pre-seed', score: 64, status: 'Review', description: 'IoT sensor network for smart irrigation and crop monitoring, reducing water usage by 40% for smallholder farmers.', team: 3,  raised: '$45K raised',  initials: 'AS', color: '#D97706' },
    { name: 'EduHub',        founder: 'Nadia Cherouk',   sector: 'EdTech',       stage: 'Seed',     score: 78, status: 'Active', description: 'Adaptive learning platform for STEM education in underserved communities, with offline-first mobile experience.', team: 8,  raised: '$190K raised', initials: 'EH', color: '#EC4899' },
    { name: 'LogiTrack',     founder: 'Omar Ladraa',     sector: 'Logistics',    stage: 'Series A', score: 85, status: 'Active', description: 'Last-mile delivery optimization SaaS for e-commerce businesses, reducing delivery costs by 35% through AI routing.', team: 11, raised: '$780K raised', initials: 'LT', color: '#0891B2' },
    { name: 'SecureID',      founder: 'Meriem Bouzid',   sector: 'Cybersecurity',stage: 'Seed',     score: 89, status: 'Active', description: 'Biometric identity verification API for financial institutions, reducing fraud while improving onboarding UX.', team: 7,  raised: '$320K raised', initials: 'SI', color: '#1C4FC3' },
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
    const map: Record<string, string> = { Active: 'var(--badge-green-bg)', Review: 'var(--badge-amber-bg)', Funded: 'var(--badge-blue-bg)', Paused: 'var(--badge-neutral-bg)' };
    return map[status] ?? 'var(--badge-neutral-bg)';
  }
  protected statusColor(status: string): string {
    const map: Record<string, string> = { Active: 'var(--badge-green-text)', Review: 'var(--badge-amber-text)', Funded: 'var(--badge-blue-text)', Paused: 'var(--badge-neutral-text)' };
    return map[status] ?? 'var(--badge-neutral-text)';
  }
}
