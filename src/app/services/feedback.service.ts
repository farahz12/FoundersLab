import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback, FeedbackEligibility, FeedbackRequest, FeedbackStats } from '../models/feedback';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  constructor(private readonly http: HttpClient) {}

  private base(eventId: number) {
    return `${EVENT_API_BASE}/events/${eventId}/feedback`;
  }

  submit(eventId: number, request: FeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.base(eventId), request);
  }

  getByEvent(eventId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.base(eventId));
  }

  getStats(eventId: number): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(`${this.base(eventId)}/stats`);
  }

  getEligibility(eventId: number): Observable<FeedbackEligibility> {
    return this.http.get<FeedbackEligibility>(`${this.base(eventId)}/eligibility`);
  }
}
