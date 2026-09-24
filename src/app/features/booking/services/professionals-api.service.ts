import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Professional } from '../models/booking.model';

/**
 * Consome GET /api/professionals no Backend Agenda, que por sua vez
 * consulta a API externa do Z-PRO (listUsers). O Angular nunca chama
 * a API do Z-PRO diretamente (regra 33.1 da especificação).
 *
 * Este endpoint faz parte da fase 2 do backend; o serviço já está
 * preparado para quando a integração Z-PRO for implementada.
 */
@Injectable({ providedIn: 'root' })
export class ProfessionalsApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}/professionals`;

  constructor(private readonly http: HttpClient) {}

  listForService(serviceId: string): Observable<ApiResponse<Professional[]>> {
    return this.http.get<ApiResponse<Professional[]>>(this.baseUrl, {
      params: { serviceId },
    });
  }
}
