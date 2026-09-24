import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ValidateBookingLinkResult } from '../models/booking-link.model';

@Injectable({ providedIn: 'root' })
export class BookingLinkApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}/booking-links`;

  constructor(private readonly http: HttpClient) {}

  validate(token: string): Observable<ApiResponse<ValidateBookingLinkResult>> {
    return this.http.get<ApiResponse<ValidateBookingLinkResult>>(
      `${this.baseUrl}/validate/${encodeURIComponent(token)}`
    );
  }
}
