import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingLinkApiService } from '../../../core/services/booking-link-api.service';
import { BookingStateService } from '../services/booking-state.service';
import { PageCardComponent } from '../../../shared/components/page-card.component';
import { ProgressIndicatorComponent } from '../../../shared/components/progress-indicator.component';
import { Step1ServiceComponent } from '../components/step1-service.component';
import { Step2ProfessionalComponent } from '../components/step2-professional.component';
import { Step3DatetimeComponent } from '../components/step3-datetime.component';
import { Step4PaymentComponent } from '../components/step4-payment.component';

type FlowState = 'validating' | 'invalid' | 'ready';

/**
 * Orquestra as 4 telas do fluxo de agendamento após validar o token
 * capturado na URL /a/{token}. Só libera o fluxo se o token for válido
 * (seção 23 da especificação). Em caso de token inválido/expirado,
 * redireciona para a tela de link expirado.
 */
@Component({
  selector: 'app-booking-flow-page',
  standalone: true,
  imports: [
    PageCardComponent,
    ProgressIndicatorComponent,
    Step1ServiceComponent,
    Step2ProfessionalComponent,
    Step3DatetimeComponent,
    Step4PaymentComponent,
  ],
  template: `
    @if (state === 'validating') {
      <app-page-card>
        <p class="text-center text-sm text-slate-400">Verificando seu link…</p>
      </app-page-card>
    }

    @if (state === 'ready') {
      <app-page-card>
        <div class="mb-6">
          <app-progress-indicator [currentStep]="currentStep" />
        </div>

        @switch (currentStep) {
          @case (1) {
            <app-step1-service (next)="goTo(2)" />
          }
          @case (2) {
            <app-step2-professional (next)="goTo(3)" (back)="goTo(1)" />
          }
          @case (3) {
            <app-step3-datetime (next)="goTo(4)" (back)="goTo(2)" />
          }
          @case (4) {
            <app-step4-payment (next)="onCompleted()" (back)="goTo(3)" />
          }
        }
      </app-page-card>
    }
  `,
})
export class BookingFlowPageComponent implements OnInit {
  state: FlowState = 'validating';
  currentStep = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookingLinkApi: BookingLinkApiService,
    private readonly bookingState: BookingStateService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.router.navigateByUrl('/link-expirado');
      return;
    }

    this.bookingLinkApi.validate(token).subscribe({
      next: (response) => {
        if (!response.success || !response.data?.valid) {
          this.router.navigateByUrl('/link-expirado');
          return;
        }

        this.bookingState.setToken(token);
        this.bookingState.setValidatedCustomer(
          response.data.name ?? '',
          response.data.phoneNumber ?? '',
        );
        this.state = 'ready';
      },
      error: () => {
        this.router.navigateByUrl('/link-expirado');
      },
    });
  }

  goTo(step: number): void {
    this.currentStep = step;
  }

  onCompleted(): void {
    this.router.navigateByUrl('/confirmacao');
  }
}
