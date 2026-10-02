import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { BusinessHour } from '../models/booking.model';

export interface AvailableDay {
  date: string;
  slots: string[];
}

/**
 * Consome POST /api/professionals/{id}/availability. O backend é responsável
 * por consultar o Google Calendar e cruzar com os horários de trabalho do
 * profissional (regra 33.1/33.2 — Angular não fala com o Google Calendar).
 * Endpoint da fase 2 do backend.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityApiService {

  constructor(private readonly http: HttpClient) {}

  getAvailability(token: string, professionalEmail: string,businessHours: BusinessHour[]
  ): Observable<ApiResponse<AvailableDay[]>> {

    console.log('📧 Professional Email:', professionalEmail);
    console.log('🔑 Booking Token:', token);
    console.log('🕐 Business Hours:', businessHours);

    return this.http.post<ApiResponse<AvailableDay[]>>(
      `${environment.apiBaseUrl}/professionals/${professionalEmail}/availability`,
      {  token, businessHours }
    );
  }
}
