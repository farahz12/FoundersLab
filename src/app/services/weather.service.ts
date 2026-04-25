import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeatherData } from '../models/weather.model';
import { EVENT_API_BASE } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly api = `${EVENT_API_BASE}/weather`;

  constructor(private readonly http: HttpClient) {}

  getWeather(lat: number, lon: number, date: string): Observable<WeatherData> {
    return this.http
      .get<WeatherData>(this.api, {
        params: { lat: String(lat), lon: String(lon), date },
      })
      .pipe(
        catchError(() =>
          of({ available: false, reason: 'Weather service unavailable' } as WeatherData)
        )
      );
  }
}
