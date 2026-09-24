import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  template: `
    <ol class="flex items-center justify-between gap-1 px-1">
      @for (label of steps; track label; let i = $index) {
        <li class="flex flex-1 flex-col items-center gap-1">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
            [class.bg-brand-600]="i + 1 <= currentStep"
            [class.text-white]="i + 1 <= currentStep"
            [class.bg-slate-200]="i + 1 > currentStep"
            [class.text-slate-500]="i + 1 > currentStep"
          >
            {{ i + 1 }}
          </div>
          <span class="text-center text-[10px] leading-tight text-slate-500 sm:text-xs">{{ label }}</span>
        </li>
      }
    </ol>
  `,
})
export class ProgressIndicatorComponent {
  @Input() currentStep = 1;
  readonly steps = ['Serviço', 'Profissional', 'Data e horário', 'Pagamento', 'Confirmação'];
}
