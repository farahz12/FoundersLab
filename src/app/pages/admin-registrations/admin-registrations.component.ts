import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideCheckCircle,
  lucideChevronDown,
  lucideClock3,
  lucideRefreshCw,
  lucideSearch,
  lucideUserCheck,
  lucideUsers,
  lucideX,
  lucideXCircle,
} from '@ng-icons/lucide';
import { EventRegistration, RegistrationStatus } from '../../models/registration';
import { RegistrationService } from '../../services/registration.service';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'cancelled';

@Component({
  selector: 'app-admin-registrations',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideCheck,
      lucideCheckCircle,
      lucideChevronDown,
      lucideClock3,
      lucideRefreshCw,
      lucideSearch,
      lucideUserCheck,
      lucideUsers,
      lucideX,
      lucideXCircle,
    }),
  ],
  templateUrl: './admin-registrations.component.html',
})
export class AdminRegistrationsComponent implements OnInit {
  protected readonly filterTabs: Array<{ id: FilterTab; label: string }> = [
    { id: 'all',       label: 'All' },
    { id: 'pending',   label: 'Pending approval' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  protected filterTab: FilterTab = 'all';
  protected registrations: EventRegistration[] = [];
  protected loading = false;
  protected processingId: number | null = null;

  protected rejectDialogOpen = false;
  protected rejectingId: number | null = null;
  protected rejectReason = '';

  protected successMessage = '';
  protected errorMessage = '';

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  protected get filteredRegistrations(): EventRegistration[] {
    switch (this.filterTab) {
      case 'pending':
        return this.registrations.filter(
          (r) => r.status === 'PAIEMENT_EN_ATTENTE_VALIDATION',
        );
      case 'confirmed':
        return this.registrations.filter(
          (r) => r.status === 'INSCRIT' || r.status === 'PRESENT',
        );
      case 'cancelled':
        return this.registrations.filter((r) => r.status === 'ANNULE');
      default:
        return this.registrations;
    }
  }

  protected get pendingCount(): number {
    return this.registrations.filter(
      (r) => r.status === 'PAIEMENT_EN_ATTENTE_VALIDATION',
    ).length;
  }

  protected loadAll(): void {
    this.loading = true;
    this.clearMessages();
    this.registrationService.getAllRegistrations().subscribe({
      next: (regs) => {
        this.registrations = regs;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load registrations.';
        this.cdr.markForCheck();
      },
    });
  }

  protected approve(id: number): void {
    this.processingId = id;
    this.clearMessages();
    this.registrationService.approve(id).subscribe({
      next: (updated) => {
        this.registrations = this.registrations.map((r) =>
          r.id === id ? updated : r,
        );
        this.processingId = null;
        this.successMessage = 'Registration approved and confirmation email sent.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.processingId = null;
        this.errorMessage = err?.error?.message || 'Failed to approve registration.';
        this.cdr.markForCheck();
      },
    });
  }

  protected openRejectDialog(id: number): void {
    this.rejectingId = id;
    this.rejectReason = '';
    this.rejectDialogOpen = true;
  }

  protected cancelReject(): void {
    this.rejectDialogOpen = false;
    this.rejectingId = null;
  }

  protected confirmReject(): void {
    if (!this.rejectingId) return;
    const id = this.rejectingId;
    this.processingId = id;
    this.rejectDialogOpen = false;
    this.clearMessages();
    this.registrationService.reject(id, this.rejectReason).subscribe({
      next: (updated) => {
        this.registrations = this.registrations.map((r) =>
          r.id === id ? updated : r,
        );
        this.processingId = null;
        this.rejectingId = null;
        this.successMessage = 'Registration rejected.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.processingId = null;
        this.errorMessage = err?.error?.message || 'Failed to reject registration.';
        this.cdr.markForCheck();
      },
    });
  }

  protected checkIn(id: number): void {
    this.processingId = id;
    this.clearMessages();
    this.registrationService.checkIn(id).subscribe({
      next: (updated) => {
        this.registrations = this.registrations.map((r) =>
          r.id === id ? updated : r,
        );
        this.processingId = null;
        this.successMessage = 'Check-in successful.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.processingId = null;
        this.errorMessage = err?.error?.message || 'Failed to check in.';
        this.cdr.markForCheck();
      },
    });
  }

  protected statusLabel(status: RegistrationStatus): string {
    const map: Record<RegistrationStatus, string> = {
      INSCRIT: 'Confirmed',
      PRESENT: 'Attended',
      PAIEMENT_EN_ATTENTE_VALIDATION: 'Pending payment',
      LISTE_ATTENTE: 'Waitlist',
      ANNULE: 'Cancelled',
    };
    return map[status] ?? status;
  }

  protected statusBg(status: RegistrationStatus): string {
    switch (status) {
      case 'INSCRIT':   return 'var(--badge-green-bg)';
      case 'PRESENT':   return 'var(--badge-purple-bg)';
      case 'PAIEMENT_EN_ATTENTE_VALIDATION': return 'var(--badge-amber-bg)';
      case 'LISTE_ATTENTE': return 'var(--surface-subtle)';
      case 'ANNULE':    return 'var(--badge-red-bg)';
      default:          return 'var(--surface-subtle)';
    }
  }

  protected statusColor(status: RegistrationStatus): string {
    switch (status) {
      case 'INSCRIT':   return 'var(--badge-green-text)';
      case 'PRESENT':   return 'var(--badge-purple-text)';
      case 'PAIEMENT_EN_ATTENTE_VALIDATION': return 'var(--badge-amber-text)';
      case 'LISTE_ATTENTE': return 'var(--text-secondary)';
      case 'ANNULE':    return 'var(--badge-red-text)';
      default:          return 'var(--text-secondary)';
    }
  }

  protected paymentLabel(payment: string | null): string {
    if (!payment) return '—';
    const map: Record<string, string> = {
      FREE: 'Free',
      PENDING: 'Pending',
      PAID: 'Paid',
      FAILED: 'Failed',
    };
    return map[payment] ?? payment;
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
