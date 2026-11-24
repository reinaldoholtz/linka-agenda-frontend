import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminApiService } from './admin-api.service';
import { environment } from '../../../environments/environment';

describe('AdminApiService', () => {
  let api: AdminApiService;
  let http: HttpTestingController;
  const base = `${environment.apiBaseUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(AdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtém CSRF e envia login com cookie e cabeçalho, sem senha na URL', () => {
    let authenticated = false;
    api.login('admin', 'senha-ficticia').subscribe(() => authenticated = true);

    const csrf = http.expectOne(`${base}/csrf`);
    expect(csrf.request.method).toBe('GET');
    expect(csrf.request.withCredentials).toBeTrue();
    csrf.flush({ success: true, data: { token: 'csrf-ficticio' }, message: null });

    const login = http.expectOne(`${base}/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.withCredentials).toBeTrue();
    expect(login.request.headers.get('X-CSRF-TOKEN')).toBe('csrf-ficticio');
    expect(login.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(login.request.body).toContain('password=senha-ficticia');
    login.flush({ success: true, data: 'admin', message: null });
    expect(authenticated).toBeTrue();
  });

  it('exige CSRF para exclusão', () => {
    api.delete('tenant com espaço').subscribe();
    http.expectOne(`${base}/csrf`).flush({ success: true, data: { token: 'csrf-ficticio' }, message: null });
    const remove = http.expectOne(`${base}/tenants/tenant%20com%20espa%C3%A7o`);
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.withCredentials).toBeTrue();
    expect(remove.request.headers.get('X-CSRF-TOKEN')).toBe('csrf-ficticio');
    remove.flush(null);
  });

  it('consulta contas Google do tenant pela sessão administrativa', () => {
    api.listGoogleAccounts('tenant 1').subscribe(({ data }) => {
      expect(data[0].id).toBe('10');
      expect(data[0].email).toBe('one@example.com');
    });
    const request = http.expectOne(`${base}/tenants/tenant%201/google-accounts`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ success: true, data: [{ id: '10', email: 'one@example.com', isActive: true,
      isDefault: false, connected: true, authExpired: false, selectable: true }], message: null });
  });
});
