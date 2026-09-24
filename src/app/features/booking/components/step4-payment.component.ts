import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingStateService } from '../services/booking-state.service';
import { PaymentsApiService } from '../services/payments-api.service';
import { PaymentMethod } from '../models/booking.model';

/**
 * Tela 4 — Resumo + forma de pagamento (PIX ou cartão).
 * Nenhum dado sensível de cartão é armazenado aqui — apenas os dados
 * necessários para o backend iniciar o checkout seguro no Asaas.
 */
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
        <dt class="text-slate-500">Serviço</dt>
        <dd class="text-right font-medium">{{ bookingState.selectedService()?.name }}</dd>
        <dt class="text-slate-500">Profissional</dt>
        <dd class="text-right font-medium">{{ bookingState.selectedProfessional()?.name }}</dd>
        <dt class="text-slate-500">Data</dt>
        <dd class="text-right font-medium">{{ formatDate(bookingState.selectedTimeSlot()?.date) }}</dd>
        <dt class="text-slate-500">Horário</dt>
        <dd class="text-right font-medium">{{ bookingState.selectedTimeSlot()?.time }}</dd>
      </dl>

      <form [formGroup]="form" class="flex flex-col gap-4" (ngSubmit)="submit()">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Forma de pagamento</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" (click)="setMethod('PIX')"
              class="rounded-lg border py-3 text-sm font-medium"
              [class.border-brand-500]="form.value.method === 'PIX'"
              [class.bg-brand-50]="form.value.method === 'PIX'"
              [class.border-slate-200]="form.value.method !== 'PIX'">
              PIX
            </button>
            <button type="button" (click)="setMethod('CREDIT_CARD')"
              class="rounded-lg border py-3 text-sm font-medium"
              [class.border-brand-500]="form.value.method === 'CREDIT_CARD'"
              [class.bg-brand-50]="form.value.method === 'CREDIT_CARD'"
              [class.border-slate-200]="form.value.method !== 'CREDIT_CARD'">
              Cartão de crédito
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Nome completo</label>
          <input formControlName="name" type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">CPF/CNPJ</label>
          <input formControlName="document" type="text" inputmode="numeric"
            class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
          <input formControlName="email" type="email"
            class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
        </div>

        @if (errorMessage) {
          <p class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{{ errorMessage }}</p>
        }

        <div class="flex gap-3 pt-2">
          <button type="button" (click)="back.emit()" class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">
            Voltar
          </button>
          <button type="submit" [disabled]="form.invalid || submitting"
            class="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-40">
            {{ submitting ? 'Processando…' : 'Pagar' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class Step4PaymentComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form: ReturnType<FormBuilder['group']>;

  constructor(
    readonly bookingState: BookingStateService,
    private readonly fb: FormBuilder,
    private readonly paymentsApi: PaymentsApiService,
  ) {
    this.form = this.fb.group({
      method: this.fb.control<PaymentMethod>('PIX', { nonNullable: true }),
      name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      document: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    });
  }

  setMethod(method: PaymentMethod): void {
    this.form.patchValue({ method });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const token = this.bookingState.token();
    const appointmentId = this.bookingState.appointmentId();
    if (!token || !appointmentId) {
      this.errorMessage = 'Sessão de agendamento inválida. Recarregue o link.';
      return;
    }

    const { method, name, document, email } = this.form.getRawValue();
    this.bookingState.setPayment({ method, name, document, email });

    this.submitting = true;
    this.errorMessage = null;

    this.paymentsApi.create({ token, appointmentId, method, name, document, email }).subscribe({
      next: () => {
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
    if (!date) {
      return '';
    }

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
