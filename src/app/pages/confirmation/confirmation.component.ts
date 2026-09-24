import { Component } from '@angular/core';
import { PageCardComponent } from '../../shared/components/page-card.component';
import { BookingStateService } from '../../features/booking/services/booking-state.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [PageCardComponent],
  template: `
    <app-page-card>
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
          ✓
        </div>
        <!-- <h1 class="text-lg font-semibold text-slate-900">Agendamento confirmado!</h1>
        <p class="text-sm text-slate-500">
          Enviamos os detalhes do seu agendamento pelo WhatsApp.
        </p> -->

        <h1 class="text-lg font-semibold text-slate-900">
          Pagamento realizado!
        </h1>

        <p class="text-sm text-slate-500">
          Seu pagamento foi recebido e estamos confirmando seu agendamento.
          Você receberá os detalhes pelo WhatsApp.
        </p>

        <dl class="mt-2 grid w-full grid-cols-2 gap-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
          <dt class="text-slate-500">Serviço</dt>
          <dd class="text-right font-medium">{{ bookingState.selectedService()?.name }}</dd>
          <dt class="text-slate-500">Profissional</dt>
          <dd class="text-right font-medium">{{ bookingState.selectedProfessional()?.name }}</dd>
          <dt class="text-slate-500">Data</dt>
          <dd class="text-right font-medium">{{ bookingState.selectedTimeSlot()?.date }}</dd>
          <dt class="text-slate-500">Horário</dt>
          <dd class="text-right font-medium">{{ bookingState.selectedTimeSlot()?.time }}</dd>
        </dl>
      </div>
    </app-page-card>
  `,
})
export class ConfirmationComponent {
  constructor(readonly bookingState: BookingStateService) {}
}
