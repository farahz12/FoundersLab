import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCheck,
  lucideCircleDashed,
  lucideClock3,
  lucideDownload,
  lucideEdit,
  lucideExternalLink,
  lucideGlobe,
  lucideMapPin,
  lucidePlus,
  lucideSearch,
  lucideSparkles,
  lucideTicket,
  lucideTrash2,
  lucideUpload,
  lucideUserRoundPlus,
  lucideUsers,
  lucideVideo,
  lucideWallet,
  lucideX,
  lucideMessageSquare,
} from '@ng-icons/lucide';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Event, EventRequest, EventStatus, EventType, LocationType } from '../../models/event';
import { EventProgram, EventProgramRequest, ProgramSlotType } from '../../models/program';
import { EventRegistration } from '../../models/registration';
import { Speaker, SpeakerCandidate, SpeakerRequest } from '../../models/speaker';
import { Ticket } from '../../models/ticket';
import { EventService } from '../../services/event.service';
import { ProgramService } from '../../services/program.service';
import { RegistrationService } from '../../services/registration.service';
import { SpeakerService } from '../../services/speaker.service';
import { TicketService } from '../../services/ticket.service';
import { PredictionService } from '../../services/prediction.service';
import { FeedbackService } from '../../services/feedback.service';

type WorkspaceTab = 'directory' | 'calendar' | 'speakers' | 'review';
type DetailTab = 'overview' | 'programme' | 'registrations' | 'feedback';

interface FeedbackItem {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  own?: boolean;
}

interface FeedbackStats {
  totalCount: number;
  averageRating: number;
  distribution: Record<number, number>;
}

interface FeedbackEligibility {
  canSubmit: boolean;
  hasSubmitted: boolean;
}

@Component({
  selector: 'app-events',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideCalendar,
      lucideCheck,
      lucideCircleDashed,
      lucideClock3,
      lucideDownload,
      lucideEdit,
      lucideExternalLink,
      lucideGlobe,
      lucideMapPin,
      lucidePlus,
      lucideSearch,
      lucideSparkles,
      lucideTicket,
      lucideTrash2,
      lucideUpload,
      lucideUserRoundPlus,
      lucideUsers,
      lucideVideo,
      lucideWallet,
      lucideX,
      lucideMessageSquare,
    }),
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  protected readonly workspaceTabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: 'directory', label: 'Directory' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'review', label: 'Pending review' },
  ];
  protected readonly detailTabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'programme', label: 'Programme' },
    { id: 'registrations', label: 'Registrations' },
    { id: 'feedback', label: 'Feedback' },
  ];
  protected readonly eventTypes: EventType[] = ['WEBINAIRE', 'WORKSHOP', 'PITCH', 'BOOTCAMP', 'CONFERENCE'];
  protected readonly eventStatuses: EventStatus[] = [
    'BROUILLON',
    'EN_ATTENTE_VALIDATION',
    'APPROUVE',
    'PUBLIE',
    'REJETE',
    'ANNULE',
    'TERMINE',
  ];
  protected readonly locationTypes: LocationType[] = ['PRESENTIEL', 'DISTANCIEL', 'HYBRIDE'];
  protected readonly slotTypes: ProgramSlotType[] = ['PRESENTATION', 'KEYNOTE', 'WORKSHOP', 'QA', 'BREAK'];
  protected readonly viewModes = ['grid', 'list', 'map'] as const;
  protected readonly typeFilterOptions = ['All', 'WEBINAIRE', 'WORKSHOP', 'PITCH', 'BOOTCAMP', 'CONFERENCE'];

  protected viewMode: 'grid' | 'list' | 'map' = 'grid';
  protected workspaceTab: WorkspaceTab = 'directory';
  protected detailTab: DetailTab = 'overview';

  protected events: Event[] = [];
  protected pendingEvents: Event[] = [];
  protected speakers: Speaker[] = [];
  protected eventSpeakers: Speaker[] = [];
  protected program: EventProgram[] = [];
  protected registrations: EventRegistration[] = [];
  protected myRegistrations: EventRegistration[] = [];

  protected selectedEvent: Event | null = null;
  protected selectedRegistration: EventRegistration | null = null;
  protected selectedTicket: Ticket | null = null;
  protected checkInResult: Ticket | null = null;
  protected lookupResult: EventRegistration | null = null;
  protected lookupError = '';

  protected searchQuery = '';
  protected selectedTypeFilter = '';
  protected selectedStatusFilter = '';
  protected sectorInput = '';
  protected stageInput = '';
  protected checkInInput = '';
  protected numberOfPlacesToRegister = 1;

  protected showEventForm = false;
  protected showSpeakerForm = false;
  protected showSlotForm = false;

  protected editingEvent: Event | null = null;
  protected editingSpeaker: Speaker | null = null;
  protected editingSlot: EventProgram | null = null;

  protected loadingEvents = false;
  protected loadingPending = false;
  protected savingEvent = false;
  protected savingSpeaker = false;
  protected savingSlot = false;
  protected processingSelectedAction = false;
  protected generatingDescription = false;
  protected predictingEvent = false;
  protected predictingDetails = false;

  protected linkedinCandidates: SpeakerCandidate[] = [];

  protected successMessage = '';
  protected errorMessage = '';
  protected predictionError = '';
  protected detailsPredictionError = '';

  protected fullAnalysis: any = null;
  protected detailsRegistrationPrediction: any = null;
  protected detailsSuccessPrediction: any = null;

  // Calendar state
  protected calendarYear = new Date().getFullYear();
  protected calendarMonth = new Date().getMonth();

  // Speaker form search (in event creation form)
  protected showFormSpeakerSearch = false;
  protected formSpeakerSearchQuery = '';
  protected formSpeakerCandidates: SpeakerCandidate[] = [];
  protected formStagedSpeakers: SpeakerCandidate[] = [];
  protected formSpeakerSearchError = '';
  protected isSearchingFormSpeakers = false;
  protected formShouldGenerateProgram = false;

  // Geocode / map
  protected showGeocodeSuggestions = false;
  protected geocodeSuggestions: Array<{ display_name: string; lat: string; lon: string }> = [];
  private geocodeTimer: ReturnType<typeof setTimeout> | null = null;
  protected formPreviewMarkers: any[] = [];

  // Feedback
  protected feedbackList: FeedbackItem[] = [];
  protected feedbackStats: FeedbackStats | null = null;
  protected feedbackEligibility: FeedbackEligibility | null = null;
  protected myFeedback: FeedbackItem | null = null;
  protected feedbackRating = 0;
  protected feedbackHoverRating = 0;
  protected feedbackComment = '';
  protected feedbackError = '';
  protected submittingFeedback = false;
  protected loadingFeedback = false;

  protected readonly eventForm: FormGroup;
  protected readonly speakerForm: FormGroup;
  protected readonly slotForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    protected readonly authService: AuthService,
    private readonly eventService: EventService,
    private readonly registrationService: RegistrationService,
    private readonly ticketService: TicketService,
    private readonly speakerService: SpeakerService,
    private readonly programService: ProgramService,
    private readonly predictionService: PredictionService,
    private readonly feedbackService: FeedbackService,
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(5000)],
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      locationType: ['', Validators.required],
      location: [''],
      address: [''],
      latitude: [null],
      longitude: [null],
      ticketPrice: [null],
      capacityMax: [50, [Validators.required, Validators.min(1)]],
      coverImageUrl: [''],
      targetSector: [[]],
      targetStage: [[]],
    });

    this.speakerForm = this.fb.group({
      fullName: ['', Validators.required],
      title: [''],
      company: [''],
      bio: [''],
      photoUrl: [''],
      linkedinUrl: [''],
    });

    this.slotForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['PRESENTATION', Validators.required],
      startTime: [''],
      endTime: [''],
      orderIndex: [0, Validators.required],
      speakerId: [null],
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    if (this.authService.isLoggedIn()) {
      this.loadMyRegistrations();
    }
    if (this.canCreate()) {
      this.loadSpeakers();
    }
    if (this.isAdmin()) {
      this.loadPending();
    }
  }

  protected get targetSectors(): string[] {
    return this.eventForm.getRawValue().targetSector || [];
  }

  protected get targetStages(): string[] {
    return this.eventForm.getRawValue().targetStage || [];
  }

  protected get isPresentiel(): boolean {
    return this.eventForm.get('locationType')?.value === 'PRESENTIEL';
  }

  protected get filteredEvents(): Event[] {
    return this.events.filter((event) => {
      const search = this.searchQuery.trim().toLowerCase();
      const matchesText =
        !search ||
        [event.title, event.description, event.organizerName || '', event.location || '']
          .join(' ')
          .toLowerCase()
          .includes(search);
      const matchesType = !this.selectedTypeFilter || event.type === this.selectedTypeFilter;
      const matchesStatus = !this.selectedStatusFilter || event.status === this.selectedStatusFilter;
      return matchesText && matchesType && matchesStatus;
    });
  }

  protected get groupedEvents(): Array<{ key: string; label: string; events: Event[] }> {
    const map = new Map<string, Event[]>();
    this.filteredEvents.forEach((event) => {
      const date = event.startDate ? new Date(event.startDate) : new Date();
      const key = date.toISOString().slice(0, 10);
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .sort(([l], [r]) => l.localeCompare(r))
      .map(([key, events]) => ({
        key,
        label: new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', {
          weekday: 'short', day: '2-digit', month: 'short',
        }),
        events: events.sort((l, r) => l.startDate.localeCompare(r.startDate)),
      }));
  }

  protected get stats(): Array<{ label: string; value: string }> {
    const published = this.events.filter((e) => e.status === 'PUBLIE').length;
    const myTickets = this.myRegistrations.filter((r) => r.status !== 'ANNULE').length;

    if (!this.canCreate()) {
      const free = this.events.filter((e) => !e.ticketPrice).length;
      const upcoming = this.events.filter((e) => {
        if (!e.startDate) return false;
        return new Date(e.startDate) > new Date();
      }).length;
      return [
        { label: 'Available events', value: String(published) },
        { label: 'My registrations', value: String(myTickets) },
        { label: 'Upcoming', value: String(upcoming) },
        { label: 'Free events', value: String(free) },
      ];
    }

    const pending = this.pendingEvents.length;
    return [
      { label: 'Total events', value: String(this.events.length) },
      { label: 'Published', value: String(published) },
      { label: 'My registrations', value: String(myTickets) },
      { label: 'Pending review', value: String(pending) },
    ];
  }

  protected get calendarMonthLabel(): string {
    return new Date(this.calendarYear, this.calendarMonth, 1).toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric',
    });
  }

  protected get calendarDays(): Array<{ date: Date | null; isToday: boolean; events: Event[] }> {
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    // ISO week: Monday=0
    const startPad = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ date: Date | null; isToday: boolean; events: Event[] }> = [];
    const today = new Date();

    for (let i = 0; i < startPad; i++) {
      cells.push({ date: null, isToday: false, events: [] });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.calendarYear, this.calendarMonth, d);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const dayEvents = this.events.filter((e) => {
        if (!e.startDate) return false;
        const ed = new Date(e.startDate);
        return ed.getDate() === d && ed.getMonth() === this.calendarMonth && ed.getFullYear() === this.calendarYear;
      });
      cells.push({ date, isToday, events: dayEvents });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ date: null, isToday: false, events: [] });
      }
    }
    return cells;
  }

  protected get calendarEventsInMonth(): Event[] {
    return this.events.filter((e) => {
      if (!e.startDate) return false;
      const d = new Date(e.startDate);
      return d.getMonth() === this.calendarMonth && d.getFullYear() === this.calendarYear;
    });
  }

  protected get eventMarkersForMap(): any[] {
    return this.filteredEvents
      .filter((e) => e.locationType !== 'DISTANCIEL' && e.latitude != null && e.longitude != null)
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        status: e.status,
        startDate: e.startDate,
        address: (e as any).address,
        latitude: e.latitude!,
        longitude: e.longitude!,
        coverImage: e.coverImageUrl,
      }));
  }

  protected prevCalendarMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
  }

  protected nextCalendarMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
  }

  protected goToCalendarToday(): void {
    const now = new Date();
    this.calendarYear = now.getFullYear();
    this.calendarMonth = now.getMonth();
  }

  protected onViewModeChange(mode: string): void {
    this.viewMode = mode as 'grid' | 'list' | 'map';
  }

  protected canCreate(): boolean {
    return this.authService.hasRole('ADMIN', 'MENTOR', 'PARTNER', 'PARTENAIRE');
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  protected selectEvent(event: Event): void {
    this.clearMessages();
    this.detailTab = 'overview';
    this.eventService.getById(event.id).subscribe({
      next: (selected) => {
        this.selectedEvent = selected;
        this.selectedRegistration =
          this.myRegistrations.find((r) => r.eventId === selected.id) || null;
        this.selectedTicket = null;
        this.checkInResult = null;
        this.checkInInput = '';
        this.lookupResult = null;
        this.lookupError = '';
        this.feedbackList = [];
        this.feedbackStats = null;
        this.feedbackEligibility = null;
        this.myFeedback = null;
        this.feedbackRating = 0;
        this.feedbackComment = '';
        this.feedbackError = '';
        this.loadEventWorkspace(selected.id);
        if (selected.status === 'TERMINE' || selected.status === 'PUBLIE') {
          this.loadFeedback(selected.id);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load the event workspace.';
        this.cdr.markForCheck();
      },
    });
  }

  protected openEventForm(event?: Event): void {
    this.clearMessages();
    this.showEventForm = true;
    this.editingEvent = event || null;
    this.fullAnalysis = null;
    this.predictionError = '';
    this.formStagedSpeakers = [];
    this.showFormSpeakerSearch = false;
    this.formShouldGenerateProgram = false;
    this.formPreviewMarkers = [];

    if (event) {
      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        type: event.type,
        startDate: this.toDatetimeLocal(event.startDate),
        endDate: this.toDatetimeLocal(event.endDate),
        locationType: event.locationType,
        location: event.location || '',
        address: (event as any).address || '',
        latitude: event.latitude || null,
        longitude: event.longitude || null,
        ticketPrice: event.ticketPrice,
        capacityMax: event.capacityMax || 50,
        coverImageUrl: event.coverImageUrl || '',
        targetSector: [...event.targetSector],
        targetStage: [...event.targetStage],
      });
    } else {
      this.eventForm.reset({
        title: '', description: '', type: '', startDate: '', endDate: '',
        locationType: '', location: '', address: '', latitude: null, longitude: null,
        ticketPrice: null, capacityMax: 50, coverImageUrl: '',
        targetSector: [], targetStage: [],
      });
    }
  }

  protected closeEventForm(): void {
    this.showEventForm = false;
    this.editingEvent = null;
    this.generatingDescription = false;
  }

  protected submitEventForm(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    const raw = this.eventForm.getRawValue();
    const payload: EventRequest = {
      title: raw.title,
      description: raw.description || '',
      type: raw.type,
      startDate: raw.startDate,
      endDate: raw.endDate || undefined,
      locationType: raw.locationType,
      location: raw.location || undefined,
      ticketPrice: raw.ticketPrice == null || raw.ticketPrice === '' ? undefined : Number(raw.ticketPrice),
      capacityMax: Number(raw.capacityMax),
      coverImageUrl: raw.coverImageUrl || undefined,
      targetSector: raw.targetSector || [],
      targetStage: raw.targetStage || [],
    };
    this.savingEvent = true;
    this.clearMessages();
    const request$ = this.editingEvent
      ? this.eventService.update(this.editingEvent.id, payload)
      : this.eventService.create(payload);
    request$.subscribe({
      next: (event) => {
        this.savingEvent = false;
        this.showEventForm = false;
        this.successMessage = this.editingEvent ? 'Event updated.' : 'Event created.';
        this.cdr.markForCheck();
        this.loadEvents(event.id);
        if (this.isAdmin()) this.loadPending();
      },
      error: (err) => {
        this.savingEvent = false;
        this.errorMessage = err?.error?.message || 'Failed to save event.';
        this.cdr.markForCheck();
      },
    });
  }

  protected uploadEventImage(event: globalThis.Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.eventService.uploadImage(file).subscribe({
      next: (res) => { this.eventForm.patchValue({ coverImageUrl: res.url }); this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Failed to upload event image.'; this.cdr.markForCheck(); },
    });
  }

  protected generateDescription(): void {
    const title = this.eventForm.get('title')?.value?.trim();
    if (!title) { this.errorMessage = 'Add a title before generating a description.'; return; }
    this.generatingDescription = true;
    this.clearMessages();
    this.eventService.generateDescription(title, this.eventForm.get('startDate')?.value || '', this.eventForm.get('type')?.value || '').subscribe({
      next: (res) => { this.eventForm.patchValue({ description: res.description }); this.generatingDescription = false; this.cdr.markForCheck(); },
      error: () => { this.generatingDescription = false; this.errorMessage = 'Failed to generate description.'; this.cdr.markForCheck(); },
    });
  }

protected predictEvent(): void {
  if (this.eventForm.invalid) { this.eventForm.markAllAsTouched(); return; }
  this.predictingEvent = true;
  this.predictionError = '';
  this.fullAnalysis = null;
  
  const formValue = this.eventForm.getRawValue();
  const payload = {
    title: formValue.title || '',
    description: formValue.description || '',
    type: formValue.type,
    startDate: formValue.startDate,
    endDate: formValue.endDate || undefined,
    locationType: formValue.locationType,
    location: formValue.location || '',
    address: formValue.address || '',
    latitude: formValue.latitude || null,
    longitude: formValue.longitude || null,
    ticketPrice: formValue.ticketPrice || null,
    capacityMax: formValue.capacityMax || 50,
    coverImageUrl: formValue.coverImageUrl || '',
    targetSector: formValue.targetSector || [],
    targetStage: formValue.targetStage || []
  };
  
  this.predictionService.analyzeEvent?.(payload)?.subscribe?.({
    next: (result: any) => { 
      this.fullAnalysis = result; 
      this.predictingEvent = false; 
      this.cdr.markForCheck(); 
    },
    error: () => { 
      this.predictionError = 'Prediction failed.'; 
      this.predictingEvent = false; 
      this.cdr.markForCheck(); 
    },
  });
}
protected predictSelectedEvent(): void {
  if (!this.selectedEvent) return;
  this.predictingDetails = true;
  this.detailsPredictionError = '';
  this.detailsRegistrationPrediction = null;
  this.detailsSuccessPrediction = null;
  
  const payload = {
    title: this.selectedEvent.title || '',
    description: this.selectedEvent.description || '',
    type: this.selectedEvent.type,
    startDate: this.selectedEvent.startDate,
    endDate: this.selectedEvent.endDate || undefined,
    locationType: this.selectedEvent.locationType,
    location: this.selectedEvent.location || '',
    address: (this.selectedEvent as any).address || '',
    latitude: this.selectedEvent.latitude || null,
    longitude: this.selectedEvent.longitude || null,
    ticketPrice: this.selectedEvent.ticketPrice || null,
    capacityMax: this.selectedEvent.capacityMax || 50,
    coverImageUrl: this.selectedEvent.coverImageUrl || '',
    targetSector: this.selectedEvent.targetSector || [],
    targetStage: this.selectedEvent.targetStage || []
  };
  
  this.predictionService.analyzeEvent?.(payload)?.subscribe?.({
    next: (result: any) => {
      this.detailsRegistrationPrediction = result?.registrationEstimate ? { predicted_registrations: result.registrationEstimate.pointEstimate } : null;
      this.detailsSuccessPrediction = result ? { success_score: result.successScore, label: result.label } : null;
      this.predictingDetails = false;
      this.cdr.markForCheck();
    },
    error: () => { 
      this.detailsPredictionError = 'Prediction failed.'; 
      this.predictingDetails = false; 
      this.cdr.markForCheck(); 
    },
  });
}

  protected onAddressInput(value: string): void {
    this.eventForm.patchValue({ address: value });
    if (this.geocodeTimer) clearTimeout(this.geocodeTimer);
    if (!value.trim()) {
      this.geocodeSuggestions = [];
      this.showGeocodeSuggestions = false;
      return;
    }
    this.geocodeTimer = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
        .then((r) => r.json())
        .then((results: Array<{ display_name: string; lat: string; lon: string }>) => {
          this.geocodeSuggestions = results;
          this.showGeocodeSuggestions = results.length > 0;
          this.cdr.markForCheck();
        })
        .catch(() => {
          this.geocodeSuggestions = [];
          this.showGeocodeSuggestions = false;
        });
    }, 400);
  }

  protected selectGeocodeSuggestion(suggestion: { display_name: string; lat: string; lon: string }): void {
    this.eventForm.patchValue({
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
    this.showGeocodeSuggestions = false;
    this.geocodeSuggestions = [];
    this.formPreviewMarkers = [{ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) }];
  }

  protected updateFormCoords(lat: number, lng: number): void {
    this.eventForm.patchValue({ latitude: lat, longitude: lng });
  }

  protected addSector(event: globalThis.Event): void {
    event.preventDefault();
    const value = this.sectorInput.trim();
    if (!value) return;
    const next = [...this.targetSectors];
    if (!next.includes(value)) { next.push(value); this.eventForm.patchValue({ targetSector: next }); }
    this.sectorInput = '';
  }

  protected removeSector(sector: string): void {
    this.eventForm.patchValue({ targetSector: this.targetSectors.filter((v) => v !== sector) });
  }

  protected addStage(event: globalThis.Event): void {
    event.preventDefault();
    const value = this.stageInput.trim();
    if (!value) return;
    const next = [...this.targetStages];
    if (!next.includes(value)) { next.push(value); this.eventForm.patchValue({ targetStage: next }); }
    this.stageInput = '';
  }

  protected removeStage(stage: string): void {
    this.eventForm.patchValue({ targetStage: this.targetStages.filter((v) => v !== stage) });
  }

  protected searchLinkedInForForm(): void {
    if (!this.formSpeakerSearchQuery.trim()) return;
    this.isSearchingFormSpeakers = true;
    this.formSpeakerSearchError = '';
    this.speakerService.searchLinkedIn(this.formSpeakerSearchQuery.trim()).subscribe({
      next: (candidates) => { this.formSpeakerCandidates = candidates; this.isSearchingFormSpeakers = false; this.cdr.markForCheck(); },
      error: () => { this.formSpeakerSearchError = 'Search failed.'; this.isSearchingFormSpeakers = false; this.cdr.markForCheck(); },
    });
  }

  protected stageFormSpeaker(candidate: SpeakerCandidate): void {
    if (!this.isFormSpeakerStaged(candidate)) this.formStagedSpeakers = [...this.formStagedSpeakers, candidate];
  }

  protected removeFormSpeaker(candidate: SpeakerCandidate): void {
    this.formStagedSpeakers = this.formStagedSpeakers.filter((s) => s !== candidate);
  }

  protected isFormSpeakerStaged(candidate: SpeakerCandidate): boolean {
    return this.formStagedSpeakers.some((s) => (s.linkedinUrl && s.linkedinUrl === candidate.linkedinUrl) || s.fullName === candidate.fullName);
  }

  protected registerForSelected(): void {
    if (!this.selectedEvent) return;
    const eventId = this.selectedEvent.id;
    this.processingSelectedAction = true;
    this.clearMessages();
    this.registrationService.register(eventId).subscribe({
      next: (registration) => {
        this.selectedRegistration = registration;
        this.processingSelectedAction = false;
        this.successMessage = registration.status === 'LISTE_ATTENTE' ? 'Added to waitlist.' : 'Registration completed.';
        this.cdr.markForCheck();
        this.loadMyRegistrations(eventId);
        this.loadEvents(eventId);
        if (registration.status === 'INSCRIT') this.loadSelectedTicket(eventId);
      },
      error: (err) => { this.processingSelectedAction = false; this.errorMessage = err?.error?.message || 'Failed to register.'; this.cdr.markForCheck(); },
    });
  }

  protected cancelSelectedRegistration(): void {
    if (!this.selectedEvent) return;
    this.processingSelectedAction = true;
    this.clearMessages();
    this.registrationService.cancel(this.selectedEvent.id).subscribe({
      next: () => {
        this.selectedRegistration = null; this.selectedTicket = null;
        this.processingSelectedAction = false; this.successMessage = 'Registration cancelled.';
        this.cdr.markForCheck();
        this.loadMyRegistrations(this.selectedEvent?.id);
        this.loadEvents(this.selectedEvent?.id);
      },
      error: () => { this.processingSelectedAction = false; this.errorMessage = 'Failed to cancel registration.'; this.cdr.markForCheck(); },
    });
  }

  protected paySelectedTicket(): void {
    if (!this.selectedEvent) return;
    this.processingSelectedAction = true;
    this.clearMessages();
    this.ticketService.payForTicket(this.selectedEvent.id).subscribe({
      next: (ticket) => { this.selectedTicket = ticket; this.processingSelectedAction = false; this.successMessage = `Ticket ${ticket.ticketNumber} marked as paid.`; this.cdr.markForCheck(); },
      error: () => { this.processingSelectedAction = false; this.errorMessage = 'Failed to process payment.'; this.cdr.markForCheck(); },
    });
  }

  protected downloadSelectedTicket(): void {
    if (!this.selectedEvent || !this.selectedTicket) return;
    this.processingSelectedAction = true;
    this.clearMessages();
    this.ticketService.downloadTicketPdf(this.selectedEvent.id).subscribe({
      next: (blob) => { this.saveBlob(blob, `ticket-${this.selectedTicket?.ticketNumber}.pdf`); this.processingSelectedAction = false; this.cdr.markForCheck(); },
      error: () => { this.processingSelectedAction = false; this.errorMessage = 'Failed to download the ticket.'; this.cdr.markForCheck(); },
    });
  }
protected lookupAttendee(): void {
  if (!this.selectedEvent || !this.checkInInput.trim()) return;
  this.lookupResult = null;
  this.lookupError = '';
  this.lookupError = 'Attendee lookup is currently unavailable. Please check in manually.';
  this.cdr.markForCheck();
  return;
}

  protected checkInFromLookup(): void {
    if (!this.lookupResult) return;
    this.registrationService.checkIn(this.lookupResult.id).subscribe({
      next: (result) => {
        this.checkInResult = result as any;
        if (this.lookupResult) this.lookupResult = { ...this.lookupResult, status: 'PRESENT' } as any;
        this.cdr.markForCheck();
        if (this.selectedEvent) this.loadRegistrations(this.selectedEvent.id);
      },
      error: () => { this.lookupError = 'Check-in failed.'; this.cdr.markForCheck(); },
    });
  }

  protected openSpeakerForm(speaker?: Speaker): void {
    this.clearMessages();
    this.showSpeakerForm = true;
    this.editingSpeaker = speaker || null;
    if (speaker) {
      this.speakerForm.patchValue({ fullName: speaker.fullName, title: speaker.title || '', company: speaker.company || '', bio: speaker.bio || '', photoUrl: speaker.photoUrl || '', linkedinUrl: speaker.linkedinUrl || '' });
    } else {
      this.speakerForm.reset({ fullName: '', title: '', company: '', bio: '', photoUrl: '', linkedinUrl: '' });
    }
  }

  protected closeSpeakerForm(): void {
    this.showSpeakerForm = false;
    this.editingSpeaker = null;
  }

  protected submitSpeakerForm(): void {
    if (this.speakerForm.invalid) { this.speakerForm.markAllAsTouched(); return; }
    const payload: SpeakerRequest = this.speakerForm.getRawValue();
    this.savingSpeaker = true;
    this.clearMessages();
    const request$ = this.editingSpeaker
      ? this.speakerService.update(this.editingSpeaker.id, payload)
      : this.speakerService.create(payload);
    request$.subscribe({
      next: () => {
        this.savingSpeaker = false; this.showSpeakerForm = false;
        this.successMessage = this.editingSpeaker ? 'Speaker updated.' : 'Speaker created.';
        this.cdr.markForCheck(); this.loadSpeakers();
        if (this.selectedEvent) this.loadEventSpeakers(this.selectedEvent.id);
      },
      error: () => { this.savingSpeaker = false; this.errorMessage = 'Failed to save speaker.'; this.cdr.markForCheck(); },
    });
  }

  protected uploadSpeakerPhoto(event: globalThis.Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.editingSpeaker) return;
    this.speakerService.uploadPhoto(this.editingSpeaker.id, file).subscribe({
      next: (res) => { this.speakerForm.patchValue({ photoUrl: res.url }); this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Failed to upload speaker photo.'; this.cdr.markForCheck(); },
    });
  }

  protected deleteSpeaker(speaker: Speaker): void {
    if (!window.confirm(`Delete ${speaker.fullName}?`)) return;
    this.clearMessages();
    this.speakerService.delete(speaker.id).subscribe({
      next: () => {
        this.successMessage = 'Speaker deleted.'; this.cdr.markForCheck(); this.loadSpeakers();
        if (this.selectedEvent) this.loadEventSpeakers(this.selectedEvent.id);
      },
      error: () => { this.errorMessage = 'Failed to delete speaker.'; this.cdr.markForCheck(); },
    });
  }

  protected isSpeakerLinked(speaker: Speaker): boolean {
    return this.eventSpeakers.some((s) => s.id === speaker.id);
  }

  protected toggleSpeakerLink(speaker: Speaker): void {
    if (!this.selectedEvent) { this.errorMessage = 'Select an event first.'; return; }
    this.clearMessages();
    const wasLinked = this.isSpeakerLinked(speaker);
    if (wasLinked) {
      this.speakerService.unlinkFromEvent(this.selectedEvent.id, speaker.id).subscribe({
        next: () => {
          this.successMessage = 'Speaker unlinked.';
          this.cdr.markForCheck();
          this.loadEventSpeakers(this.selectedEvent!.id);
        },
        error: () => { this.errorMessage = 'Failed to update speaker assignment.'; this.cdr.markForCheck(); },
      });
      return;
    }

    this.speakerService.linkToEvent(this.selectedEvent.id, speaker.id).subscribe({
      next: () => {
        this.successMessage = 'Speaker linked.';
        this.cdr.markForCheck();
        this.loadEventSpeakers(this.selectedEvent!.id);
      },
      error: () => { this.errorMessage = 'Failed to update speaker assignment.'; this.cdr.markForCheck(); },
    });
  }

  protected openSlotForm(slot?: EventProgram): void {
    this.clearMessages();
    this.showSlotForm = true;
    this.editingSlot = slot || null;
    this.linkedinCandidates = [];
    if (slot) {
      this.slotForm.patchValue({ title: slot.title, description: slot.description || '', type: slot.type, startTime: this.toDatetimeLocal(slot.startTime), endTime: this.toDatetimeLocal(slot.endTime), orderIndex: slot.orderIndex, speakerId: slot.speakerId ?? null });
    } else {
      this.slotForm.reset({ title: '', description: '', type: 'PRESENTATION', startTime: '', endTime: '', orderIndex: this.program.length, speakerId: null });
    }
  }

  protected closeSlotForm(): void {
    this.showSlotForm = false;
    this.editingSlot = null;
    this.linkedinCandidates = [];
  }

  protected submitSlotForm(): void {
    if (!this.selectedEvent || this.slotForm.invalid) { this.slotForm.markAllAsTouched(); return; }
    const payload: EventProgramRequest = this.slotForm.getRawValue();
    this.savingSlot = true;
    this.clearMessages();
    const request$ = this.editingSlot
      ? this.programService.update(this.selectedEvent.id, this.editingSlot.id, payload)
      : this.programService.create(this.selectedEvent.id, payload);
    request$.subscribe({
      next: () => {
        this.savingSlot = false; this.showSlotForm = false;
        this.successMessage = this.editingSlot ? 'Program slot updated.' : 'Program slot created.';
        this.cdr.markForCheck(); this.loadProgram(this.selectedEvent!.id);
      },
      error: () => { this.savingSlot = false; this.errorMessage = 'Failed to save program slot.'; this.cdr.markForCheck(); },
    });
  }

  protected deleteSlot(slot: EventProgram): void {
    if (!this.selectedEvent || !window.confirm(`Delete "${slot.title}"?`)) return;
    this.clearMessages();
    this.programService.delete(this.selectedEvent.id, slot.id).subscribe({
      next: () => { this.successMessage = 'Program slot deleted.'; this.cdr.markForCheck(); this.loadProgram(this.selectedEvent!.id); },
      error: () => { this.errorMessage = 'Failed to delete slot.'; this.cdr.markForCheck(); },
    });
  }

  protected unassignSpeaker(slot: EventProgram): void {
    if (!this.selectedEvent) return;
    this.clearMessages();
    this.programService.unassignSpeaker(this.selectedEvent.id, slot.id).subscribe({
      next: () => { this.successMessage = 'Speaker removed from slot.'; this.cdr.markForCheck(); this.loadProgram(this.selectedEvent!.id); },
      error: () => { this.errorMessage = 'Failed to unassign speaker.'; this.cdr.markForCheck(); },
    });
  }

  protected generateProgram(): void {
    if (!this.selectedEvent) return;
    this.clearMessages();
    this.programService.generate(this.selectedEvent.id).subscribe({
      next: () => { this.successMessage = 'Program generated.'; this.cdr.markForCheck(); this.loadProgram(this.selectedEvent!.id); },
      error: () => { this.errorMessage = 'Failed to generate program.'; this.cdr.markForCheck(); },
    });
  }

  protected searchLinkedInCandidates(): void {
    const keyword = this.slotForm.get('title')?.value?.trim();
    if (!keyword) { this.errorMessage = 'Add a slot title before searching LinkedIn.'; return; }
    this.clearMessages();
    this.speakerService.searchLinkedIn(keyword).subscribe({
      next: (candidates) => { this.linkedinCandidates = candidates; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'LinkedIn search failed.'; this.cdr.markForCheck(); },
    });
  }

  protected importCandidate(candidate: SpeakerCandidate): void {
    this.clearMessages();
    this.speakerService.importOne(candidate).subscribe({
      next: (speaker) => { this.slotForm.patchValue({ speakerId: speaker.id }); this.successMessage = `Imported ${speaker.fullName}.`; this.cdr.markForCheck(); this.loadSpeakers(); },
      error: () => { this.errorMessage = 'Failed to import candidate.'; this.cdr.markForCheck(); },
    });
  }

  protected checkInRegistration(registration: EventRegistration): void {
    this.clearMessages();
    this.registrationService.checkIn(registration.id).subscribe({
      next: () => { this.successMessage = 'Participant checked in.'; this.cdr.markForCheck(); if (this.selectedEvent) this.loadRegistrations(this.selectedEvent.id); },
      error: () => { this.errorMessage = 'Failed to check in participant.'; this.cdr.markForCheck(); },
    });
  }

  
protected changeEventStatus(event: Event, status: EventStatus): void {
  this.clearMessages();
  // TODO: Implement this when the service method is available
  // For now, use the approve/reject/publish methods individually
  this.errorMessage = 'Direct status update is unavailable. Please use the specific action buttons.';
  this.cdr.markForCheck();
  return;
}

  protected canEditEvent(event: Event): boolean {
    // Mirrors backend EventService.EDITABLE_STATUSES — once approved / published
    // (or any status after), the event is locked from structural changes.
    return event.status === 'BROUILLON' || event.status === 'EN_ATTENTE_VALIDATION';
  }

  protected canDeleteEvent(event: Event): boolean {
    return this.isAdmin() && this.canEditEvent(event);
  }

  protected canSubmit(event: Event): boolean {
    if (event.status !== 'BROUILLON') return false;
    if (this.isAdmin()) return true;
    return event.organizerId === this.authService.getUserId() && this.authService.hasRole('MENTOR', 'PARTNER', 'PARTENAIRE');
  }

  protected canPublish(event: Event): boolean {
    if (this.isAdmin()) return !['PUBLIE', 'ANNULE', 'TERMINE'].includes(event.status);
    return event.organizerId === this.authService.getUserId() && event.status === 'APPROUVE';
  }

  protected canApprove(event: Event): boolean {
    return this.isAdmin() && !['PUBLIE', 'APPROUVE', 'ANNULE', 'TERMINE'].includes(event.status);
  }

  protected canReject(event: Event): boolean {
    return this.isAdmin() && !['PUBLIE', 'REJETE', 'ANNULE', 'TERMINE'].includes(event.status);
  }

  protected submitForValidation(event: Event): void {
    this.clearMessages();
    this.eventService.submit(event.id).subscribe({
      next: () => { this.successMessage = 'Event submitted for validation.'; this.cdr.markForCheck(); this.loadEvents(event.id); },
      error: () => { this.errorMessage = 'Failed to submit event.'; this.cdr.markForCheck(); },
    });
  }

  protected publishEvent(event: Event): void {
    this.clearMessages();
    this.eventService.publish(event.id).subscribe({
      next: () => { this.successMessage = 'Event published.'; this.cdr.markForCheck(); this.loadEvents(event.id); if (this.isAdmin()) this.loadPending(); },
      error: () => { this.errorMessage = 'Failed to publish event.'; this.cdr.markForCheck(); },
    });
  }

  protected approveEvent(event: Event): void {
    this.clearMessages();
    this.eventService.approve(event.id).subscribe({
      next: () => { this.successMessage = 'Event approved.'; this.cdr.markForCheck(); this.loadEvents(event.id); this.loadPending(); },
      error: () => { this.errorMessage = 'Failed to approve event.'; this.cdr.markForCheck(); },
    });
  }

  protected rejectEvent(event: Event): void {
    const reason = window.prompt(`Why are you rejecting "${event.title}"?`, 'Needs revision');
    if (!reason?.trim()) return;
    this.clearMessages();
    this.eventService.reject(event.id, reason.trim()).subscribe({
      next: () => { this.successMessage = 'Event rejected.'; this.cdr.markForCheck(); this.loadEvents(event.id); this.loadPending(); },
      error: () => { this.errorMessage = 'Failed to reject event.'; this.cdr.markForCheck(); },
    });
  }

  protected deleteEvent(event: Event): void {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    this.clearMessages();
    this.eventService.delete(event.id).subscribe({
      next: () => {
        this.successMessage = 'Event deleted.';
        if (this.selectedEvent?.id === event.id) {
          this.selectedEvent = null; this.selectedRegistration = null; this.selectedTicket = null;
          this.program = []; this.registrations = []; this.eventSpeakers = [];
        }
        this.cdr.markForCheck(); this.loadEvents();
        if (this.isAdmin()) this.loadPending();
      },
      error: () => { this.errorMessage = 'Failed to delete event.'; this.cdr.markForCheck(); },
    });
  }

  // Feedback methods
  protected setFeedbackRating(star: number): void {
    this.feedbackRating = star;
  }

  protected feedbackRatingLabel(rating: number): string {
    const labels: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };
    return labels[Math.round(rating)] || '';
  }

  protected feedbackDistributionPct(star: number): number {
    if (!this.feedbackStats || this.feedbackStats.totalCount === 0) return 0;
    return Math.round(((this.feedbackStats.distribution[star] || 0) / this.feedbackStats.totalCount) * 100);
  }

  protected feedbackAvatarColor(userId: number): string {
    const colors = ['#1C4FC3', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
    return colors[userId % colors.length];
  }

  protected feedbackInitials(name: string): string {
    return name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  }

  private loadFeedback(eventId: number): void {
    this.loadingFeedback = true;
    const list$ = this.feedbackService.getByEvent(eventId);
    const stats$ = this.feedbackService.getStats(eventId);
    const eligibility$ = this.authService.isLoggedIn()
      ? this.feedbackService.getEligibility(eventId)
      : null;

    forkJoin({
      list: list$,
      stats: stats$,
      ...(eligibility$ ? { eligibility: eligibility$ } : {}),
    }).subscribe({
      next: (res: any) => {
        this.feedbackList = res.list;
        this.feedbackStats = res.stats;
        this.feedbackEligibility = res.eligibility ?? null;
        this.myFeedback = this.feedbackList.find((f) => f.own) ?? null;
        this.loadingFeedback = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingFeedback = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected submitFeedback(): void {
    if (!this.selectedEvent || this.feedbackRating === 0) return;
    this.submittingFeedback = true;
    this.feedbackError = '';
    this.feedbackService.submit(this.selectedEvent.id, {
      rating: this.feedbackRating,
      comment: this.feedbackComment,
    }).subscribe({
      next: (feedback) => {
        const item: FeedbackItem = { ...feedback, comment: feedback.comment ?? '' };
        this.myFeedback = item;
        this.feedbackList = [item, ...this.feedbackList.filter((f) => !f.own)];
        if (this.feedbackEligibility) {
          this.feedbackEligibility = { canSubmit: false, hasSubmitted: true };
        }
        this.submittingFeedback = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.feedbackError = err?.error?.message || 'Failed to submit feedback. Please try again.';
        this.submittingFeedback = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected typeBg(type: string): string {
    const m: Record<string, string> = {
      PITCH: 'var(--badge-purple-bg)', WORKSHOP: 'var(--badge-blue-bg)',
      WEBINAIRE: 'var(--badge-green-bg)', BOOTCAMP: 'var(--badge-amber-bg)', CONFERENCE: 'var(--badge-red-bg)',
    };
    return m[type] ?? 'var(--badge-neutral-bg)';
  }

  protected typeColor(type: string): string {
    const m: Record<string, string> = {
      PITCH: 'var(--badge-purple-text)', WORKSHOP: 'var(--badge-blue-text)',
      WEBINAIRE: 'var(--badge-green-text)', BOOTCAMP: 'var(--badge-amber-text)', CONFERENCE: 'var(--badge-red-text)',
    };
    return m[type] ?? 'var(--badge-neutral-text)';
  }

  protected fillRate(event: Event): number {
    if (!event.capacityMax) return 0;
    return Math.round((event.registeredCount / event.capacityMax) * 100);
  }

  protected statusTone(status: EventStatus): { bg: string; fg: string } {
    switch (status) {
      case 'PUBLIE':
      case 'APPROUVE':
        return { bg: 'var(--badge-green-bg)', fg: 'var(--badge-green-text)' };
      case 'EN_ATTENTE_VALIDATION':
        return { bg: 'var(--badge-amber-bg)', fg: 'var(--badge-amber-text)' };
      case 'REJETE':
      case 'ANNULE':
        return { bg: 'var(--badge-red-bg)', fg: 'var(--badge-red-text)' };
      default:
        return { bg: 'var(--badge-purple-bg)', fg: 'var(--badge-purple-text)' };
    }
  }

  protected formatDateTime(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  protected formatTime(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  protected formatDatePart(value: string | null, part: 'day' | 'month' | 'year'): string {
    if (!value) return '—';
    const date = new Date(value);
    switch (part) {
      case 'day': return String(date.getDate()).padStart(2, '0');
      case 'month': return date.toLocaleString('en-GB', { month: 'short' });
      case 'year': return String(date.getFullYear());
    }
  }

  protected defaultCover(event: Event): string {
    return `https://picsum.photos/seed/event-${event.id}/800/420`;
  }

  protected inputValue(event: globalThis.Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  private loadEvents(selectId?: number): void {
    this.loadingEvents = true;
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = this.canCreate() ? events : events.filter((e) => e.status === 'PUBLIE');
        this.loadingEvents = false;
        this.cdr.markForCheck();
        if (selectId) {
          const next = this.events.find((e) => e.id === selectId);
          if (next) this.selectEvent(next);
        }
      },
      error: () => { this.loadingEvents = false; this.errorMessage = 'Failed to load events.'; this.cdr.markForCheck(); },
    });
  }

  private loadPending(): void {
    this.loadingPending = true;
    this.eventService.getPending().subscribe({
      next: (events) => { this.pendingEvents = events; this.loadingPending = false; this.cdr.markForCheck(); },
      error: () => { this.loadingPending = false; this.cdr.markForCheck(); },
    });
  }

  private loadMyRegistrations(selectEventId?: number): void {
    this.registrationService.getMyRegistrations().subscribe({
      next: (registrations) => {
        this.myRegistrations = registrations.filter((r) => r.status !== 'ANNULE');
        this.cdr.markForCheck();
        if (selectEventId) {
          this.selectedRegistration = this.myRegistrations.find((r) => r.eventId === selectEventId) || null;
          if (this.selectedRegistration?.status === 'INSCRIT' || this.selectedRegistration?.status === 'PRESENT') {
            this.loadSelectedTicket(selectEventId);
          }
        }
      },
    });
  }

  private loadSpeakers(): void {
    this.speakerService.getAll().subscribe({
      next: (speakers) => { this.speakers = speakers; this.cdr.markForCheck(); },
      error: () => { this.errorMessage = 'Failed to load speakers.'; this.cdr.markForCheck(); },
    });
  }

  private loadEventWorkspace(eventId: number): void {
    forkJoin({
      speakers: this.speakerService.getByEvent(eventId),
      program: this.programService.getByEvent(eventId),
      registrations: this.registrationService.getByEvent(eventId),
    }).subscribe({
      next: ({ speakers, program, registrations }) => {
        this.eventSpeakers = speakers;
        this.program = [...program].sort((l, r) => l.orderIndex - r.orderIndex);
        this.registrations = registrations;
        this.cdr.markForCheck();
        if (this.selectedRegistration?.status === 'INSCRIT' || this.selectedRegistration?.status === 'PRESENT') {
          this.loadSelectedTicket(eventId);
        }
      },
      error: () => { this.errorMessage = 'Failed to load event details.'; this.cdr.markForCheck(); },
    });
  }

  private loadEventSpeakers(eventId: number): void {
    this.speakerService.getByEvent(eventId).subscribe({
      next: (speakers) => { this.eventSpeakers = speakers; this.cdr.markForCheck(); },
    });
  }

  private loadProgram(eventId: number): void {
    this.programService.getByEvent(eventId).subscribe({
      next: (program) => { this.program = [...program].sort((l, r) => l.orderIndex - r.orderIndex); this.cdr.markForCheck(); },
    });
  }

  private loadRegistrations(eventId: number): void {
    this.registrationService.getByEvent(eventId).subscribe({
      next: (registrations) => { this.registrations = registrations; this.cdr.markForCheck(); },
    });
  }

  private loadSelectedTicket(eventId: number): void {
    this.ticketService.getMyTicket(eventId).subscribe({
      next: (ticket) => { this.selectedTicket = ticket; this.cdr.markForCheck(); },
    });
  }

  private toDatetimeLocal(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (p: number) => String(p).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}