import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventType, LocationType } from '../models/event';
import { EVENT_API_BASE } from '../core/config/api.config';

export interface PredictionInput {
  event_type: number;
  location_type: number;
  capacity_max: number;
  ticket_price: number;
  speaker_count: number;
  program_slots_count: number;
  sector_count: number;
  stage_count: number;
  day_of_week: number;
  month: number;
  hour_of_day: number;
  days_published_before_event: number;
}

export interface RegistrationPrediction {
  predicted_registrations: number;
}

export interface SuccessPrediction {
  success_score: number;
  label: string;
}

// ── Full analysis ────────────────────────────────────────────────────────────

export interface RegistrationEstimate {
  min: number;
  max: number;
  pointEstimate: number;
  confidence: number;
}

export interface OptimalSlot {
  dayName: string;
  timeWindow: string;
  boostVsAverage: number;
}

export interface ConflictWarning {
  eventTitle: string;
  eventDate: string;
  eventType: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FullAnalysisResult {
  registrationEstimate: RegistrationEstimate;
  optimalSlot: OptimalSlot;
  conflicts: ConflictWarning[];
  suggestedCapacity: number;
  successScore: number;
  label: string;
}

export interface EventPredictionFormInput {
  type: EventType;
  locationType: LocationType;
  capacityMax: number | null;
  ticketPrice: number | null;
  startDate: string;
  speakerCount?: number;
  programSlotsCount?: number;
  sectorCount?: number;
  stageCount?: number;
  daysPublishedBeforeEvent?: number;
}

const EVENT_TYPE_MAP: Record<EventType, number> = {
  WEBINAIRE: 0,
  WORKSHOP: 1,
  CONFERENCE: 2,
  PITCH: 3,
  BOOTCAMP: 4,
};

const LOCATION_TYPE_MAP: Record<LocationType, number> = {
  PRESENTIEL: 0,
  DISTANCIEL: 1,
  HYBRIDE: 0,
};

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly mlApi = 'http://localhost:8085';
  private readonly eventApi = `${EVENT_API_BASE}/events/predict`;

  constructor(private readonly http: HttpClient) {}

  predictRegistrations(payload: PredictionInput): Observable<RegistrationPrediction> {
    return this.http.post<RegistrationPrediction>(`${this.mlApi}/predict/registrations`, payload);
  }

  predictSuccessScore(payload: PredictionInput): Observable<SuccessPrediction> {
    return this.http.post<SuccessPrediction>(`${this.mlApi}/predict/success-score`, payload);
  }

  /** Full structured analysis via event-pi backend (ML + conflict detection) */
  analyzeEvent(input: EventPredictionFormInput): Observable<FullAnalysisResult> | null {
    const base = this.buildPayload(input);
    if (!base) return null;

    const body = {
      ...base,
      proposed_date: input.startDate,
      event_type_code: input.type,
    };
    return this.http.post<FullAnalysisResult>(`${this.eventApi}/full-analysis`, body);
  }

  buildPayload(input: EventPredictionFormInput): PredictionInput | null {
    if (!input.type || !input.locationType || !input.startDate || !input.capacityMax) {
      return null;
    }

    const start = new Date(input.startDate);
    if (isNaN(start.getTime())) return null;

    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysPublished =
      input.daysPublishedBeforeEvent ??
      Math.max(0, Math.round((start.getTime() - now.getTime()) / msPerDay));

    const jsDow = start.getDay();
    const dayOfWeek = (jsDow + 6) % 7; // 0=Monday..6=Sunday

    return {
      event_type: EVENT_TYPE_MAP[input.type] ?? 0,
      location_type: LOCATION_TYPE_MAP[input.locationType] ?? 0,
      capacity_max: Math.max(1, Number(input.capacityMax)),
      ticket_price: Number(input.ticketPrice ?? 0),
      speaker_count: Number(input.speakerCount ?? 0),
      program_slots_count: Number(input.programSlotsCount ?? 0),
      sector_count: Number(input.sectorCount ?? 0),
      stage_count: Number(input.stageCount ?? 0),
      day_of_week: dayOfWeek,
      month: start.getMonth() + 1,
      hour_of_day: start.getHours(),
      days_published_before_event: daysPublished,
    };
  }
}
