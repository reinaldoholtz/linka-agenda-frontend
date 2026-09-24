// import { TestBed } from '@angular/core/testing';
// import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
// import { provideHttpClient } from '@angular/common/http';
// import { BookingLinkApiService } from './booking-link-api.service';
// import { environment } from '../../../environments/environment';

// describe('BookingLinkApiService', () => {
//   let service: BookingLinkApiService;
//   let httpMock: HttpTestingController;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [provideHttpClient(), provideHttpClientTesting()],
//     });
//     service = TestBed.inject(BookingLinkApiService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('deve chamar GET /booking-links/validate/{token}', () => {
//     service.validate('meu-token').subscribe((response) => {
//       expect(response.success).toBeTrue();
//       expect(response.data?.valid).toBeTrue();
//     });

//     const req = httpMock.expectOne(`${environment.apiBaseUrl}/booking-links/validate/meu-token`);
//     expect(req.request.method).toBe('GET');
//     req.flush({
//       success: true,
//       data: { valid: true, name: 'João', phoneNumber: '5511999999999', expiresAt: '2026-09-18T12:00:00Z' },
//       message: null,
//     });
//   });
// });
