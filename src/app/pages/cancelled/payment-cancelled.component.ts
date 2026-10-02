import { Component } from '@angular/core';
import { PageCardComponent } from '../../shared/components/page-card.component';

@Component({
  selector: 'app-payment-cancelled',
  standalone: true,
  imports: [PageCardComponent],
  template: `
    <app-page-card>
      <div class="flex flex-col items-center gap-4 text-center">

        <div
          class="flex h-14 w-14 items-center justify-center rounded-full
                 bg-amber-50 text-2xl text-amber-600"
        >
          !
        </div>

        <h1 class="text-lg font-semibold text-slate-900">
          Pagamento não concluído
        </h1>

        <p class="text-sm text-slate-500">
          O pagamento foi cancelado ou não foi concluído.
          Seu agendamento ainda não foi confirmado.
        </p>

      </div>
    </app-page-card>
  `,
})
export class PaymentCancelledComponent {}
