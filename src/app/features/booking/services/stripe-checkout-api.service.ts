import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface CreateStripeCheckoutRequest {
  paymentId: string;
  appointmentId: string;
  email: string;
}

export interface CreateStripeCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

@Injectable({ providedIn: 'root' })
export class StripeCheckoutApiService {

  constructor(private readonly http: HttpClient) {}

  createCheckoutSession(
    request: CreateStripeCheckoutRequest
  ): Observable<ApiResponse<CreateStripeCheckoutResult>> {
    return this.http.post<ApiResponse<CreateStripeCheckoutResult>>(
      `${environment.apiBaseUrl}/checkout/create-session`,
      request
    );
  }
}
