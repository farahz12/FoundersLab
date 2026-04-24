import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventRegistration } from '../models/registration';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly api = `${EVENT_API_BASE}/events`;

  constructor(private readonly http: HttpClient) {}

  register(eventId: number): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.api}/${eventId}/register`, {});
  }

  cancel(eventId: number): Observable<EventRegistration> {
    return this.http.delete<EventRegistration>(`${this.api}/${eventId}/register`);
  }

  getByEvent(eventId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.api}/${eventId}/registrations`);
  }

  getMyRegistrations(): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.api}/my-registrations`);
  }

  checkIn(registrationId: number): Observable<EventRegistration> {
    return this.http.patch<EventRegistration>(`${this.api}/registrations/${registrationId}/checkin`, {});
  }
}
