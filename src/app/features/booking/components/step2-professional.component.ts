import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BookingStateService } from '../services/booking-state.service';
import { ProfessionalsApiService } from '../services/professionals-api.service';
import { Professional } from '../models/booking.model';

/**
 * Tela 2 — Escolher profissional.
 * Os profissionais vêm do backend (que consulta a API externa do Z-PRO).
 * Ao selecionar, o backend consulta o Google Calendar para disponibilidade,
 * já considerando os horários de trabalho retornados pela API do Z-PRO.
 */
@Component({
  selector: 'app-step2-professional',
  standalone: true,
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Escolha o profissional</h1>
        <p class="mt-1 text-sm text-slate-500">Selecione quem irá te atender.</p>
      </div>

      @if (loading) {
        <p class="text-center text-sm text-slate-400">Carregando profissionais…</p>
      }

      @if (errorMessage) {
        <p class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{{ errorMessage }}</p>
      }

      @if (!loading && professionals.length > 0) {
        <div class="flex flex-col gap-3">
          @for (professional of professionals; track professional.id) {
            <button
              type="button"
              (click)="selectProfessional(professional)"
              class="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-4 text-left transition hover:border-brand-400 active:scale-[0.99]"
            >
              <span class="font-medium text-slate-900">{{ professional.name }}</span>
              <span class="text-slate-400">›</span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class Step2ProfessionalComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  loading = true;
  errorMessage: string | null = null;
  professionals: Professional[] = [];

  constructor(
    private readonly bookingState: BookingStateService,
    private readonly professionalsApi: ProfessionalsApiService,
  ) {}

  ngOnInit(): void {
    const service = this.bookingState.selectedService();
    if (!service) {
      this.back.emit();
      return;
    }

    this.professionalsApi.listForService(service.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.professionals = response.data ?? [];
        if (this.professionals.length === 0) {
          this.errorMessage = 'Nenhum profissional disponível no momento.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os profissionais agora. Tente novamente em instantes.';
      },
    });
  }

  selectProfessional(professional: Professional): void {
    this.bookingState.setProfessional(professional);
    this.next.emit();
  }
}
