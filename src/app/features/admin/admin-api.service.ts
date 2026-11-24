import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminProfessional, AdminProfessionalInput, AdminService, AdminServiceInput, GoogleAccountOption } from './admin-catalog.model';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface TenantConfig {
  id: number;
  tenantName: string;
  tenantId: string;
  tenantGateway: 'ASAAS' | 'STRIPE';
  timeZone: string;
  phoneNumberChannel: string | null;
  apiIdLinka: string | null;
  googleAuthMode: 'SERVICE_ACCOUNT' | 'OAUTH_LINKA';
  paymentRequired: boolean;
  apiBearerLinkaConfigured: boolean;
  stripeApiKeyConfigured: boolean;
  stripeWebhookSecretConfigured: boolean;
  agentSecretConfigured: boolean;
  paymentLinkExpirationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantConfigInput {
  tenantName: string;
  tenantId: string;
  tenantGateway: 'ASAAS' | 'STRIPE';
  timeZone: string;
  phoneNumberChannel: string;
  apiIdLinka: string;
  googleAuthMode: 'SERVICE_ACCOUNT' | 'OAUTH_LINKA';
  paymentRequired: boolean;
  apiBearerLinka?: string;
  stripeApiKey?: string;
  stripeWebhookSecret?: string;
}

export interface TenantPage {
  content: TenantConfig[];
  number: number;
  totalPages: number;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin`;
  private readonly options = { withCredentials: true };

  private csrf(): Observable<string> {
    return this.http.get<ApiEnvelope<{ token: string }>>(`${this.base}/csrf`, this.options)
      .pipe(map((response) => response.data.token));
  }

  private write<T>(method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Observable<T> {
    return this.csrf().pipe(switchMap((token) => this.http.request<T>(method, `${this.base}${path}`, {
      body,
      withCredentials: true,
      headers: { 'X-CSRF-TOKEN': token },
    })));
  }

  login(username: string, password: string): Observable<ApiEnvelope<string>> {
    const body = new URLSearchParams({ username, password }).toString();
    return this.csrf().pipe(switchMap((token) =>
      this.http.post<ApiEnvelope<string>>(`${this.base}/login`, body, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-TOKEN': token },
      })));
  }

  me(): Observable<ApiEnvelope<{ username: string }>> {
    return this.http.get<ApiEnvelope<{ username: string }>>(`${this.base}/me`, this.options);
  }

  logout(): Observable<ApiEnvelope<string>> {
    return this.write<ApiEnvelope<string>>('POST', '/logout');
  }

  list(search: string, page: number): Observable<ApiEnvelope<TenantPage>> {
    return this.http.get<ApiEnvelope<TenantPage>>(`${this.base}/tenants`, {
      withCredentials: true,
      params: { search, page, size: 10 },
    });
  }

  get(id: string): Observable<ApiEnvelope<TenantConfig>> {
    return this.http.get<ApiEnvelope<TenantConfig>>(`${this.base}/tenants/${encodeURIComponent(id)}`, this.options);
  }

  create(input: TenantConfigInput): Observable<ApiEnvelope<TenantConfig>> {
    return this.write<ApiEnvelope<TenantConfig>>('POST', '/tenants', input);
  }

  update(id: string, input: TenantConfigInput): Observable<ApiEnvelope<TenantConfig>> {
    return this.write<ApiEnvelope<TenantConfig>>('PUT', `/tenants/${encodeURIComponent(id)}`, input);
  }

  delete(id: string): Observable<void> {
    return this.write<void>('DELETE', `/tenants/${encodeURIComponent(id)}`);
  }

  listServices(tenantId: string): Observable<ApiEnvelope<AdminService[]>> {
    return this.http.get<ApiEnvelope<AdminService[]>>(`${this.base}/tenants/${encodeURIComponent(tenantId)}/services`, this.options);
  }

  createService(tenantId: string, input: AdminServiceInput): Observable<ApiEnvelope<AdminService>> {
    return this.write<ApiEnvelope<AdminService>>('POST', `/tenants/${encodeURIComponent(tenantId)}/services`, input);
  }

  updateService(tenantId: string, id: number, input: AdminServiceInput): Observable<ApiEnvelope<AdminService>> {
    return this.write<ApiEnvelope<AdminService>>('PUT', `/tenants/${encodeURIComponent(tenantId)}/services/${id}`, input);
  }

  deleteService(tenantId: string, id: number): Observable<void> {
    return this.write<void>('DELETE', `/tenants/${encodeURIComponent(tenantId)}/services/${id}`);
  }

  listProfessionals(tenantId: string): Observable<ApiEnvelope<AdminProfessional[]>> {
    return this.http.get<ApiEnvelope<AdminProfessional[]>>(`${this.base}/tenants/${encodeURIComponent(tenantId)}/professionals`, this.options);
  }

  listGoogleAccounts(tenantId: string): Observable<ApiEnvelope<GoogleAccountOption[]>> {
    return this.http.get<ApiEnvelope<GoogleAccountOption[]>>(
      `${this.base}/tenants/${encodeURIComponent(tenantId)}/google-accounts`, this.options);
  }

  createProfessional(tenantId: string, input: AdminProfessionalInput): Observable<ApiEnvelope<AdminProfessional>> {
    return this.write<ApiEnvelope<AdminProfessional>>('POST', `/tenants/${encodeURIComponent(tenantId)}/professionals`, input);
  }

  updateProfessional(tenantId: string, id: number, input: AdminProfessionalInput): Observable<ApiEnvelope<AdminProfessional>> {
    return this.write<ApiEnvelope<AdminProfessional>>('PUT', `/tenants/${encodeURIComponent(tenantId)}/professionals/${id}`, input);
  }

  deleteProfessional(tenantId: string, id: number): Observable<void> {
    return this.write<void>('DELETE', `/tenants/${encodeURIComponent(tenantId)}/professionals/${id}`);
  }

  updateAgentSettings(tenantId: string, minutes: number): Observable<ApiEnvelope<TenantConfig>> {
    return this.write<ApiEnvelope<TenantConfig>>('PUT',
      `/tenants/${encodeURIComponent(tenantId)}/agent-settings`, { paymentLinkExpirationMinutes: minutes });
  }

  generateAgentSecret(tenantId: string): Observable<ApiEnvelope<{ secret: string }>> {
    return this.write<ApiEnvelope<{ secret: string }>>('POST', `/tenants/${encodeURIComponent(tenantId)}/agent-secret`);
  }

  revokeAgentSecret(tenantId: string): Observable<void> {
    return this.write<void>('DELETE', `/tenants/${encodeURIComponent(tenantId)}/agent-secret`);
  }
}
