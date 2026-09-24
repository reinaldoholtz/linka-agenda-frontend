import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PaymentDetails } from '../models/booking.model';

export interface CreatePaymentRequest extends PaymentDetails {
  token: string;
  appointmentId: string;
}

export interface CreatePaymentResult {
  paymentId: string;
  status: string;
}

/**
 * Consome POST /api/payments. O frontend nunca recebe a API Key do Asaas
 * nem fala diretamente com o gateway de pagamento (regra 33.1/33.3).
 * Endpoint da fase 2 do backend.
 */
@Injectable({ providedIn: 'root' })
export class PaymentsApiService {

  constructor(private readonly http: HttpClient) {}

  create(request: CreatePaymentRequest): Observable<ApiResponse<CreatePaymentResult>> {
    return this.http.post<ApiResponse<CreatePaymentResult>>(
      `${environment.apiBaseUrl}/payments`,
      request
    );
  }
}
