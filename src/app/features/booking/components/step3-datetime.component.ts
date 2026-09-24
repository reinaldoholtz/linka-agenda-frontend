import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BookingStateService } from '../services/booking-state.service';
import { AvailabilityApiService, AvailableDay } from '../services/availability-api.service';
import { AppointmentsApiService } from '../services/appointments-api.service';

/**
 * Tela 3 — Data e horário. Layout mobile-first: dias em linha horizontal,
 * horários em grid, seguindo a seção 24 da especificação.
 */
@Component({
  selector: 'app-step3-datetime',
  standalone: true,
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Data e horário</h1>
        <p class="mt-1 text-sm text-slate-500">Escolha o melhor dia e horário para você.</p>
      </div>

      @if (loading) {
        <p class="text-center text-sm text-slate-400">Buscando horários disponíveis…</p>
      }
      @if (errorMessage) {
        <p class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{{ errorMessage }}</p>
      }

      @if (!loading && days.length > 0) {
        <div class="flex gap-2 overflow-x-auto pb-1">
          @for (day of days; track day.date) {
            <button
              type="button"
              (click)="selectDay(day)"
              class="flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-sm"
              [class.border-brand-500]="selectedDay?.date === day.date"
              [class.bg-brand-50]="selectedDay?.date === day.date"
              [class.border-slate-200]="selectedDay?.date !== day.date"
            >
              {{ formatDayLabel(day.date) }}
            </button>
          }
        </div>

        @if (selectedDay) {
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            @for (time of selectedDay.slots; track time) {
              <button
                type="button"
                (click)="selectTime(time)"
                class="rounded-lg border px-2 py-3 text-center text-sm font-medium"
                [class.border-brand-500]="selectedTime === time"
                [class.bg-brand-600]="selectedTime === time"
                [class.text-white]="selectedTime === time"
                [class.border-slate-200]="selectedTime !== time"
              >
                {{ time }}
              </button>
            }
          </div>
        }
      }

      <div class="flex gap-3 pt-2">
        <button type="button" (click)="back.emit()" class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">
          Voltar
        </button>
        <button
          type="button"
          [disabled]="!selectedDay || !selectedTime || reserving"
          (click)="confirmSelection()"
          class="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-40"
        >
          {{ reserving ? 'Reservando…' : 'Continuar' }}
        </button>
      </div>
    </div>
  `,
})
export class Step3DatetimeComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  loading = true;
  reserving = false;
  errorMessage: string | null = null;
  days: AvailableDay[] = [];
  selectedDay: AvailableDay | null = null;
  selectedTime: string | null = null;

  constructor(
    private readonly bookingState: BookingStateService,
    private readonly availabilityApi: AvailabilityApiService,
    private readonly appointmentsApi: AppointmentsApiService,
  ) {}

  ngOnInit(): void {
    const professional = this.bookingState.selectedProfessional();
    if (!professional) {
      this.back.emit();
      return;
    }

    this.availabilityApi.getAvailability(professional.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.days = response.data ?? [];

        if (this.days.length === 0) {
          this.errorMessage = 'Nenhum horário disponível encontrado.';
          return;
        }

        // Seleciona automaticamente o primeiro dia disponível
        this.selectedDay = this.days[0];
        this.selectedTime = null;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os horários agora. Tente novamente em instantes.';
      },
    });
  }

  selectDay(day: AvailableDay): void {
    this.selectedDay = day;
    this.selectedTime = null;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  confirmSelection(): void {
    if (!this.selectedDay || !this.selectedTime || this.reserving) {
      return;
    }

    const token = this.bookingState.token();
    const professional = this.bookingState.selectedProfessional();

    if (!token || !professional) {
      this.errorMessage = 'Sessão de agendamento inválida. Recarregue o link.';
      return;
    }

    this.reserving = true;
    this.errorMessage = null;

    this.appointmentsApi.reserve({
      token,
      professionalId: professional.id,
      professionalName: professional.name,
      date: this.selectedDay.date,
      time: this.selectedTime,
    }).subscribe({
      next: (response) => {
        this.reserving = false;

        if (!response.success || !response.data) {
          this.errorMessage = response.message ?? 'Não foi possível reservar este horário. Escolha outro.';
          return;
        }

        this.bookingState.setTimeSlot({ date: this.selectedDay!.date, time: this.selectedTime! });
        this.bookingState.setAppointmentId(response.data.id);
        this.next.emit();
      },
      error: (err) => {
        this.reserving = false;
        this.errorMessage = err?.error?.message ?? 'Este horário não está mais disponível. Escolha outro.';
        // Recarrega a disponibilidade para refletir o horário que acabou de ser ocupado.
        this.ngOnInit();
      },
    });
  }

  formatDayLabel(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  }
}
