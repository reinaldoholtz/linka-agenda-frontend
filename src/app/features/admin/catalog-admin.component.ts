import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminApiService, TenantConfig } from './admin-api.service';
import {
  AdminProfessional, AdminProfessionalInput, AdminService, AdminServiceInput, GoogleAccountOption, WeeklyInterval,
} from './admin-catalog.model';

type Tab = 'services' | 'professionals' | 'agent';
interface WeeklyDayDraft {
  dayOfWeek: number;
  label: string;
  open: boolean;
  firstStart: string;
  firstEnd: string;
  secondStart: string;
  secondEnd: string;
}

@Component({
  standalone: true,
  selector: 'app-catalog-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog-admin.component.html',
})
export class CatalogAdminComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tenantId = this.route.snapshot.paramMap.get('tenantId') ?? '';
  readonly weekdays = [
    { value: 1, label: 'Segunda-feira' }, { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' }, { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' }, { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
  ];

  tab: Tab = 'services';
  tenant: TenantConfig | null = null;
  services: AdminService[] = [];
  professionals: AdminProfessional[] = [];
  loading = true;
  busy = false;
  error = '';
  notice = '';
  editingServiceId: number | null = null;
  editingProfessionalId: number | null = null;
  serviceFormVisible = false;
  professionalFormVisible = false;
  serviceDraft: AdminServiceInput = this.newServiceDraft();
  professionalDraft: AdminProfessionalInput = this.newProfessionalDraft();
  weeklyDays: WeeklyDayDraft[] = this.emptyWeeklyDays();
  googleAccounts: GoogleAccountOption[] = [];
  loadingGoogleAccounts = false;
  googleAccountsError = '';
  expiryMinutes = 30;
  oneTimeSecret = '';

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    forkJoin({
      tenant: this.api.get(this.tenantId),
      services: this.api.listServices(this.tenantId),
      professionals: this.api.listProfessionals(this.tenantId),
    }).subscribe({
      next: ({ tenant, services, professionals }) => {
        this.tenant = tenant.data;
        this.services = services.data;
        this.professionals = professionals.data;
        this.expiryMinutes = tenant.data.paymentLinkExpirationMinutes;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => { this.loading = false; this.handleError(error); },
    });
  }

  selectTab(tab: Tab): void {
    this.tab = tab;
    this.error = '';
    this.notice = '';
    this.serviceFormVisible = false;
    this.professionalFormVisible = false;
    if (tab !== 'agent') this.oneTimeSecret = '';
  }

  newService(): void {
    this.editingServiceId = null;
    this.serviceDraft = this.newServiceDraft();
    this.serviceFormVisible = true;
    this.error = '';
  }

  editService(service: AdminService): void {
    this.editingServiceId = service.id;
    this.serviceDraft = {
      name: service.name, description: service.description, price: service.price,
      durationMinutes: service.durationMinutes, locationType: service.locationType,
      requiresAppointment: service.requiresAppointment, requiresPayment: service.requiresPayment,
      active: service.active, professionalIds: [...service.professionalIds],
    };
    this.serviceFormVisible = true;
    this.error = '';
  }

  saveService(form: NgForm): void {
    if (form.invalid || !this.serviceDraft.name.trim()) {
      this.error = 'Informe nome e campos obrigatórios do serviço.';
      return;
    }
    const draft = this.serviceDraft;
    if (draft.requiresAppointment && (!draft.durationMinutes || draft.durationMinutes < 1)) {
      this.error = 'Informe duração maior que zero.';
      return;
    }
    if (draft.requiresPayment && Number(draft.price) <= 0) {
      this.error = 'Informe preço maior que zero.';
      return;
    }
    this.busy = true;
    this.error = '';
    const payload: AdminServiceInput = { ...draft, name: draft.name.trim(),
      description: draft.description?.trim() || null,
      durationMinutes: draft.requiresAppointment ? Number(draft.durationMinutes) : null,
      locationType: draft.locationType || null,
      price: draft.requiresPayment ? Number(draft.price) : 0,
      professionalIds: draft.requiresAppointment ? [...draft.professionalIds] : [] };
    const request = this.editingServiceId === null
      ? this.api.createService(this.tenantId, payload)
      : this.api.updateService(this.tenantId, this.editingServiceId, payload);
    request.subscribe({
      next: () => { this.busy = false; this.serviceFormVisible = false; this.notice = 'Serviço salvo.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  toggleServiceActive(service: AdminService): void {
    const { id, tenantConfigId, ...input } = service;
    this.busy = true;
    this.api.updateService(this.tenantId, id, { ...input, active: !service.active }).subscribe({
      next: () => { this.busy = false; this.notice = 'Estado do serviço atualizado.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  deleteService(service: AdminService): void {
    if (!window.confirm(`Excluir serviço ${service.name}? Agendamentos vinculados impedem exclusão.`)) return;
    this.busy = true;
    this.api.deleteService(this.tenantId, service.id).subscribe({
      next: () => { this.busy = false; this.notice = 'Serviço excluído.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  newProfessional(): void {
    this.editingProfessionalId = null;
    this.professionalDraft = this.newProfessionalDraft();
    this.weeklyDays = this.emptyWeeklyDays();
    this.professionalFormVisible = true;
    this.error = '';
    this.loadGoogleAccounts();
  }

  editProfessional(professional: AdminProfessional): void {
    this.editingProfessionalId = professional.id;
    this.professionalDraft = {
      name: professional.name, email: professional.email, active: professional.active,
      googleAccountId: professional.googleAccountId,
      googleCalendarId: professional.googleCalendarId,
      serviceIds: [...professional.serviceIds],
      weeklyIntervals: professional.weeklyIntervals.map((interval) => ({ ...interval })),
    };
    this.weeklyDays = this.toWeeklyDays(professional.weeklyIntervals);
    this.professionalFormVisible = true;
    this.error = '';
    this.loadGoogleAccounts();
  }

  saveProfessional(form: NgForm): void {
    if (form.invalid || !this.professionalDraft.name.trim()) {
      this.error = 'Informe o nome e corrija os campos obrigatórios.';
      return;
    }
    const oauth = this.tenant?.googleAuthMode === 'OAUTH_LINKA';
    if (oauth && !this.professionalDraft.googleAccountId) {
      this.error = 'Selecione uma conta Google do profissional.';
      return;
    }
    if (!oauth && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.professionalDraft.email.trim())) {
      this.error = 'Informe um e-mail válido do profissional.';
      return;
    }
    const selected = this.googleAccounts.find((account) => account.id === this.professionalDraft.googleAccountId);
    const original = this.professionals.find((item) => item.id === this.editingProfessionalId);
    if (oauth && selected && !selected.selectable && selected.id !== original?.googleAccountId) {
      this.error = 'Esta conta Google está indisponível para novos vínculos.';
      return;
    }
    let intervals: WeeklyInterval[];
    try { intervals = this.toWeeklyIntervals(); }
    catch (error) { this.error = (error as Error).message; return; }
    this.busy = true;
    this.error = '';
    const payload: AdminProfessionalInput = {
      ...this.professionalDraft,
      name: this.professionalDraft.name.trim(),
      email: (oauth && selected ? selected.email : this.professionalDraft.email).trim().toLowerCase(),
      googleAccountId: this.professionalDraft.googleAccountId?.trim() || null,
      googleCalendarId: oauth ? this.professionalDraft.googleCalendarId : this.professionalDraft.googleCalendarId?.trim() || null,
      serviceIds: [...this.professionalDraft.serviceIds],
      weeklyIntervals: intervals,
    };
    const request = this.editingProfessionalId === null
      ? this.api.createProfessional(this.tenantId, payload)
      : this.api.updateProfessional(this.tenantId, this.editingProfessionalId, payload);
    request.subscribe({
      next: () => { this.busy = false; this.professionalFormVisible = false; this.notice = 'Profissional salvo.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  toggleProfessionalActive(professional: AdminProfessional): void {
    const { id, tenantConfigId, ...input } = professional;
    this.busy = true;
    this.api.updateProfessional(this.tenantId, id, { ...input, active: !professional.active }).subscribe({
      next: () => { this.busy = false; this.notice = 'Estado do profissional atualizado.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  deleteProfessional(professional: AdminProfessional): void {
    if (!window.confirm(`Excluir profissional ${professional.name}? Agendamentos vinculados impedem exclusão.`)) return;
    this.busy = true;
    this.api.deleteProfessional(this.tenantId, professional.id).subscribe({
      next: () => { this.busy = false; this.notice = 'Profissional excluído.'; this.reload(); },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  setDayOpen(day: WeeklyDayDraft, open: boolean): void {
    day.open = open;
    if (!open) day.firstStart = day.firstEnd = day.secondStart = day.secondEnd = '';
  }

  selectGoogleAccount(id: string): void {
    this.professionalDraft.googleAccountId = id || null;
    const account = this.googleAccounts.find((item) => item.id === id);
    if (account) {
      this.professionalDraft.email = account.email;
      this.professionalDraft.googleCalendarId = null;
    }
  }

  get selectedGoogleAccount(): GoogleAccountOption | undefined {
    return this.googleAccounts.find((item) => item.id === this.professionalDraft.googleAccountId);
  }

  accountStatus(account: GoogleAccountOption): string {
    const states = [!account.isActive && 'inativa', !account.connected && 'desconectada', account.authExpired && 'autenticação expirada'].filter(Boolean);
    return states.length ? states.join(', ') : 'disponível';
  }

  loadGoogleAccounts(): void {
    if (this.tenant?.googleAuthMode !== 'OAUTH_LINKA') return;
    this.loadingGoogleAccounts = true;
    this.googleAccountsError = '';
    this.api.listGoogleAccounts(this.tenantId).subscribe({
      next: ({ data }) => { this.googleAccounts = data; this.loadingGoogleAccounts = false; },
      error: (error: HttpErrorResponse) => {
        this.loadingGoogleAccounts = false;
        this.googleAccountsError = error.error?.message || 'Não foi possível consultar as contas Google. O vínculo salvo foi preservado.';
      },
    });
  }

  private emptyWeeklyDays(): WeeklyDayDraft[] {
    return this.weekdays.map((day) => ({ dayOfWeek: day.value, label: day.label,
      open: false, firstStart: '', firstEnd: '', secondStart: '', secondEnd: '' }));
  }

  private toWeeklyDays(intervals: WeeklyInterval[]): WeeklyDayDraft[] {
    const days = this.emptyWeeklyDays();
    for (const interval of intervals) {
      const day = days.find((item) => item.dayOfWeek === interval.dayOfWeek);
      if (!day) continue;
      day.open = true;
      if (interval.periodNumber === 1) { day.firstStart = interval.startTime; day.firstEnd = interval.endTime; }
      if (interval.periodNumber === 2) { day.secondStart = interval.startTime; day.secondEnd = interval.endTime; }
    }
    return days;
  }

  private toWeeklyIntervals(): WeeklyInterval[] {
    const result: WeeklyInterval[] = [];
    for (const day of this.weeklyDays) {
      if (!day.open) continue;
      const first = [day.firstStart, day.firstEnd];
      const second = [day.secondStart, day.secondEnd];
      if (!first.some(Boolean) && !second.some(Boolean)) throw new Error(`${day.label}: informe pelo menos um período ou marque Fechado.`);
      for (const [times, periodNumber] of [[first, 1], [second, 2]] as const) {
        if (!times.some(Boolean)) continue;
        if (!times[0] || !times[1]) throw new Error(`${day.label}: preencha início e fim do ${periodNumber}º período.`);
        if (times[0] >= times[1]) throw new Error(`${day.label}: o início do ${periodNumber}º período deve ser antes do fim.`);
        result.push({ dayOfWeek: day.dayOfWeek, periodNumber: periodNumber as 1 | 2, startTime: times[0], endTime: times[1] });
      }
      if (first[0] && second[0] && first[1] > second[0]) throw new Error(`${day.label}: o 1º período deve terminar antes do 2º começar.`);
    }
    return result;
  }

  toggleId(ids: number[], id: number, checked: boolean): void {
    const index = ids.indexOf(id);
    if (checked && index < 0) ids.push(id);
    if (!checked && index >= 0) ids.splice(index, 1);
  }

  appointmentRequirementChanged(): void {
    if (!this.serviceDraft.requiresAppointment) {
      this.serviceDraft.durationMinutes = null;
      this.serviceDraft.professionalIds = [];
      this.serviceDraft.requiresPayment = true;
    } else if (this.serviceDraft.durationMinutes === null) {
      this.serviceDraft.durationMinutes = 30;
    }
  }

  paymentRequirementChanged(): void {
    if (!this.serviceDraft.requiresPayment) this.serviceDraft.price = 0;
  }

  saveAgentSettings(form: NgForm): void {
    if (form.invalid || this.expiryMinutes < 30 || this.expiryMinutes > 1440) {
      this.error = 'Expiração deve estar entre 30 e 1440 minutos.';
      return;
    }
    this.busy = true;
    this.api.updateAgentSettings(this.tenantId, Number(this.expiryMinutes)).subscribe({
      next: ({ data }) => { this.busy = false; this.tenant = data; this.notice = 'Expiração atualizada.'; this.error = ''; },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  generateSecret(): void {
    if (this.tenant?.agentSecretConfigured &&
        !window.confirm('Substituir senha atual? A senha anterior deixará de funcionar imediatamente.')) return;
    this.busy = true;
    this.oneTimeSecret = '';
    this.api.generateAgentSecret(this.tenantId).subscribe({
      next: ({ data }) => {
        this.busy = false;
        this.oneTimeSecret = data.secret;
        if (this.tenant) this.tenant = { ...this.tenant, agentSecretConfigured: true };
        this.notice = 'Senha gerada. Copie agora; ela não será exibida novamente.';
        this.error = '';
      },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  revokeSecret(): void {
    if (!window.confirm('Revogar senha do Agente? As ferramentas deixarão de acessar este tenant.')) return;
    this.busy = true;
    this.api.revokeAgentSecret(this.tenantId).subscribe({
      next: () => {
        this.busy = false;
        this.oneTimeSecret = '';
        if (this.tenant) this.tenant = { ...this.tenant, agentSecretConfigured: false };
        this.notice = 'Senha revogada.';
        this.error = '';
      },
      error: (error: HttpErrorResponse) => { this.busy = false; this.handleError(error); },
    });
  }

  async copySecret(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.oneTimeSecret);
      this.notice = 'Senha copiada.';
    } catch {
      this.error = 'Não foi possível copiar automaticamente. Selecione e copie a senha.';
    }
  }

  logout(): void {
    this.oneTimeSecret = '';
    this.api.logout().subscribe({
      next: () => void this.router.navigateByUrl('/admin/login'),
      error: () => void this.router.navigateByUrl('/admin/login'),
    });
  }

  private newServiceDraft(): AdminServiceInput {
    return { name: '', description: null, durationMinutes: 30, locationType: 'ONLINE',
      price: 0, requiresAppointment: true, requiresPayment: false, active: true,
      professionalIds: [] };
  }

  private newProfessionalDraft(): AdminProfessionalInput {
    return { name: '', email: '', googleAccountId: null, googleCalendarId: null,
      active: true, serviceIds: [], weeklyIntervals: [] };
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) { void this.router.navigateByUrl('/admin/login'); return; }
    this.error = error.error?.message || 'Operação não concluída. Tente novamente.';
  }
}
