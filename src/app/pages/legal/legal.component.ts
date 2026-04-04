import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideScale, lucideCheckCircle, lucideCircle, lucideAlertCircle,
  lucideFileText, lucideDownload, lucideBell, lucideChevronRight,
  lucidePlus, lucideExternalLink,
} from '@ng-icons/lucide';

interface Step { label: string; done: boolean; alert: boolean; due: string; }
interface Document { name: string; type: string; date: string; size: string; }

@Component({
  selector: 'app-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideScale, lucideCheckCircle, lucideCircle, lucideAlertCircle,
    lucideFileText, lucideDownload, lucideBell, lucideChevronRight,
    lucidePlus, lucideExternalLink,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Legal Support</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Administrative procedures and compliance tracking</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs font-semibold rounded-lg border cursor-pointer"
            style="background:var(--surface); color:var(--text-body); border-color:var(--border); padding:7px 14px;">
            Download All
          </button>
          <button class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer"
            style="background:linear-gradient(135deg,#7C3AED,#3B82F6); color:#fff; padding:8px 16px;">
            <ng-icon name="lucidePlus" [size]="'14'" />
            New Procedure
          </button>
        </div>
      </div>

      <!-- Alert banner -->
      <div class="flex items-center gap-3 rounded-xl border px-5 py-4"
        style="background:#FFFBEB; border-color:#FCD34D;">
        <ng-icon name="lucideAlertCircle" [size]="'18'" style="color:var(--badge-amber-text); flex-shrink:0;" />
        <div class="flex-1">
          <p class="text-sm font-semibold" style="color:var(--badge-amber-text);">Action Required: Startup Label Renewal</p>
          <p class="text-xs mt-0.5" style="color:#B45309;">Your startup label expires on May 15, 2026. Submit renewal documents before April 30, 2026.</p>
        </div>
        <button class="text-xs font-semibold rounded-lg border cursor-pointer flex-shrink-0"
          style="background:var(--surface); color:var(--badge-amber-text); border-color:#FCD34D; padding:5px 12px;">
          Take Action
        </button>
      </div>

      <!-- Two column layout -->
      <div class="grid gap-5" style="grid-template-columns:1fr 1fr;">

        <!-- Checklist -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Company Registration Checklist</h3>
              <span class="text-xs font-semibold" style="color:#7C3AED;">{{ completedCount }}/{{ steps.length }} done</span>
            </div>
            <!-- Progress bar -->
            <div class="mt-3" style="height:6px; background:var(--surface-subtle); border-radius:99px; overflow:hidden;">
              <div style="height:100%; border-radius:99px; background:linear-gradient(90deg,#7C3AED,#3B82F6); transition:width 0.4s;"
                [style.width.%]="(completedCount / steps.length) * 100">
              </div>
            </div>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (step of steps; track step.label) {
              <div class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                @if (step.done) {
                  <ng-icon name="lucideCheckCircle" [size]="'18'" style="color:#059669; flex-shrink:0;" />
                } @else if (step.alert) {
                  <ng-icon name="lucideAlertCircle" [size]="'18'" style="color:var(--badge-amber-text); flex-shrink:0;" />
                } @else {
                  <ng-icon name="lucideCircle" [size]="'18'" style="color:#D1D5DB; flex-shrink:0;" />
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm" [style.color]="step.done ? '#9CA3AF' : '#0B0F2A'"
                    [style.text-decoration]="step.done ? 'line-through' : 'none'">
                    {{ step.label }}
                  </p>
                  <p class="text-xs mt-0.5" [style.color]="step.alert ? '#D97706' : '#9CA3AF'">
                    Due: {{ step.due }}
                  </p>
                </div>
                @if (!step.done) {
                  <ng-icon name="lucideChevronRight" [size]="'14'" style="color:#D1D5DB; flex-shrink:0;" />
                }
              </div>
            }
          </div>
        </div>

        <!-- Document library + Alerts -->
        <div class="flex flex-col gap-4">

          <!-- Document library -->
          <div class="rounded-xl border overflow-hidden flex-1"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Document Library</h3>
              <button class="text-xs font-semibold flex items-center gap-1" style="color:#7C3AED; background:transparent; border:none; cursor:pointer;">
                <ng-icon name="lucidePlus" [size]="'12'" /> Upload
              </button>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (doc of documents; track doc.name) {
                <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div class="flex items-center justify-center rounded-lg flex-shrink-0"
                    style="width:34px; height:34px; background:#EDE9FE;">
                    <ng-icon name="lucideFileText" [size]="'16'" style="color:#7C3AED;" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold truncate" style="color:var(--text-primary);">{{ doc.name }}</p>
                    <p class="text-xs" style="color:var(--text-muted);">{{ doc.type }} · {{ doc.date }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-xs" style="color:var(--text-muted);">{{ doc.size }}</span>
                    <button class="flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      style="width:26px; height:26px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
                      [attr.aria-label]="'Download ' + doc.name">
                      <ng-icon name="lucideDownload" [size]="'13'" />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Regulatory alerts -->
          <div class="rounded-xl border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Regulatory Alerts</h3>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (alert of alerts; track alert.title) {
                <div class="flex items-start gap-3 px-5 py-3">
                  <div class="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                    style="width:24px; height:24px;"
                    [style.background]="alert.urgent ? '#FEF3C7' : '#EDE9FE'">
                    <ng-icon name="lucideBell" [size]="'12'" [style.color]="alert.urgent ? '#D97706' : '#7C3AED'" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold" style="color:var(--text-primary);">{{ alert.title }}</p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted);">{{ alert.date }}</p>
                  </div>
                  <span class="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                    [style.background]="alert.urgent ? '#FEF3C7' : '#EDE9FE'"
                    [style.color]="alert.urgent ? '#92400E' : '#7C3AED'">
                    {{ alert.urgent ? 'Urgent' : 'Info' }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LegalComponent {
  protected readonly steps: Step[] = [
    { label: 'Choose business structure (SARL, SPA...)',       done: true,  alert: false, due: 'Completed'    },
    { label: 'Register trade name with CNRC',                  done: true,  alert: false, due: 'Completed'    },
    { label: 'Obtain NIF (Tax ID)',                            done: true,  alert: false, due: 'Completed'    },
    { label: 'Open corporate bank account',                    done: true,  alert: false, due: 'Completed'    },
    { label: 'Apply for Startup Label (ANSS)',                 done: false, alert: true,  due: 'Apr 30, 2026' },
    { label: 'Register for social security (CNAS)',            done: false, alert: false, due: 'May 15, 2026' },
    { label: 'File initial VAT return',                        done: false, alert: false, due: 'Jun 1, 2026'  },
    { label: 'Obtain import/export license (if applicable)',   done: false, alert: false, due: 'TBD'          },
  ];

  protected readonly documents: Document[] = [
    { name: 'Articles of Association',    type: 'Founding Document', date: 'Jan 12, 2026', size: '2.4 MB' },
    { name: 'CNRC Registration Certificate', type: 'Registration',  date: 'Jan 20, 2026', size: '1.1 MB' },
    { name: 'NIF Certificate',            type: 'Tax',               date: 'Feb 3, 2026',  size: '0.8 MB' },
    { name: 'Startup Label Application',  type: 'Application',       date: 'Mar 15, 2026', size: '3.2 MB' },
    { name: 'Shareholder Agreement',      type: 'Contract',          date: 'Jan 15, 2026', size: '1.8 MB' },
  ];

  protected readonly alerts = [
    { title: 'Startup Label renewal deadline approaching',   date: 'Due: Apr 30, 2026', urgent: true  },
    { title: 'New startup incentives from ANSS published',   date: 'Published: Apr 1, 2026', urgent: false },
    { title: 'Quarterly tax filing reminder',                date: 'Due: Jun 1, 2026',  urgent: false },
  ];

  protected get completedCount(): number {
    return this.steps.filter(s => s.done).length;
  }
}
