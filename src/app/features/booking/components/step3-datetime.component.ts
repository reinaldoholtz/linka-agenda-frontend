import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BookingStateService } from '../services/booking-state.service';
import { AvailabilityApiService, AvailableDay } from '../services/availability-api.service';

interface ClientSlot {
  date: string;
  time: string;
  startInstant: string;
  localTime: string;
}

interface ClientDay {
  date: string;
  slots: ClientSlot[];
}

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
            <button type="button" (click)="selectDay(day)" class="flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-sm"
              [class.border-brand-500]="selectedDay?.date === day.date" [class.bg-brand-50]="selectedDay?.date === day.date"
              [class.border-slate-200]="selectedDay?.date !== day.date">
              {{ formatDayLabel(day.date) }}
            </button>
          }
        </div>

        @if (selectedDay) {
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            @for (slot of selectedDay.slots; track slot.startInstant) {
              <button type="button" (click)="selectTime(slot)" class="rounded-lg border px-2 py-3 text-center text-sm font-medium"
                [class.border-brand-500]="selectedTime?.startInstant === slot.startInstant" [class.bg-brand-600]="selectedTime?.startInstant === slot.startInstant"
                [class.text-white]="selectedTime?.startInstant === slot.startInstant" [class.border-slate-200]="selectedTime?.startInstant !== slot.startInstant">
                {{ slot.localTime }}
              </button>
            }
          </div>
        }
      }

      <div class="flex gap-3 pt-2">
        <button type="button" (click)="back.emit()" class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">Voltar</button>
        <button type="button" [disabled]="!selectedDay || !selectedTime" (click)="confirmSelection()"
          class="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-40">Continuar</button>
      </div>
    </div>
  `,
})
export class Step3DatetimeComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  loading = true;
  errorMessage: string | null = null;
  days: ClientDay[] = [];
  selectedDay: ClientDay | null = null;
  selectedTime: ClientSlot | null = null;

  constructor(
    private readonly bookingState: BookingStateService,
    private readonly availabilityApi: AvailabilityApiService,
  ) {}

  ngOnInit(): void {
    const professional = this.bookingState.selectedProfessional();
    const token = this.bookingState.token();
    if (!professional || !token) {
      this.back.emit();
      return;
    }

    this.availabilityApi.getAvailability(token, professional.email, professional.businessHours).subscribe({
      next: (response) => {
        this.loading = false;
        this.days = this.toClientDays(response.data ?? []);
        if (this.days.length === 0) {
          this.errorMessage = 'Nenhum horário disponível encontrado.';
          return;
        }

        const savedSlot = this.bookingState.selectedTimeSlot();
        const savedDay = savedSlot ? this.days.find((day) => day.date === savedSlot.localDate) : undefined;
        const savedClientSlot = savedDay?.slots.find(slot => slot.startInstant === savedSlot?.startInstant);
        if (savedDay && savedClientSlot) {
          this.selectedDay = savedDay;
          this.selectedTime = savedClientSlot;
          return;
        }

        this.selectedDay = this.days[0];
        this.selectedTime = null;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os horários agora. Tente novamente em instantes.';
      },
    });
  }

  selectDay(day: ClientDay): void {
    this.selectedDay = day;
    this.selectedTime = null;
  }

  selectTime(slot: ClientSlot): void {
    this.selectedTime = slot;
  }

  confirmSelection(): void {
    if (!this.selectedDay || !this.selectedTime) {
      return;
    }

    this.bookingState.setTimeSlot({
      date: this.selectedTime.date,
      time: this.selectedTime.time,
      startInstant: this.selectedTime.startInstant,
      localDate: this.selectedDay.date,
      localTime: this.selectedTime.localTime,
    });
    this.next.emit();
  }

  formatDayLabel(isoDate: string): string {
    const date = new Date(`${isoDate}T12:00:00Z`);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', timeZone: 'UTC' });
  }

  private toClientDays(availableDays: AvailableDay[]): ClientDay[] {
    const byDate = new Map<string, ClientSlot[]>();
    for (const day of availableDays) {
      for (const slot of day.slotDetails ?? []) {
        const instant = new Date(slot.startInstant);
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: this.bookingState.clientTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(instant);
        const part = (type: string) => parts.find(item => item.type === type)!.value;
        const localDate = `${part('year')}-${part('month')}-${part('day')}`;
        const localTime = `${part('hour')}:${part('minute')}`;
        const slots = byDate.get(localDate) ?? [];
        slots.push({ ...slot, localTime });
        byDate.set(localDate, slots);
      }
    }
    return Array.from(byDate, ([date, slots]) => ({
      date, slots: slots.sort((a, b) => a.startInstant.localeCompare(b.startInstant)),
    }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
