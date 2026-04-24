import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VerificationResponse } from '../../models/certificate';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-verify-certificate',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="verify-shell">
      <div class="verify-card">
        <p class="verify-eyebrow">Certificate Verification</p>
        <h1 class="verify-title">Public verification portal</h1>
        <p class="verify-copy">
          This preserves the public certificate verification flow from PIcloud inside FoundersLab.
        </p>

        @if (loading) {
          <p class="verify-status">Checking certificate…</p>
        } @else if (result?.valid) {
          <div class="verify-result verify-result--success">
            <p class="verify-status-title">Certificate is valid</p>
            <p><strong>Recipient:</strong> {{ result?.recipientName }}</p>
            <p><strong>Event:</strong> {{ result?.eventTitle }}</p>
            <p><strong>Date:</strong> {{ formatDate(result?.eventDate || null) }}</p>
            <p><strong>Generated:</strong> {{ formatDate(result?.generatedAt || null) }}</p>
          </div>
        } @else {
          <div class="verify-result verify-result--error">
            <p class="verify-status-title">Certificate could not be verified</p>
            <p>{{ result?.message || errorMessage || 'The verification token is invalid or expired.' }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class VerifyCertificateComponent implements OnInit {
  protected loading = true;
  protected errorMessage = '';
  protected result: VerificationResponse | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly certificateService: CertificateService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.loading = false;
      this.errorMessage = 'Missing verification token.';
      return;
    }

    this.certificateService.verify(token).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (error) => {
        this.result = error?.error || null;
        this.errorMessage = error?.error?.message || 'Verification failed.';
        this.loading = false;
      },
    });
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
