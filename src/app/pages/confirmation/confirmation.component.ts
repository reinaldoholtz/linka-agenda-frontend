import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageCardComponent } from '../../shared/components/page-card.component';
import { PaymentsApiService } from '../../features/booking/services/payments-api.service';

interface PaymentConfirmation {
  paid: boolean;
  paymentStatus: string;
  service: string;
  professional: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [PageCardComponent],
  template: `
    <app-page-card>

      @if (loading) {

        <div class="flex flex-col items-center gap-4 text-center">

          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-xl text-slate-500"
          >
            ...
          </div>

          <h1 class="text-lg font-semibold text-slate-900">
            Confirmando pagamento...
          </h1>

          <p class="text-sm text-slate-500">
            Estamos verificando seu pagamento.
          </p>

        </div>

      } @else if (errorMessage) {

        <div class="flex flex-col items-center gap-4 text-center">

          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600"
          >
            !
          </div>

          <h1 class="text-lg font-semibold text-slate-900">
            Não foi possível confirmar o pagamento
          </h1>

          <p class="text-sm text-slate-500">
            {{ errorMessage }}
          </p>

        </div>

      } @else if (confirmation) {
        <div class="flex flex-col items-center gap-4 text-center">

          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600"
          >
            ✓
          </div>

          <h1 class="text-lg font-semibold text-slate-900">
            Pagamento realizado!
          </h1>

          <p class="text-sm text-slate-500">
            Seu pagamento foi recebido e seu agendamento foi confirmado.
            Você receberá os detalhes pelo WhatsApp.
          </p>

          <dl class="mt-2 grid w-full grid-cols-2 gap-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
            <dt class="text-slate-500">
              Serviço
            </dt>
            <dd class="text-right font-medium">
              {{ confirmation.service }}
            </dd>
            <dt class="text-slate-500">
              Profissional
            </dt>
            <dd class="text-right font-medium">
              {{ confirmation.professional }}
            </dd>
            <dt class="text-slate-500">
              Data
            </dt>
            <dd class="text-right font-medium">
              {{ formatDate(confirmation.date) }}
            </dd>
            <dt class="text-slate-500">
              Horário
            </dt>
            <dd class="text-right font-medium">
              {{ formatTime(confirmation.time) }}
            </dd>
          </dl>
        </div>

      }

    </app-page-card>
  `,
})
export class ConfirmationComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  confirmation: PaymentConfirmation | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly paymentsApi: PaymentsApiService
  ) {}

  ngOnInit(): void {
    const sessionId =
      this.route.snapshot.queryParamMap.get('session_id');

    console.log('Stripe Session ID:', sessionId);

    if (!sessionId) {
      this.loading = false;
      this.errorMessage =
        'Sessão de pagamento não encontrada.';

      return;
    }
    this.confirmPayment(sessionId);
  }

  private confirmPayment(sessionId: string): void {

    this.loading = true;
    this.errorMessage = null;

    this.paymentsApi
      .confirmStripePayment(sessionId)
      .subscribe({

        next: (response) => {

          console.log(
            'Resposta da confirmação do pagamento:',
            response
          );

          this.loading = false;

          if (!response.success || !response.data) {

            this.errorMessage =
              response.message ??
              'Não foi possível confirmar o pagamento.';

            return;
          }

          this.confirmation = response.data;

          console.log(
            'Pagamento confirmado:',
            this.confirmation
          );
        },

        error: (err) => {

          console.error(
            'Erro ao confirmar pagamento Stripe:',
            err
          );

          this.loading = false;

          this.errorMessage =
            err?.error?.message ??
            'Não foi possível confirmar o pagamento.';

        }

      });
  }

  formatDate(date: string): string {
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

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.substring(0, 5);
  }
}
