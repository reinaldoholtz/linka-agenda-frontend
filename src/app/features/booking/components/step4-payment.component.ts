import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingStateService } from '../services/booking-state.service';
import { PaymentsApiService } from '../services/payments-api.service';
import { PaymentMethod } from '../models/booking.model';
import { StripeService } from '../services/stripe.service';

@Component({
  selector: 'app-step4-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="flex flex-col gap-6">

      <div>
        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">
          Confirme e pague
        </h1>

        <p class="mt-1 text-sm text-slate-500">
          Revise os dados do seu agendamento.
        </p>
      </div>

      <!-- Resumo -->
      <dl class="grid grid-cols-2 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">

        <dt class="text-slate-500">
          Serviço
        </dt>

        <dd class="text-right font-medium">
          {{ bookingState.selectedService()?.name }}
        </dd>

        <dt class="text-slate-500">
          Profissional
        </dt>

        <dd class="text-right font-medium">
          {{ bookingState.selectedProfessional()?.name }}
        </dd>

        <dt class="text-slate-500">
          Data
        </dt>

        <dd class="text-right font-medium">
          {{ formatDate(bookingState.selectedTimeSlot()?.date) }}
        </dd>

        <dt class="text-slate-500">
          Horário
        </dt>

        <dd class="text-right font-medium">
          {{ bookingState.selectedTimeSlot()?.time }}
        </dd>

      </dl>

      <!-- Carregando formas de pagamento -->
      @if (loadingPaymentMethods) {

        <div class="rounded-xl bg-slate-50 px-4 py-4 text-center">
          <p class="text-sm text-slate-500">
            Carregando formas de pagamento...
          </p>
        </div>

      } @else {

        <form
          [formGroup]="form"
          class="flex flex-col gap-4"
          (ngSubmit)="submit()"
        >

          <!-- Forma de pagamento -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              Forma de pagamento
            </label>

            <div class="flex flex-wrap gap-2">

              @if (availablePaymentMethods.includes('PIX')) {
                <button
                  type="button"
                  (click)="setMethod('PIX')"
                  class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
                  [class.border-brand-500]="form.value.method === 'PIX'"
                  [class.bg-brand-50]="form.value.method === 'PIX'"
                  [class.text-brand-700]="form.value.method === 'PIX'"
                  [class.border-slate-200]="form.value.method !== 'PIX'"
                  [class.text-slate-600]="form.value.method !== 'PIX'"
                >
                  <span
                    class="flex h-4 w-4 items-center justify-center rounded-full border"
                    [class.border-brand-500]="form.value.method === 'PIX'"
                    [class.bg-brand-500]="form.value.method === 'PIX'"
                    [class.border-slate-300]="form.value.method !== 'PIX'"
                  >
                    @if (form.value.method === 'PIX') {
                      <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                    }
                  </span>

                  PIX
                </button>
              }

              @if (availablePaymentMethods.includes('CREDIT_CARD')) {
                <button
                  type="button"
                  (click)="setMethod('CREDIT_CARD')"
                  class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
                  [class.border-brand-500]="form.value.method === 'CREDIT_CARD'"
                  [class.bg-brand-50]="form.value.method === 'CREDIT_CARD'"
                  [class.text-brand-700]="form.value.method === 'CREDIT_CARD'"
                  [class.border-slate-200]="form.value.method !== 'CREDIT_CARD'"
                  [class.text-slate-600]="form.value.method !== 'CREDIT_CARD'"
                >
                  <span
                    class="flex h-4 w-4 items-center justify-center rounded-full border"
                    [class.border-brand-500]="form.value.method === 'CREDIT_CARD'"
                    [class.bg-brand-500]="form.value.method === 'CREDIT_CARD'"
                    [class.border-slate-300]="form.value.method !== 'CREDIT_CARD'"
                  >
                    @if (form.value.method === 'CREDIT_CARD') {
                      <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                    }
                  </span>

                  Cartão de crédito
                </button>
              }

            </div>

            @if (availablePaymentMethods.length === 0) {
              <p class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Nenhuma forma de pagamento está disponível no momento.
              </p>
            }
          </div>

          <!-- Nome -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Nome completo
            </label>

            <input
              formControlName="name"
              type="text"
              autocomplete="name"
              placeholder="Digite seu nome completo"
              class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <!-- E-mail -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              E-mail
            </label>

            <input
              formControlName="email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          @if (errorMessage) {

            <p class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {{ errorMessage }}
            </p>

          }

          <!-- Botões -->
          <div class="flex gap-3 pt-2">

            <button
              type="button"
              (click)="back.emit()"
              class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600"
            >
              Voltar
            </button>

            <button
              type="submit"
              [disabled]="
                form.invalid ||
                submitting ||
                loadingPaymentMethods ||
                availablePaymentMethods.length === 0
              "
              class="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-40"
            >
              {{ submitting ? 'Processando…' : 'Continuar' }}
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

  loadingPaymentMethods = true;

  errorMessage: string | null = null;

  availablePaymentMethods: PaymentMethod[] = [];

  readonly form: ReturnType<FormBuilder['group']>;

  constructor(
        readonly bookingState: BookingStateService,
        private readonly fb: FormBuilder,
        private readonly paymentsApi: PaymentsApiService,
        private readonly stripeService: StripeService,
      ) {
    this.form = this.fb.group({
            method: this.fb.control<PaymentMethod | null>(null),

            name: this.fb.control('', {
              nonNullable: true,
              validators: [Validators.required]
            }),

            email: this.fb.control('', {
              nonNullable: true,
              validators: [
                Validators.required,
                Validators.email
              ]
            }),
          });
  }

  ngOnInit(): void {

    const appointmentId = this.bookingState.appointmentId();

    if (!appointmentId) {
      this.loadingPaymentMethods = false;

      this.errorMessage =
        'Sessão de agendamento inválida. Recarregue o link.';

      return;
    }

    this.loadAvailablePaymentMethods(appointmentId);
  }

  private loadAvailablePaymentMethods(appointmentId: string): void {
    this.loadingPaymentMethods = true;
    this.errorMessage = null;
    this.paymentsApi
      .getAvailablePaymentMethods(appointmentId)
      .subscribe({

        next: (response) => {

          this.loadingPaymentMethods = false;

          console.log('Payment methods response:', response);

          this.availablePaymentMethods =
            response.paymentMethods as PaymentMethod[];

          console.log(
            'Métodos de pagamento disponíveis:',
            this.availablePaymentMethods
          );

          if (this.availablePaymentMethods.length > 0) {

            console.log(
              'Método de pagamento selecionado automaticamente:',
              this.availablePaymentMethods[0]
            );

            this.form.patchValue({
              method: this.availablePaymentMethods[0]
            });
          }
        },

        error: (err) => {

          this.loadingPaymentMethods = false;

          console.error(
            'Erro ao carregar métodos de pagamento:',
            err
          );

          this.errorMessage =
            err?.error?.message ??
            'Não foi possível carregar as formas de pagamento.';
        }

      });
  }

  setMethod(method: PaymentMethod): void {

    if (!this.availablePaymentMethods.includes(method)) {
      return;
    }

    this.form.patchValue({
      method
    });
  }

  submit(): void {

    if (this.form.invalid) {
      return;
    }

    const token = this.bookingState.token();
    const appointmentId = this.bookingState.appointmentId();

    if (!token || !appointmentId) {

      this.errorMessage =
        'Sessão de agendamento inválida. Recarregue o link.';

      return;
    }

    const {
      method,
      name,
      email
    } = this.form.getRawValue();

    if (!method) {

      this.errorMessage =
        'Selecione uma forma de pagamento.';

      return;
    }

    /*
     * Segurança adicional:
     * garante que o método selecionado está entre
     * os métodos retornados pelo backend.
     */
    if (!this.availablePaymentMethods.includes(method)) {

      this.errorMessage =
        'A forma de pagamento selecionada não está disponível.';

      return;
    }

    this.bookingState.setPayment({
      method,
      name,
      email
    });

    this.submitting = true;
    this.errorMessage = null;

    this.paymentsApi.create({
      token,
      appointmentId,
      method,
      name,
      email
    }).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.submitting = false;
          this.errorMessage = response.message ?? 'Não foi possível criar o pagamento.';
          return;
        }

        const payment = response.data;

        console.log('Payment criado pelo backend:', payment);
        console.log('Gateway:', payment.gateway);
        console.log('Invoice URL:', payment.invoiceUrl);
        /*
         * O backend é quem determina o gateway.
         *
         * Não usamos:
         *
         *   method === 'CREDIT_CARD'
         *
         * porque CREDIT_CARD pode ser:
         *
         *   ASAAS
         *   STRIPE
         */

        if (payment.gateway === 'STRIPE') {

          console.log('Stripe payment response:', payment);

          const checkoutUrl = payment.invoiceUrl;

          console.log('Stripe Checkout URL:', checkoutUrl);

          if (!checkoutUrl) {

            console.error(
              'Stripe Checkout URL não encontrada.',
              payment
            );

            this.submitting = false;

            this.errorMessage =
              'Não foi possível obter o endereço do checkout do Stripe.';

            return;
          }

          console.log('Redirecionando para Stripe Checkout:',checkoutUrl);

          this.stripeService.redirectToCheckout(checkoutUrl);
          return;
        }

        /*
         * ASAAS
         *
         * O backend já criou o pagamento.
         * Mantemos o fluxo atual para a próxima etapa.
         */
        this.submitting = false;
        this.next.emit();
      },

      error: (err) => {

        this.submitting = false;

        this.errorMessage =
          err?.error?.message ??
          'Não foi possível processar o pagamento agora. Tente novamente.';
      },

    });
  }

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '';
    }

    const [
      year,
      month,
      day
    ] = date.split('-');

    return `${day}/${month}/${year}`;
  }
}
