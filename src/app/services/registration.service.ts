import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventRegistration, RegistrationStatus } from '../models/registration';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly api = `${EVENT_API_BASE}/events`;

  constructor(private readonly http: HttpClient) {}

  register(eventId: number, numberOfPlaces = 1): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.api}/${eventId}/register`, { numberOfPlaces });
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

  approve(registrationId: number): Observable<EventRegistration> {
    return this.http.patch<EventRegistration>(`${this.api}/registrations/${registrationId}/approve`, {});
  }

  reject(registrationId: number, reason = ''): Observable<EventRegistration> {
    return this.http.patch<EventRegistration>(`${this.api}/registrations/${registrationId}/reject`, { reason });
  }

  getAllRegistrations(eventId?: number, status?: RegistrationStatus): Observable<EventRegistration[]> {
    let params = new HttpParams();
    if (eventId != null) params = params.set('eventId', String(eventId));
    if (status != null) params = params.set('status', status);
    return this.http.get<EventRegistration[]>(`${this.api}/registrations`, { params });
  }
}
