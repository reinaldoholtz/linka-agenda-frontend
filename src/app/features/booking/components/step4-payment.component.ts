import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingStateService } from '../services/booking-state.service';
import { PaymentsApiService } from '../services/payments-api.service';
import { PaymentMethod } from '../models/booking.model';
import { StripeService } from '../services/stripe.service';
import { AppointmentsApiService, ReserveAppointmentRequest } from '../services/appointments-api.service';

@Component({
  selector: 'app-step4-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Confirme e pague</h1>
        <p class="mt-1 text-sm text-slate-500">Revise os dados do seu agendamento.</p>
      </div>

      <dl class="grid grid-cols-2 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">
        <dt class="text-slate-500">Serviço</dt><dd class="text-right font-medium">{{ bookingState.selectedService()?.name }}</dd>
        <dt class="text-slate-500">Profissional</dt><dd class="text-right font-medium">{{ bookingState.selectedProfessional()?.name }}</dd>
        <dt class="text-slate-500">Data</dt><dd class="text-right font-medium">{{ formatDate(bookingState.selectedTimeSlot()?.date) }}</dd>
        <dt class="text-slate-500">Horário</dt><dd class="text-right font-medium">{{ bookingState.selectedTimeSlot()?.time }}</dd>
      </dl>

      @if (reservingAppointment || (loadingPaymentMethods && bookingState.appointmentId())) {
        <p class="rounded-xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
          {{ reservingAppointment ? 'Reservando horário...' : 'Carregando formas de pagamento...' }}
        </p>
      } @else {
        <form [formGroup]="form" class="flex flex-col gap-4" (ngSubmit)="submit()">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Forma de pagamento</label>
            <div class="flex flex-wrap gap-2">
              @for (method of availablePaymentMethods; track method) {
                <button type="button" (click)="setMethod(method)" class="rounded-lg border px-3 py-2 text-sm font-medium"
                  [class.border-brand-500]="form.value.method === method" [class.bg-brand-50]="form.value.method === method"
                  [class.border-slate-200]="form.value.method !== method">
                  {{ method === 'PIX' ? 'PIX' : 'Cartão de crédito' }}
                </button>
              }
            </div>
            @if (bookingState.appointmentId() && availablePaymentMethods.length === 0 && !errorMessage) {
              <p class="mt-2 text-sm text-red-600">Nenhuma forma de pagamento está disponível.</p>
            }
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Nome completo</label>
            <input formControlName="name" type="text" autocomplete="name" placeholder="Digite seu nome completo" [readonly]="!!bookingState.appointmentId()"
              class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input formControlName="email" type="email" autocomplete="email" placeholder="seu@email.com" [readonly]="!!bookingState.appointmentId()"
              class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
          </div>
          @if (errorMessage) {
            <p class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{{ errorMessage }}</p>
          }
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="goBack()" [disabled]="cancellingReservation || submitting"
              class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">Voltar</button>
            <button type="submit" [disabled]="form.invalid || reservingAppointment || loadingPaymentMethods || submitting || (bookingState.appointmentId() && availablePaymentMethods.length === 0)"
              class="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-40">
              {{ reservingAppointment ? 'Reservando…' : (submitting ? 'Processando…' : (bookingState.appointmentId() ? 'Continuar' : 'Reservar horário')) }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class Step4PaymentComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  submitting = false;
  reservingAppointment = false;
  cancellingReservation = false;
  loadingPaymentMethods = false;
  errorMessage: string | null = null;
  availablePaymentMethods: PaymentMethod[] = [];
  readonly form: ReturnType<FormBuilder['group']>;

  constructor(
    readonly bookingState: BookingStateService,
    private readonly fb: FormBuilder,
    private readonly paymentsApi: PaymentsApiService,
    private readonly stripeService: StripeService,
    private readonly appointmentsApi: AppointmentsApiService,
  ) {
    this.form = this.fb.group({
      method: this.fb.control<PaymentMethod | null>(null),
      name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    });
  }

  ngOnInit(): void {
    this.validateSelectedSlot();
  }

  private validateSelectedSlot(): void {
    if (!this.bookingState.token() || !this.bookingState.selectedProfessional() || !this.bookingState.selectedTimeSlot()) {
      this.loadingPaymentMethods = false;
      this.errorMessage = 'Sessão de agendamento inválida. Recarregue o link.';
    }
  }

  private reserveSelectedSlot(): void {
    const { name: customerName, email: customerEmail } = this.form.getRawValue();
    const token = this.bookingState.token();
    const professional = this.bookingState.selectedProfessional();
    const slot = this.bookingState.selectedTimeSlot();
    if (!token || !professional || !slot) {
      this.loadingPaymentMethods = false;
      this.errorMessage = 'Sessão de agendamento inválida. Recarregue o link.';
      return;
    }

    this.reservingAppointment = true;
    const request: ReserveAppointmentRequest = {
      token,
      professionalId: professional.id,
      professionalName: professional.name,
      professionalEmail: professional.email,
      customerName,
      customerEmail,
      date: slot.date,
      time: slot.time,
      businessHours: professional.businessHours,
    };
    this.appointmentsApi.reserve(request).subscribe({
      next: (response) => {
        this.reservingAppointment = false;
        if (!response.success || !response.data) {
          this.loadingPaymentMethods = false;
          this.errorMessage = response.message ?? 'Este horário não está mais disponível. Escolha outro.';
          return;
        }
        this.bookingState.setAppointmentId(response.data.id);
        this.loadAvailablePaymentMethods(response.data.id, true);
      },
      error: (err) => {
        this.reservingAppointment = false;
        this.loadingPaymentMethods = false;
        this.errorMessage = err?.error?.message ?? 'Este horário não está mais disponível. Escolha outro.';
      },
    });
  }

  private loadAvailablePaymentMethods(appointmentId: string, createPaymentAfterLoad = false): void {
    this.loadingPaymentMethods = true;
    this.paymentsApi.getAvailablePaymentMethods(appointmentId).subscribe({
      next: (response) => {
        this.loadingPaymentMethods = false;
        this.availablePaymentMethods = response.paymentMethods as PaymentMethod[];
        if (this.availablePaymentMethods.length > 0) {
          this.form.patchValue({ method: this.availablePaymentMethods[0] });
          if (createPaymentAfterLoad) {
            this.submit();
          }
        }
      },
      error: (err) => {
        this.loadingPaymentMethods = false;
        this.errorMessage = err?.error?.message ?? 'Não foi possível carregar as formas de pagamento.';
      },
    });
  }

  setMethod(method: PaymentMethod): void {
    if (this.availablePaymentMethods.includes(method)) {
      this.form.patchValue({ method });
    }
  }

  goBack(): void {
    const token = this.bookingState.token();
    const appointmentId = this.bookingState.appointmentId();
    if (!token || !appointmentId) {
      this.bookingState.clearAppointmentId();
      this.back.emit();
      return;
    }

    this.cancellingReservation = true;
    this.errorMessage = null;
    this.appointmentsApi.cancelReservation(appointmentId, { token }).subscribe({
      next: () => {
        this.cancellingReservation = false;
        this.bookingState.clearAppointmentId();
        this.back.emit();
      },
      error: (err) => {
        this.cancellingReservation = false;
        this.errorMessage = err?.error?.message ?? 'Não foi possível liberar o horário. Tente novamente.';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const token = this.bookingState.token();
    const appointmentId = this.bookingState.appointmentId();
    const { method, name, email } = this.form.getRawValue();
    if (!token) {
      this.errorMessage = 'Sessão de agendamento inválida. Recarregue o link.';
      return;
    }

    if (!appointmentId) {
      this.reserveSelectedSlot();
      return;
    }

    if (!method || !this.availablePaymentMethods.includes(method)) {
      this.errorMessage = 'Selecione uma forma de pagamento.';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;
    this.bookingState.setPayment({ method, name, email });
    this.paymentsApi.create({ token, appointmentId, method, name, email }).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.submitting = false;
          this.errorMessage = response.message ?? 'Não foi possível criar o pagamento.';
          return;
        }
        if (response.data.gateway === 'STRIPE') {
          if (!response.data.invoiceUrl) {
            this.submitting = false;
            this.errorMessage = 'Não foi possível obter o endereço do checkout do Stripe.';
            return;
          }
          this.stripeService.redirectToCheckout(response.data.invoiceUrl);
          return;
        }
        this.submitting = false;
        this.next.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message ?? 'Não foi possível processar o pagamento agora. Tente novamente.';
      },
    });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
