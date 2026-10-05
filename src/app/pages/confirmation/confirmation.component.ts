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
  phoneNumberChannel: string;
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

          <p class="text-sm font-medium text-slate-700">
            Clique no botão abaixo para retornar ao WhatsApp.
          </p>

          <a
            [href]="whatsAppUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2.05 22l5.21-1.52A9.95 9.95 0 1 0 12.04 2zm0 17.91a8.01 8.01 0 0 1-4.09-1.12l-.29-.17-3.09.9.92-3.01-.19-.31a7.9 7.9 0 1 1 6.74 3.71z"
              />
              <path
                d="M16.45 13.84c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.64-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"
              />
            </svg>

            Abrir WhatsApp
          </a>

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

  get whatsAppUrl(): string {
    const phoneNumber = this.confirmation?.phoneNumberChannel ?? '';
    return `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
  }
}
