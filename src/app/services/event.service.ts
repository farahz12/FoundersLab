import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventMapMarker, EventRequest, EventStatus, EventType, UpdateEventRequest } from '../models/event';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly api = `${EVENT_API_BASE}/events`;

  constructor(private readonly http: HttpClient) {}

  getAll(filters?: { status?: EventStatus; type?: EventType; organizerId?: number }): Observable<Event[]> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.organizerId) {
      params = params.set('organizerId', String(filters.organizerId));
    }

    return this.http.get<Event[]>(this.api, { params });
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.api}/${id}`);
  }

  create(event: EventRequest): Observable<Event> {
    return this.http.post<Event>(this.api, event);
  }

  update(id: number, event: UpdateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.api}/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  submit(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.api}/${id}/submit`, {});
  }

  publish(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.api}/${id}/publish`, {});
  }

  getPending(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.api}/pending`);
  }

  approve(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.api}/${id}/approve`, {});
  }

  reject(id: number, reason: string): Observable<Event> {
    return this.http.patch<Event>(`${this.api}/${id}/reject`, { rejectionReason: reason });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.api}/upload-image`, formData);
  }

  generateDescription(title: string, date: string, eventType?: string): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(`${this.api}/generate-description`, {
      title,
      date,
      eventType,
    });
  }

  getEventsForMap(): Observable<EventMapMarker[]> {
    return this.http.get<EventMapMarker[]>(`${this.api}/map`);
  }
}
