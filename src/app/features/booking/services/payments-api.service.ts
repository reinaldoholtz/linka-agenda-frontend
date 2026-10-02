import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AvailablePaymentMethodsResponse, PaymentConfirmation, PaymentDetails } from '../models/booking.model';

export interface CreatePaymentRequest extends PaymentDetails {
  token: string;
  appointmentId: string;
}

export interface CreatePaymentResult {
  id: string;
  appointmentId: string;
  amount: number;
  paymentMethod: string;
  gateway: string;
  status: string;
  invoiceUrl: string | null;
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


  getAvailablePaymentMethods(appointmentId: string): Observable<AvailablePaymentMethodsResponse> {
    return this.http.get<AvailablePaymentMethodsResponse>(
      `${environment.apiBaseUrl}/payments/methods/${appointmentId}`
    );
  }

  confirmStripePayment(  sessionId: string): Observable<ApiResponse<PaymentConfirmation>> {
      return this.http.get<ApiResponse<PaymentConfirmation>>(
        `${environment.apiBaseUrl}/payments/stripe/confirm/${sessionId}`
      );
  }
}
