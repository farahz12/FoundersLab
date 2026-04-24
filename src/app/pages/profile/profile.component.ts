import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucideMail, lucideBriefcase, lucideGlobe, lucideStar,
  lucideUser, lucideKey, lucideShield, lucideCalendar,
  lucideAward, lucideUsers, lucideX, lucideLogOut, lucideEdit,
  lucideCreditCard, lucideTicket, lucideDownload,
} from '@ng-icons/lucide';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Badge } from '../../models/badge';
import { Certificate } from '../../models/certificate';
import { EventRegistration } from '../../models/registration';
import { Ticket } from '../../models/ticket';
import { BadgeService } from '../../services/badge.service';
import { CertificateService } from '../../services/certificate.service';
import { RegistrationService } from '../../services/registration.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Role, User } from '../../core/models/user.model';

type ProfileTab = 'account' | 'security' | 'tickets' | 'badges' | 'certificates' | 'team';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideMail, lucideBriefcase, lucideGlobe, lucideStar,
      lucideUser, lucideKey, lucideShield, lucideCalendar,
      lucideAward, lucideUsers, lucideX, lucideLogOut, lucideEdit,
      lucideCreditCard, lucideTicket, lucideDownload,
    }),
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Profile">
      <div class="modal-backdrop" (click)="closeProfile()"></div>
      <div class="relative rounded-2xl overflow-hidden flex"
        style="background:var(--surface); width:min(800px,calc(100vw - 24px)); height:min(620px,calc(100vh - 48px)); box-shadow:0 24px 64px rgba(0,0,0,0.28);"
        (click)="$event.stopPropagation()">

        <!-- ═══ SIDEBAR ═══ -->
        <div class="flex flex-col" style="width:220px; flex-shrink:0; background:var(--surface-subtle); border-right:1px solid var(--border-subtle);">
          <div style="background:linear-gradient(135deg,#1F2937 0%,#1D1384 100%); padding:24px 16px 20px; text-align:center;">
            <div class="flex items-center justify-center rounded-full mx-auto mb-2"
              style="width:56px; height:56px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:18px; font-weight:800; border:2px solid rgba(255,255,255,0.15);">
              {{ initials }}
            </div>
            <p class="text-xs font-bold" style="color:#fff; margin:0;">{{ fullName || 'FoundersLab User' }}</p>
            <p class="text-[11px] mt-0.5" style="color:rgba(255,255,255,0.7); margin:0;">{{ authService.getEmail() || user?.email || '' }}</p>
            <span class="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style="background:rgba(108,62,255,0.25); color:#93C5FD;">
              <ng-icon name="lucideStar" [size]="'10'" />
              {{ displayRole(user?.role || authService.getRole()) }}
            </span>
          </div>

          <nav class="flex-1 flex flex-col gap-0.5" style="padding:12px 8px;" aria-label="Profile sections">
            @for (tab of visibleTabs; track tab.id) {
              <button type="button" (click)="activeTab = tab.id"
                class="flex items-center gap-2.5 w-full rounded-lg text-left cursor-pointer transition-colors"
                style="padding:8px 10px; border:none; font-family:var(--font-sans);"
                [style.background]="activeTab === tab.id ? 'var(--chip-active-bg)' : 'transparent'"
                [style.color]="activeTab === tab.id ? '#1C4FC3' : 'var(--text-secondary)'"
                [attr.aria-current]="activeTab === tab.id ? 'page' : null">
                <ng-icon [name]="tab.icon" [size]="'15'" />
                <span class="text-xs font-medium">{{ tab.label }}</span>
              </button>
            }
          </nav>

          <div style="padding:12px 16px; border-top:1px solid var(--border-subtle);">
            <button (click)="closeProfile()"
              class="flex items-center gap-2 w-full rounded-lg text-left cursor-pointer transition-colors"
              style="padding:8px 10px; border:none; background:transparent; color:var(--text-muted); font-family:var(--font-sans);">
              <ng-icon name="lucideX" [size]="'14'" />
              <span class="text-xs font-medium">Close</span>
            </button>
          </div>
        </div>

        <!-- ═══ CONTENT ═══ -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between" style="padding:20px 24px 16px; flex-shrink:0;">
            <h3 class="text-base font-bold" style="color:var(--text-primary);">{{ activeTabLabel }}</h3>
            <button (click)="closeProfile()"
              class="flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style="width:32px; height:32px; background:transparent; border:none; cursor:pointer; color:var(--text-muted);"
              aria-label="Close profile">
              <ng-icon name="lucideX" [size]="'16'" />
            </button>
          </div>

          @if (successMessage) {
            <div class="mx-6 mb-3 rounded-xl border px-4 py-2.5 text-xs" style="background:var(--badge-green-bg); border-color:transparent; color:var(--badge-green-text);" role="alert">
              {{ successMessage }}
            </div>
          }
          @if (errorMessage) {
            <div class="mx-6 mb-3 rounded-xl border px-4 py-2.5 text-xs" style="background:var(--badge-red-bg); border-color:transparent; color:var(--badge-red-text);" role="alert">
              {{ errorMessage }}
            </div>
          }

          <div class="flex-1 overflow-y-auto" style="padding:0 24px 24px;">

            @if (activeTab === 'account') {
              <div class="space-y-6">
                <div class="flex items-center gap-5">
                  <div class="flex items-center justify-center rounded-full"
                    style="width:72px; height:72px; background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; font-size:22px; font-weight:800;">
                    {{ initials }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ fullName || 'FoundersLab User' }}</p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted);">{{ displayRole(user?.role || authService.getRole()) }}</p>
                    <button type="button" (click)="toggleProfileEdit()"
                      class="mt-2 text-xs font-semibold rounded-lg cursor-pointer"
                      style="background:var(--surface-subtle); border:1px solid var(--border); color:var(--text-body); padding:5px 12px; font-family:var(--font-sans);">
                      {{ isEditingProfile ? 'Cancel editing' : 'Edit profile' }}
                    </button>
                  </div>
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">First Name</label>
                      <input formControlName="name" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Last Name</label>
                      <input formControlName="prenom" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Email</label>
                    <input formControlName="email" type="email" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Status</label>
                      <input formControlName="statut" type="text" [readOnly]="!isEditingProfile" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Role</label>
                      <input [value]="displayRole(user?.role || authService.getRole())" type="text" readOnly class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface-input); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" />
                    </div>
                  </div>
                  @if (isEditingProfile) {
                    <div class="flex items-center justify-end gap-3" style="padding-top:8px; border-top:1px solid var(--border-subtle);">
                      <button type="button" (click)="toggleProfileEdit()" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:transparent; border:1.5px solid var(--border); color:var(--text-body); padding:8px 20px; font-family:var(--font-sans);">Cancel</button>
                      <button type="submit" [disabled]="profileForm.invalid || savingProfile" class="text-sm font-semibold rounded-xl cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:8px 20px; font-family:var(--font-sans);">
                        {{ savingProfile ? 'Saving...' : 'Save Profile' }}
                      </button>
                    </div>
                  }
                </form>
              </div>
            }

            @if (activeTab === 'security') {
              <div class="space-y-4">
                <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon name="lucideKey" [size]="'15'" style="color:#1C4FC3;" />
                    <h4 class="text-sm font-semibold" style="color:var(--text-primary);">Change Password</h4>
                  </div>
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-3">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Current Password</label>
                      <input formControlName="oldPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter current password" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">New Password</label>
                      <input formControlName="newPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter new password" />
                    </div>
                    <button type="submit" [disabled]="passwordForm.invalid || changingPassword" class="text-xs font-semibold rounded-lg cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:7px 16px; font-family:var(--font-sans);">
                      {{ changingPassword ? 'Updating...' : 'Update Password' }}
                    </button>
                  </form>
                </div>

                <div class="rounded-xl p-4" style="background:var(--surface-subtle);">
                  <div class="flex items-center gap-2 mb-1">
                    <ng-icon name="lucideShield" [size]="'15'" style="color:#1C4FC3;" />
                    <h4 class="text-sm font-semibold" style="color:var(--text-primary);">Set Password Directly</h4>
                  </div>
                  <p class="text-xs mb-3" style="color:var(--text-muted);">Set a new password without entering the current one.</p>
                  <form [formGroup]="setPasswordForm" (ngSubmit)="setPassword()" class="space-y-3">
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">New Password</label>
                      <input formControlName="password" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-secondary);">Confirm Password</label>
                      <input formControlName="confirmPassword" type="password" class="w-full text-sm rounded-lg border focus:outline-none" style="padding:8px 12px; background:var(--surface); border-color:var(--border); color:var(--text-primary); font-family:var(--font-sans);" placeholder="Confirm new password" />
                    </div>
                    @if (setPasswordForm.hasError('passwordMismatch') && setPasswordForm.touched) {
                      <p class="text-xs" style="color:var(--badge-red-text);">Passwords do not match.</p>
                    }
                    <button type="submit" [disabled]="setPasswordForm.invalid || settingPassword" class="text-xs font-semibold rounded-lg cursor-pointer" style="background:linear-gradient(135deg,#1C4FC3,#1D1384); color:#fff; border:none; padding:7px 16px; font-family:var(--font-sans);">
                      {{ settingPassword ? 'Saving...' : 'Set Password' }}
                    </button>
                  </form>
                </div>
              </div>
            }

            @if (activeTab === 'tickets') {
            <section class="rounded-2xl border p-5" style="background:var(--surface); border-color:var(--border);">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 class="text-base font-semibold" style="color:var(--text-primary);">My Tickets</h3>
                  <p class="text-xs mt-1" style="color:var(--text-secondary);">Registration status, payment, and PDF download are handled here.</p>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-semibold" style="background:var(--badge-purple-bg); color:var(--badge-purple-text);">
                  {{ registrations.length }} registration{{ registrations.length === 1 ? '' : 's' }}
                </span>
              </div>

              @if (loadingTickets) {
                <p class="mt-5 text-sm" style="color:var(--text-secondary);">Loading your registrations and tickets...</p>
              } @else if (!registrations.length) {
                <div class="empty-card mt-5">
                  <p class="text-sm font-semibold" style="color:var(--text-primary);">No registrations yet</p>
                  <p class="text-xs mt-1" style="color:var(--text-secondary);">Register for an event from the Events workspace to populate tickets here.</p>
                </div>
              } @else {
                <div class="mt-5 ticket-list">
                  @for (registration of registrations; track registration.id) {
                    <article class="ticket-card">
                      <div class="ticket-card__head">
                        <div>
                          <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ registration.eventTitle }}</p>
                          <p class="text-xs mt-1" style="color:var(--text-secondary);">Registered on {{ formatDate(registration.registeredAt) }}</p>
                        </div>
                        <span class="ticket-status" [style.background]="registrationStatusTone(registration.status).bg" [style.color]="registrationStatusTone(registration.status).fg">
                          {{ registration.status }}
                        </span>
                      </div>

                      @if (ticketByEventId[registration.eventId]; as ticket) {
                        <div class="ticket-meta-grid">
                          <div>
                            <span>Ticket number</span>
                            <strong>{{ ticket.ticketNumber }}</strong>
                          </div>
                          <div>
                            <span>Payment</span>
                            <strong>{{ ticket.paymentStatus }}</strong>
                          </div>
                          <div>
                            <span>Format</span>
                            <strong>{{ ticket.locationType }}</strong>
                          </div>
                          <div>
                            <span>Event date</span>
                            <strong>{{ formatDate(ticket.eventDate) }}</strong>
                          </div>
                        </div>

                        <div class="ticket-actions-row">
                          @if (ticket.paymentStatus === 'PENDING') {
                            <button type="button" class="btn-primary-inline" (click)="payTicket(ticket)" [disabled]="processingTicketEventId === ticket.eventId">
                              {{ processingTicketEventId === ticket.eventId ? 'Processing...' : 'Pay now' }}
                            </button>
                          }
                          <button type="button" class="btn-secondary-inline" (click)="downloadTicket(ticket)" [disabled]="processingTicketEventId === ticket.eventId">
                            Download PDF
                          </button>
                          @if (registration.status === 'INSCRIT' || registration.status === 'LISTE_ATTENTE') {
                            <button type="button" class="btn-danger-inline" (click)="cancelRegistration(registration)" [disabled]="processingTicketEventId === registration.eventId">
                              Cancel registration
                            </button>
                          }
                        </div>
                      } @else {
                        <p class="mt-4 text-xs" style="color:var(--text-secondary);">
                          Ticket details are not available for this registration yet.
                        </p>
                      }
                    </article>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab === 'badges') {
            <section class="rounded-2xl border p-5" style="background:var(--surface); border-color:var(--border);">
              <div>
                <h3 class="text-base font-semibold" style="color:var(--text-primary);">Badges</h3>
                <p class="text-xs mt-1" style="color:var(--text-secondary);">The complete badge collection from PIcloud is now available inside profile.</p>
              </div>

              @if (loadingBadges) {
                <p class="mt-5 text-sm" style="color:var(--text-secondary);">Loading badges...</p>
              } @else if (!badges.length) {
                <div class="empty-card mt-5">
                  <p class="text-sm font-semibold" style="color:var(--text-primary);">No badges yet</p>
                  <p class="text-xs mt-1" style="color:var(--text-secondary);">Attend and check in to events to unlock badge rewards.</p>
                </div>
              } @else {
                <div class="mt-5 badge-grid">
                  @for (badge of badges; track badge.id) {
                    <div class="badge-card-local">
                      @if (badge.hasImage && badgeImageUrls[badge.id]) {
                        <img
                          [src]="badgeImageUrls[badge.id]"
                          [alt]="badge.label"
                          class="badge-card-local__icon"
                          style="width:96px; height:96px; object-fit:contain; background:transparent; border-radius:12px;" />
                      } @else {
                        <div class="badge-card-local__icon"
                             [style.background]="badgeTone(badge.type).bg"
                             style="width:96px; height:96px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:36px;">
                          {{ badgeTone(badge.type).icon }}
                        </div>
                      }
                      <div>
                        <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ badge.label }}</p>
                        <p class="text-xs mt-1" style="color:var(--text-secondary);">{{ badge.type }}</p>
                        @if (badge.eventTitle) {
                          <p class="text-xs mt-1" style="color:var(--text-secondary);">{{ badge.eventTitle }}</p>
                        }
                        <p class="text-xs mt-2" style="color:var(--text-muted);">Earned {{ formatDate(badge.earnedAt) }}</p>
                        @if (badge.seriesTag) {
                          <p class="text-xs mt-1" style="color:var(--text-muted);">Series: {{ badge.seriesTag }}</p>
                        }
                        @if (badge.hasImage) {
                          <button type="button"
                            class="btn-secondary-inline mt-3"
                            (click)="downloadBadge(badge)">
                            <ng-icon name="lucideDownload" [size]="'14'" /> Download
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab === 'certificates') {
            <section class="rounded-2xl border p-5" style="background:var(--surface); border-color:var(--border);">
              <div>
                <h3 class="text-base font-semibold" style="color:var(--text-primary);">Certificates</h3>
                <p class="text-xs mt-1" style="color:var(--text-secondary);">Download or copy verification links without leaving the dashboard.</p>
              </div>

              @if (loadingCertificates) {
                <p class="mt-5 text-sm" style="color:var(--text-secondary);">Loading certificates...</p>
              } @else if (!certificates.length) {
                <div class="empty-card mt-5">
                  <p class="text-sm font-semibold" style="color:var(--text-primary);">No certificates yet</p>
                  <p class="text-xs mt-1" style="color:var(--text-secondary);">Certificates appear here after eligible event completion.</p>
                </div>
              } @else {
                <div class="mt-5 certificate-grid">
                  @for (certificate of certificates; track certificate.id) {
                    <article class="certificate-card">
                      <div>
                        <p class="text-sm font-semibold" style="color:var(--text-primary);">{{ certificate.eventTitle }}</p>
                        <p class="text-xs mt-1" style="color:var(--text-secondary);">Recipient: {{ certificate.recipientName }}</p>
                        <p class="text-xs mt-1" style="color:var(--text-muted);">Event date {{ formatDate(certificate.eventDate) }}</p>
                      </div>
                      <div class="ticket-actions-row">
                        <button type="button" class="btn-primary-inline" (click)="downloadCertificate(certificate)" [disabled]="processingCertificateId === certificate.id">
                          {{ processingCertificateId === certificate.id ? 'Downloading...' : 'Download PDF' }}
                        </button>
                        <button type="button" class="btn-secondary-inline" (click)="copyVerificationLink(certificate.verificationToken)">
                          Copy verify link
                        </button>
                      </div>
                    </article>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab === 'team') {
            <section class="rounded-2xl border p-5" style="background:var(--surface); border-color:var(--border);">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 class="text-base font-semibold" style="color:var(--text-primary);">User Management</h3>
                  <p class="text-xs mt-1" style="color:var(--text-secondary);">This consolidates the old user list and create/edit flows inside profile.</p>
                </div>
                <button type="button" class="btn-primary-inline" (click)="openUserForm()">
                  Create user
                </button>
              </div>

              <div class="team-filter-row">
                <label class="profile-field">
                  <span>Search</span>
                  <input type="text" [value]="teamSearch" (input)="teamSearch = inputValue($event); applyTeamFilter()" placeholder="Name or email" />
                </label>
                <label class="profile-field">
                  <span>Role</span>
                  <select [value]="selectedRoleFilter" (change)="selectedRoleFilter = inputValue($event); applyTeamFilter()">
                    <option value="">All roles</option>
                    @for (role of roleOptions; track role) {
                      <option [value]="role">{{ role }}</option>
                    }
                  </select>
                </label>
              </div>

              @if (showUserForm) {
                <form [formGroup]="managedUserForm" (ngSubmit)="saveManagedUser()" class="team-form-card">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p class="text-sm font-semibold" style="color:var(--text-primary);">
                        {{ editingManagedUser ? 'Edit user' : 'Create user' }}
                      </p>
                      <p class="text-xs mt-1" style="color:var(--text-secondary);">Create and update flows from PIcloud now live inside one inline editor.</p>
                    </div>
                    <button type="button" class="btn-secondary-inline" (click)="closeUserForm()">Close</button>
                  </div>

                  <div class="profile-grid mt-4">
                    <label class="profile-field">
                      <span>First name</span>
                      <input formControlName="name" type="text" />
                    </label>
                    <label class="profile-field">
                      <span>Last name</span>
                      <input formControlName="prenom" type="text" />
                    </label>
                    <label class="profile-field profile-field--full">
                      <span>Email</span>
                      <input formControlName="email" type="email" />
                    </label>
                    <label class="profile-field">
                      <span>Role</span>
                      <select formControlName="role">
                        <option value="">Choose a role</option>
                        @for (role of roleOptions; track role) {
                          <option [value]="role">{{ role }}</option>
                        }
                      </select>
                    </label>
                    <label class="profile-field">
                      <span>Status</span>
                      <input formControlName="statut" type="text" />
                    </label>
                    @if (!editingManagedUser) {
                      <label class="profile-field profile-field--full">
                        <span>Password</span>
                        <input formControlName="password" type="password" />
                      </label>
                    }
                  </div>

                  <div class="profile-actions">
                    <button type="submit" class="btn-primary-inline" [disabled]="managedUserForm.invalid || savingManagedUser">
                      {{ savingManagedUser ? 'Saving...' : (editingManagedUser ? 'Update user' : 'Create user') }}
                    </button>
                  </div>
                </form>
              }

              @if (loadingTeamUsers) {
                <p class="mt-5 text-sm" style="color:var(--text-secondary);">Loading users...</p>
              } @else {
                <div class="table-scroll mt-5">
                  <table class="team-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (managedUser of filteredTeamUsers; track managedUser.id) {
                        <tr>
                          <td>{{ managedUser.name }} {{ managedUser.prenom }}</td>
                          <td>{{ managedUser.email }}</td>
                          <td>{{ managedUser.role }}</td>
                          <td>{{ managedUser.statut }}</td>
                          <td>
                            <div class="ticket-actions-row">
                              <button type="button" class="btn-secondary-inline" (click)="openUserForm(managedUser)">Edit</button>
                              <button type="button" class="btn-danger-inline" (click)="deleteManagedUser(managedUser)">Delete</button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>
          }

          </div><!-- /pf-tab-body -->
        </div><!-- /pf-content -->
      </div><!-- /pf-body -->
    </div><!-- /pf-shell -->
  `,
})
export class ProfileComponent implements OnInit, OnDestroy {
  protected activeTab: ProfileTab = 'account';
  protected readonly allTabs: Array<{ id: ProfileTab; label: string; hint: string; icon: string }> = [
    { id: 'account', label: 'Account', hint: 'Profile data', icon: 'lucideUser' },
    { id: 'security', label: 'Security', hint: 'Password flows', icon: 'lucideKey' },
    { id: 'tickets', label: 'Tickets', hint: 'Payments & PDFs', icon: 'lucideTicket' },
    { id: 'badges', label: 'Badges', hint: 'Participation rewards', icon: 'lucideAward' },
    { id: 'certificates', label: 'Certificates', hint: 'Verification links', icon: 'lucideCalendar' },
    { id: 'team', label: 'Team', hint: 'Admin only', icon: 'lucideUsers' },
  ];
  protected user: User | null = null;
  protected badges: Badge[] = [];
  protected badgeImageUrls: Record<number, SafeUrl> = {};
  private badgeImageBlobUrls: string[] = [];
  protected certificates: Certificate[] = [];
  protected registrations: EventRegistration[] = [];
  protected ticketByEventId: Record<number, Ticket> = {};
  protected teamUsers: User[] = [];
  protected filteredTeamUsers: User[] = [];

  protected loadingBadges = false;
  protected loadingCertificates = false;
  protected loadingTickets = false;
  protected loadingTeamUsers = false;
  protected savingProfile = false;
  protected changingPassword = false;
  protected settingPassword = false;
  protected processingTicketEventId: number | null = null;
  protected processingCertificateId: number | null = null;
  protected savingManagedUser = false;
  protected isEditingProfile = false;
  protected showUserForm = false;
  protected editingManagedUser: User | null = null;

  protected teamSearch = '';
  protected selectedRoleFilter = '';
  protected readonly roleOptions = Object.values(Role);

  protected successMessage = '';
  protected errorMessage = '';

  protected readonly profileForm: FormGroup;
  protected readonly passwordForm: FormGroup;
  protected readonly setPasswordForm: FormGroup;
  protected readonly managedUserForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    protected readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly badgeService: BadgeService,
    private readonly certificateService: CertificateService,
    private readonly registrationService: RegistrationService,
    private readonly ticketService: TicketService,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.profileForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      statut: [''],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.setPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    this.managedUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      statut: ['active'],
    });
  }

  ngOnInit(): void {
    this.profileForm.disable();
    this.loadProfile();
    this.loadBadges();
    this.loadCertificates();
    this.loadTickets();

    if (this.isAdmin) {
      this.loadTeamUsers();
    }

    const tab = this.route.snapshot.queryParamMap.get('tab') as ProfileTab | null;
    if (tab && this.allTabs.some((t) => t.id === tab)) {
      this.activeTab = tab;
    }
  }

  ngOnDestroy(): void {
    this.revokeBadgeImageUrls();
  }

  protected get visibleTabs(): Array<{ id: ProfileTab; label: string; hint: string; icon: string }> {
    return this.allTabs.filter((tab) => tab.id !== 'team' || this.isAdmin);
  }

  protected get activeTabLabel(): string {
    return this.allTabs.find((tab) => tab.id === this.activeTab)?.label ?? 'Profile';
  }

  protected closeProfile(): void {
    const isDashboardUser = this.authService.hasRole(
      Role.ADMIN, Role.MENTOR, Role.INVESTOR, Role.PARTNER, Role.PARTENAIRE
    );
    this.router.navigate([isDashboardUser ? '/app/dashboard' : '/']);
  }

  protected get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMIN);
  }

  protected get isDashboardUser(): boolean {
    return this.authService.hasRole(Role.ADMIN, Role.MENTOR, Role.INVESTOR, Role.PARTNER, Role.PARTENAIRE);
  }

  protected get fullName(): string {
    return [this.user?.name, this.user?.prenom].filter(Boolean).join(' ').trim();
  }

  protected get initials(): string {
    const first = this.user?.name?.[0] || this.authService.getEmail()?.[0] || 'F';
    const last = this.user?.prenom?.[0] || this.authService.getRole()?.[0] || 'L';
    return `${first}${last}`.toUpperCase();
  }

  protected toggleProfileEdit(): void {
    this.clearMessages();
    this.isEditingProfile = !this.isEditingProfile;

    if (this.isEditingProfile) {
      this.profileForm.enable();
      this.profileForm.get('id')?.disable();
    } else {
      this.profileForm.patchValue(this.user || {});
      this.profileForm.disable();
    }
  }

  protected async saveProfile(): Promise<void> {
    if (!this.user || this.profileForm.invalid) {
      return;
    }

    this.savingProfile = true;
    this.clearMessages();

    try {
      const payload: User = {
        ...this.user,
        ...this.profileForm.getRawValue(),
      };
      this.user = await this.userService.updateUser(payload, this.authService.getUserId());
      this.profileForm.patchValue(this.user);
      this.profileForm.disable();
      this.isEditingProfile = false;
      this.successMessage = 'Profile updated successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to update profile.';
    } finally {
      this.savingProfile = false;
      this.cdr.markForCheck();
    }
  }

  protected async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    this.clearMessages();

    try {
      await this.userService.changePassword(
        this.authService.getUserId(),
        this.passwordForm.value.oldPassword,
        this.passwordForm.value.newPassword,
      );
      this.passwordForm.reset();
      this.successMessage = 'Password updated successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to change password.';
    } finally {
      this.changingPassword = false;
      this.cdr.markForCheck();
    }
  }

  protected async setPassword(): Promise<void> {
    if (this.setPasswordForm.invalid) {
      this.setPasswordForm.markAllAsTouched();
      return;
    }

    this.settingPassword = true;
    this.clearMessages();

    try {
      await this.userService.setPassword(this.authService.getUserId(), this.setPasswordForm.value.password);
      this.setPasswordForm.reset();
      this.successMessage = 'Password set successfully.';
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to set password.';
    } finally {
      this.settingPassword = false;
      this.cdr.markForCheck();
    }
  }

  protected payTicket(ticket: Ticket): void {
    this.processingTicketEventId = ticket.eventId;
    this.clearMessages();

    this.ticketService.payForTicket(ticket.eventId).subscribe({
      next: (updated) => {
        this.ticketByEventId = { ...this.ticketByEventId, [updated.eventId]: updated };
        this.successMessage = `Ticket ${updated.ticketNumber} marked as paid.`;
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to process payment.';
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
    });
  }

  protected downloadTicket(ticket: Ticket): void {
    this.processingTicketEventId = ticket.eventId;
    this.clearMessages();

    this.ticketService.downloadTicketPdf(ticket.eventId).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `ticket-${ticket.ticketNumber}.pdf`);
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to download ticket.';
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
    });
  }

  protected cancelRegistration(registration: EventRegistration): void {
    this.processingTicketEventId = registration.eventId;
    this.clearMessages();

    this.registrationService.cancel(registration.eventId).subscribe({
      next: () => {
        this.registrations = this.registrations.filter((item) => item.id !== registration.id);
        const nextTickets = { ...this.ticketByEventId };
        delete nextTickets[registration.eventId];
        this.ticketByEventId = nextTickets;
        this.successMessage = 'Registration cancelled.';
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to cancel registration.';
        this.processingTicketEventId = null;
        this.cdr.markForCheck();
      },
    });
  }

  protected downloadCertificate(certificate: Certificate): void {
    this.processingCertificateId = certificate.id;
    this.clearMessages();

    this.certificateService.downloadCertificate(certificate.id).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `certificate-${certificate.eventTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        this.processingCertificateId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to download certificate.';
        this.processingCertificateId = null;
        this.cdr.markForCheck();
      },
    });
  }

  protected copyVerificationLink(token: string): void {
    navigator.clipboard.writeText(`${window.location.origin}/verify/${token}`);
    this.successMessage = 'Verification link copied to clipboard.';
  }

  protected openUserForm(user?: User): void {
    this.clearMessages();
    this.showUserForm = true;
    this.editingManagedUser = user || null;

    if (user) {
      this.managedUserForm.patchValue({
        name: user.name,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        password: '',
      });
      this.managedUserForm.get('password')?.clearValidators();
      this.managedUserForm.get('password')?.updateValueAndValidity();
    } else {
      this.managedUserForm.reset({
        name: '',
        prenom: '',
        email: '',
        password: '',
        role: '',
        statut: 'active',
      });
      this.managedUserForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.managedUserForm.get('password')?.updateValueAndValidity();
    }
  }

  protected closeUserForm(): void {
    this.showUserForm = false;
    this.editingManagedUser = null;
    this.managedUserForm.reset();
  }

  protected async saveManagedUser(): Promise<void> {
    if (this.managedUserForm.invalid) {
      this.managedUserForm.markAllAsTouched();
      return;
    }

    this.savingManagedUser = true;
    this.clearMessages();

    try {
      if (this.editingManagedUser) {
        const payload: User = {
          ...this.editingManagedUser,
          ...this.managedUserForm.getRawValue(),
          dateInscription: this.editingManagedUser.dateInscription,
        };
        await this.userService.updateUser(payload, this.authService.getUserId());
      } else {
        await this.userService.createUser({
          name: this.managedUserForm.value.name,
          prenom: this.managedUserForm.value.prenom,
          email: this.managedUserForm.value.email,
          password: this.managedUserForm.value.password,
          role: this.managedUserForm.value.role,
        });
      }

      await this.loadTeamUsers();
      this.successMessage = this.editingManagedUser ? 'User updated successfully.' : 'User created successfully.';
      this.closeUserForm();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.error?.message || 'Failed to save user.';
    } finally {
      this.savingManagedUser = false;
      this.cdr.markForCheck();
    }
  }

  protected async deleteManagedUser(user: User): Promise<void> {
    if (!window.confirm(`Delete ${user.name} ${user.prenom}?`)) {
      return;
    }

    this.clearMessages();

    try {
      await this.userService.deleteUser(user.id);
      this.teamUsers = this.teamUsers.filter((item) => item.id !== user.id);
      this.applyTeamFilter();
      this.successMessage = 'User deleted successfully.';
    } catch {
      this.errorMessage = 'Failed to delete user.';
    }
  }

  protected applyTeamFilter(): void {
    const query = this.teamSearch.trim().toLowerCase();
    this.filteredTeamUsers = this.teamUsers.filter((user) => {
      const matchesText = [user.name, user.prenom, user.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      const matchesRole = !this.selectedRoleFilter || user.role === this.selectedRoleFilter;
      return matchesText && matchesRole;
    });
  }

  protected displayRole(role: string): string {
    if (!role) {
      return 'Member';
    }

    return role === 'PARTENAIRE' ? 'Partner' : role.charAt(0) + role.slice(1).toLowerCase();
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  protected registrationStatusTone(status: string): { bg: string; fg: string } {
    switch (status) {
      case 'PRESENT':
        return { bg: 'var(--badge-green-bg)', fg: 'var(--badge-green-text)' };
      case 'LISTE_ATTENTE':
        return { bg: 'var(--badge-amber-bg)', fg: 'var(--badge-amber-text)' };
      case 'ANNULE':
        return { bg: 'var(--badge-red-bg)', fg: 'var(--badge-red-text)' };
      default:
        return { bg: 'var(--badge-purple-bg)', fg: 'var(--badge-purple-text)' };
    }
  }

  protected badgeTone(type: string): { bg: string; icon: string } {
    const tones: Record<string, { bg: string; icon: string }> = {
      PARTICIPATION: { bg: 'var(--badge-purple-bg)', icon: '🎯' },
      SERIE_COMPLETION: { bg: 'var(--badge-amber-bg)', icon: '🏆' },
      LEAN_STARTUP_PRACTITIONER: { bg: 'var(--badge-green-bg)', icon: '🚀' },
      INNOVATION_CHAMPION: { bg: '#ede9fe', icon: '💡' },
      NETWORKING_PRO: { bg: '#cffafe', icon: '🤝' },
    };
    return tones[type] || { bg: 'var(--surface-subtle)', icon: '🎖️' };
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  private async loadProfile(): Promise<void> {
    try {
      this.user = await this.userService.getUserById(this.authService.getUserId());
      this.profileForm.patchValue(this.user);
    } catch {
      this.errorMessage = 'Failed to load profile.';
    } finally {
      this.cdr.markForCheck();
    }
  }

  private loadBadges(): void {
    this.loadingBadges = true;
    this.revokeBadgeImageUrls();

    this.badgeService.getMyBadges().subscribe({
      next: (badges) => {
        this.badges = badges;
        this.loadingBadges = false;
        this.cdr.markForCheck();
        badges.filter((b) => b.hasImage).forEach((b) => this.loadBadgeImage(b.id));
      },
      error: () => {
        this.loadingBadges = false;
        this.errorMessage = 'Failed to load badges.';
        this.cdr.markForCheck();
      },
    });
  }

  private loadBadgeImage(badgeId: number): void {
    this.badgeService.getBadgeImage(badgeId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.badgeImageBlobUrls.push(objectUrl);
        this.badgeImageUrls = {
          ...this.badgeImageUrls,
          [badgeId]: this.sanitizer.bypassSecurityTrustUrl(objectUrl),
        };
        this.cdr.markForCheck();
      },
      error: () => {
        // Missing images are acceptable — the card falls back to the emoji icon.
      },
    });
  }

  protected downloadBadge(badge: Badge): void {
    this.badgeService.getBadgeImage(badge.id, true).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeLabel = (badge.label || `badge-${badge.id}`).replace(/[^a-z0-9-_]+/gi, '_');
        a.download = `${safeLabel}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Failed to download badge image.';
        this.cdr.markForCheck();
      },
    });
  }

  private revokeBadgeImageUrls(): void {
    this.badgeImageBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.badgeImageBlobUrls = [];
    this.badgeImageUrls = {};
  }

  private loadCertificates(): void {
    this.loadingCertificates = true;

    this.certificateService.getMyCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loadingCertificates = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingCertificates = false;
        this.errorMessage = 'Failed to load certificates.';
        this.cdr.markForCheck();
      },
    });
  }

  private loadTickets(): void {
    this.loadingTickets = true;

    this.registrationService.getMyRegistrations().subscribe({
      next: (registrations) => {
        this.registrations = registrations.filter((registration) => registration.status !== 'ANNULE');
        this.loadingTickets = false;
        this.cdr.markForCheck();

        this.registrations
          .filter((registration) => registration.status === 'INSCRIT' || registration.status === 'PRESENT')
          .forEach((registration) => {
            this.ticketService.getMyTicket(registration.eventId).subscribe({
              next: (ticket) => {
                this.ticketByEventId = { ...this.ticketByEventId, [registration.eventId]: ticket };
                this.cdr.markForCheck();
              },
            });
          });
      },
      error: () => {
        this.loadingTickets = false;
        this.errorMessage = 'Failed to load tickets.';
        this.cdr.markForCheck();
      },
    });
  }

  private async loadTeamUsers(): Promise<void> {
    this.loadingTeamUsers = true;

    try {
      this.teamUsers = await this.userService.getAllUsers();
      this.applyTeamFilter();
    } catch {
      this.errorMessage = 'Failed to load users.';
    } finally {
      this.loadingTeamUsers = false;
      this.cdr.markForCheck();
    }
  }

  private passwordMatchValidator(form: FormGroup): Record<string, boolean> | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
