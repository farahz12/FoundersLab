import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventProgram, EventProgramRequest } from '../models/program';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private readonly api = `${EVENT_API_BASE}/events`;

  constructor(private readonly http: HttpClient) {}

  getByEvent(eventId: number): Observable<EventProgram[]> {
    return this.http.get<EventProgram[]>(`${this.api}/${eventId}/program`);
  }

  create(eventId: number, request: EventProgramRequest): Observable<EventProgram> {
    return this.http.post<EventProgram>(`${this.api}/${eventId}/program`, request);
  }

  update(eventId: number, slotId: number, request: EventProgramRequest): Observable<EventProgram> {
    return this.http.put<EventProgram>(`${this.api}/${eventId}/program/${slotId}`, request);
  }

  delete(eventId: number, slotId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${eventId}/program/${slotId}`);
  }

  generate(eventId: number): Observable<EventProgram[]> {
    return this.http.post<EventProgram[]>(`${this.api}/${eventId}/program/generate`, {});
  }

  unassignSpeaker(eventId: number, slotId: number): Observable<EventProgram> {
    return this.http.delete<EventProgram>(`${this.api}/${eventId}/program/${slotId}/speaker`);
  }
}
