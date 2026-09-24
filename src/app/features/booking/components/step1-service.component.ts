import { Component, EventEmitter, Output } from '@angular/core';
import { BookingStateService } from '../services/booking-state.service';
import { BookingService } from '../models/booking.model';

/**
 * Tela 1 — Escolher serviço.
 * Ao selecionar, o passo seguinte (buscar profissionais) é responsabilidade
 * do backend, que consulta a API externa do Z-PRO. O Angular nunca chama
 * a API do Z-PRO diretamente.
 */
@Component({
  selector: 'app-step1-service',
  standalone: true,
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Agende sua consulta</h1>
        <p class="mt-1 text-sm text-slate-500">Escolha o serviço desejado para continuar.</p>
      </div>

      <button
        type="button"
        (click)="selectService()"
        class="flex w-full items-center justify-between rounded-xl border-2 border-brand-500 bg-brand-50 px-4 py-4 text-left transition active:scale-[0.99]"
      >
        <span class="font-medium text-slate-900">Consulta com o Advogado</span>
        <span class="text-brand-600">›</span>
      </button>

      @if (loading) {
        <p class="text-center text-sm text-slate-400">Carregando profissionais disponíveis…</p>
      }
      @if (errorMessage) {
        <p class="text-center text-sm text-red-600">{{ errorMessage }}</p>
      }
    </div>
  `,
})
export class Step1ServiceComponent {
  @Output() next = new EventEmitter<void>();

  loading = false;
  errorMessage: string | null = null;

  constructor(private readonly bookingState: BookingStateService) {}

  selectService(): void {
    const service: BookingService = { id: 'consulta-advogado', name: 'Consulta com o Advogado' };
    this.bookingState.setService(service);

    // A busca dos profissionais (via backend -> API externa do Z-PRO) acontece
    // na Tela 2, que é responsável por chamar GET /api/professionals.
    this.next.emit();
  }
}
