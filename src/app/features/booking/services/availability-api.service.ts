import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface AvailableDay {
  date: string;
  slots: string[];
}

/**
 * Consome GET /api/professionals/{id}/availability. O backend é responsável
 * por consultar o Google Calendar e cruzar com os horários de trabalho do
 * profissional (regra 33.1/33.2 — Angular não fala com o Google Calendar).
 * Endpoint da fase 2 do backend.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityApiService {

  constructor(private readonly http: HttpClient) {}

  getAvailability(professionalId: number): Observable<ApiResponse<AvailableDay[]>> {
    return this.http.get<ApiResponse<AvailableDay[]>>(
      `${environment.apiBaseUrl}/professionals/${professionalId}/availability`
    );
  }
}
