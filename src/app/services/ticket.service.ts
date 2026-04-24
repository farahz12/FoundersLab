import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = EVENT_API_BASE;

  constructor(private readonly http: HttpClient) {}

  getMyTicket(eventId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.api}/events/${eventId}/my-ticket`);
  }

  downloadTicketPdf(eventId: number): Observable<Blob> {
    return this.http.get(`${this.api}/events/${eventId}/my-ticket/download`, {
      responseType: 'blob',
    });
  }

  payForTicket(eventId: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.api}/events/${eventId}/pay`, {});
  }

  verifyTicket(ticketNumber: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.api}/tickets/${ticketNumber}/verify`);
  }

  checkInByTicket(ticketNumber: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.api}/tickets/${ticketNumber}/checkin`, {});
  }
}
