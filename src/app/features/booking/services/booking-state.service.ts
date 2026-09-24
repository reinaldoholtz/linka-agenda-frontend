import { Injectable, signal } from '@angular/core';
import {
  AvailableTimeSlot,
  BookingService,
  PaymentDetails,
  Professional,
} from '../models/booking.model';

/**
 * Mantém o estado do fluxo de agendamento (token do link + seleções do cliente)
 * durante a navegação entre as telas. Deliberadamente em memória (signals),
 * nunca em localStorage, conforme seção 23 da especificação.
 */
@Injectable({ providedIn: 'root' })
export class BookingStateService {

  readonly token = signal<string | null>(null);
  readonly customerName = signal<string | null>(null);
  readonly customerPhone = signal<string | null>(null);

  readonly selectedService = signal<BookingService | null>(null);
  readonly selectedProfessional = signal<Professional | null>(null);
  readonly selectedTimeSlot = signal<AvailableTimeSlot | null>(null);
  readonly appointmentId = signal<string | null>(null);
  readonly payment = signal<PaymentDetails | null>(null);

  setToken(token: string): void {
    this.token.set(token);
  }

  setValidatedCustomer(name: string, phone: string): void {
    this.customerName.set(name);
    this.customerPhone.set(phone);
  }

  setService(service: BookingService): void {
    this.selectedService.set(service);
  }

  setProfessional(professional: Professional): void {
    this.selectedProfessional.set(professional);
  }

  setTimeSlot(slot: AvailableTimeSlot): void {
    this.selectedTimeSlot.set(slot);
  }

  setAppointmentId(appointmentId: string): void {
    this.appointmentId.set(appointmentId);
  }

  setPayment(payment: PaymentDetails): void {
    this.payment.set(payment);
  }

  reset(): void {
    this.selectedService.set(null);
    this.selectedProfessional.set(null);
    this.selectedTimeSlot.set(null);
    this.appointmentId.set(null);
    this.payment.set(null);
  }
}
