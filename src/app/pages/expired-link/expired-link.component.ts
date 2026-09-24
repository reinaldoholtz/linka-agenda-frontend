import { Component } from '@angular/core';
import { PageCardComponent } from '../../shared/components/page-card.component';

@Component({
  selector: 'app-expired-link',
  standalone: true,
  imports: [PageCardComponent],
  template: `
    <app-page-card>
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
          ⚠️
        </div>
        <h1 class="text-lg font-semibold text-slate-900">Link inválido ou expirado</h1>
        <p class="text-sm text-slate-500">
          Este link de agendamento não está mais disponível. Solicite um novo link
          para continuar com o seu agendamento.
        </p>
      </div>
    </app-page-card>
  `,
})
export class ExpiredLinkComponent {}
