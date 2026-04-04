import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers, lucideMessageSquare, lucideHeart, lucideEye,
  lucidePlus, lucideArrowRight, lucideStar, lucideBriefcase,
  lucideMapPin, lucideCalendar, lucideThumbsUp,
} from '@ng-icons/lucide';

interface Forum { title: string; category: string; replies: number; views: number; author: string; initials: string; color: string; time: string; }
interface Member { name: string; role: string; company: string; initials: string; color: string; rating: number; }
interface Opportunity { title: string; type: string; company: string; location: string; tag: string; }

@Component({
  selector: 'app-community',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIconComponent],
  providers: [provideIcons({
    lucideUsers, lucideMessageSquare, lucideHeart, lucideEye,
    lucidePlus, lucideArrowRight, lucideStar, lucideBriefcase,
    lucideMapPin, lucideCalendar, lucideThumbsUp,
  })],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold" style="color:var(--text-primary); letter-spacing:-0.02em;">Community &amp; Network</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Connect, share and grow with the ecosystem</p>
        </div>
        <button class="flex items-center gap-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer"
          style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; padding:8px 16px;">
          <ng-icon name="lucidePlus" [size]="'14'" />
          New Discussion
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-4 gap-4">
        @for (s of communityStats; track s.label) {
          <div class="rounded-xl border p-4 text-center"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <p class="text-2xl font-bold" style="color:var(--text-primary); letter-spacing:-0.03em;">{{ s.value }}</p>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary);">{{ s.label }}</p>
          </div>
        }
      </div>

      <!-- Two column layout -->
      <div class="grid gap-5" style="grid-template-columns:1fr 300px;">

        <!-- Forum discussions -->
        <div class="rounded-xl border overflow-hidden"
          style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
            <h3 class="text-sm font-bold" style="color:var(--text-primary);">Forum Discussions</h3>
            <div class="flex items-center gap-2">
              @for (cat of categories; track cat) {
                <button
                  (click)="selectedCategory = cat"
                  class="text-xs font-medium rounded-lg cursor-pointer border transition-colors"
                  [style.background]="selectedCategory === cat ? 'var(--chip-active-bg)' : 'var(--chip-inactive-bg)'"
                  [style.color]="selectedCategory === cat ? 'var(--chip-active-text)' : 'var(--chip-inactive-text)'"
                  [style.border-color]="selectedCategory === cat ? 'var(--chip-active-border)' : 'transparent'"
                  style="padding:3px 10px;">{{ cat }}</button>
              }
            </div>
          </div>
          <div class="divide-y" style="divide-color:var(--border-subtle);">
            @for (f of forums; track f.title) {
              <div class="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div class="flex items-center justify-center rounded-full flex-shrink-0"
                  [style.background]="f.color"
                  style="width:34px; height:34px; color:#fff; font-size:11px; font-weight:700;">
                  {{ f.initials }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-xs font-medium px-1.5 py-0.5 rounded" style="background:var(--badge-purple-bg); color:#1C4FC3;">{{ f.category }}</span>
                    <span class="text-xs" style="color:var(--text-muted);">{{ f.time }}</span>
                  </div>
                  <h4 class="text-sm font-semibold truncate" style="color:var(--text-primary);">{{ f.title }}</h4>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted);">by {{ f.author }}</p>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                  <div class="flex items-center gap-1 text-xs" style="color:var(--text-muted);">
                    <ng-icon name="lucideMessageSquare" [size]="'12'" />
                    {{ f.replies }}
                  </div>
                  <div class="flex items-center gap-1 text-xs" style="color:var(--text-muted);">
                    <ng-icon name="lucideEye" [size]="'12'" />
                    {{ f.views }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right column: Members + Opportunities -->
        <div class="flex flex-col gap-4">

          <!-- Top Members -->
          <div class="rounded-xl border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Top Members</h3>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (m of topMembers; track m.name) {
                <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div class="flex items-center justify-center rounded-full flex-shrink-0"
                    [style.background]="m.color"
                    style="width:34px; height:34px; color:#fff; font-size:11px; font-weight:700;">
                    {{ m.initials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold leading-tight truncate" style="color:var(--text-primary);">{{ m.name }}</p>
                    <p class="text-xs truncate" style="color:var(--text-muted);">{{ m.role }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 flex-shrink-0">
                    <ng-icon name="lucideStar" [size]="'11'" style="color:var(--badge-amber-text);" />
                    <span class="text-xs font-semibold" style="color:var(--badge-amber-text);">{{ m.rating }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Opportunities marketplace -->
          <div class="rounded-xl border"
            style="background:var(--surface); border-color:var(--border); box-shadow:0 1px 4px rgba(11,15,42,0.04);">
            <div class="px-5 py-4" style="border-bottom:1px solid var(--border-subtle);">
              <h3 class="text-sm font-bold" style="color:var(--text-primary);">Opportunities</h3>
            </div>
            <div class="divide-y" style="divide-color:var(--border-subtle);">
              @for (o of opportunities; track o.title) {
                <div class="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-xs font-medium px-1.5 py-0.5 rounded"
                      [style.background]="o.type === 'Job' ? 'var(--badge-blue-bg)' : o.type === 'Internship' ? 'var(--badge-green-bg)' : 'var(--badge-purple-bg)'"
                      [style.color]="o.type === 'Job' ? 'var(--badge-blue-text)' : o.type === 'Internship' ? 'var(--badge-green-text)' : 'var(--badge-purple-text)'">
                      {{ o.type }}
                    </span>
                    <span class="text-xs" style="color:var(--text-muted);">{{ o.tag }}</span>
                  </div>
                  <p class="text-xs font-semibold" style="color:var(--text-primary);">{{ o.title }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs" style="color:var(--text-muted);">{{ o.company }}</span>
                    <span class="text-xs flex items-center gap-0.5" style="color:var(--text-muted);">
                      <ng-icon name="lucideMapPin" [size]="'10'" /> {{ o.location }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CommunityComponent {
  protected selectedCategory = 'All';
  protected readonly categories = ['All', 'FinTech', 'CleanTech', 'EdTech'];

  protected readonly communityStats = [
    { label: 'Members',     value: '1,247' },
    { label: 'Discussions', value: '384'   },
    { label: 'Resources',   value: '156'   },
    { label: 'Events',      value: '28'    },
  ];

  protected readonly forums: Forum[] = [
    { title: 'How to structure your first angel round?',        category: 'FinTech',   replies: 24, views: 312, author: 'Karim B.',   initials: 'KB', color: '#1C4FC3', time: '2h ago'  },
    { title: 'Best practices for solar project permitting in DZ', category: 'CleanTech', replies: 11, views: 178, author: 'Amira T.',   initials: 'AT', color: '#059669', time: '5h ago'  },
    { title: 'Adaptive learning vs. gamification for retention', category: 'EdTech',    replies: 18, views: 240, author: 'Nadia C.',   initials: 'NC', color: '#EC4899', time: '1d ago'  },
    { title: 'Tips for navigating the startup label process',     category: 'All',       replies: 32, views: 445, author: 'Riad F.',    initials: 'RF', color: '#1D1384', time: '2d ago'  },
    { title: 'Cybersecurity fundamentals for non-tech founders', category: 'All',       replies: 9,  views: 130, author: 'Meriem B.',  initials: 'MB', color: '#0891B2', time: '3d ago'  },
  ];

  protected readonly topMembers: Member[] = [
    { name: 'Sarah Chen',        role: 'Investment Advisor', company: 'NA Ventures', initials: 'SC', color: '#1C4FC3', rating: 4.9 },
    { name: 'Ahmed Belkacemi',   role: 'Tech Strategist',    company: 'TechHub DZ',  initials: 'AB', color: '#1D1384', rating: 4.8 },
    { name: 'Marie Leclerc',     role: 'Legal Consultant',   company: 'LexAfrica',   initials: 'ML', color: '#059669', rating: 4.7 },
    { name: 'Omar Ladraa',       role: 'Startup Founder',    company: 'LogiTrack',   initials: 'OL', color: '#D97706', rating: 4.6 },
  ];

  protected readonly opportunities: Opportunity[] = [
    { title: 'Full-Stack Developer',  type: 'Job',        company: 'TechFlow',     location: 'Algiers',    tag: 'Remote OK' },
    { title: 'Product Design Intern', type: 'Internship', company: 'EduHub',       location: 'Tunis',      tag: '3 months'  },
    { title: 'Growth Partnership',    type: 'Partner',    company: 'GreenVenture', location: 'Casablanca', tag: 'CleanTech' },
  ];
}
