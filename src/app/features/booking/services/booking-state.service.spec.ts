// import { TestBed } from '@angular/core/testing';
// import { BookingStateService } from './booking-state.service';

// describe('BookingStateService', () => {
//   let service: BookingStateService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(BookingStateService);
//   });

//   it('deve armazenar o token do link', () => {
//     service.setToken('abc123');
//     expect(service.token()).toBe('abc123');
//   });

//   it('deve armazenar nome e telefone do cliente validado', () => {
//     service.setValidatedCustomer('João Silva', '5511999999999');
//     expect(service.customerName()).toBe('João Silva');
//     expect(service.customerPhone()).toBe('5511999999999');
//   });

//   it('deve resetar as seleções do fluxo mantendo o token', () => {
//     service.setToken('abc123');
//     service.setService({ id: 'consulta-advogado', name: 'Consulta com o Advogado' });
//     service.setProfessional({ id: 1, name: 'Reinaldo Holtz' });

//     service.reset();

//     expect(service.token()).toBe('abc123');
//     expect(service.selectedService()).toBeNull();
//     expect(service.selectedProfessional()).toBeNull();
//   });
// });
