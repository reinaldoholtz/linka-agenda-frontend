import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface ReserveAppointmentRequest {
  token: string;
  professionalId: number;
  professionalName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
}

export interface AppointmentResult {
  id: string;
  service: string;
  professionalId: number;
  professionalName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reservationExpiresAt: string | null;
}

/**
 * Consome POST /api/appointments/reserve. O backend valida o token, confere
 * conflitos e a disponibilidade real (Z-PRO + Google Calendar) antes de
 * bloquear o horário temporariamente (regra 33.12 — backend é a autoridade).
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {

  constructor(private readonly http: HttpClient) {}

  reserve(request: ReserveAppointmentRequest): Observable<ApiResponse<AppointmentResult>> {
    return this.http.post<ApiResponse<AppointmentResult>>(
      `${environment.apiBaseUrl}/appointments/reserve`,
      request
    );
  }
}
