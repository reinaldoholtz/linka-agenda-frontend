import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminApiService, TenantConfig, TenantConfigInput, TenantPage } from './admin-api.service';

@Component({
  standalone: true,
  selector: 'app-tenant-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <header class="border-b bg-white"><div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div><p class="text-xs font-bold uppercase tracking-widest text-sky-700">Linka Agenda</p><h1 class="text-2xl font-bold">Tenants</h1></div>
        <button type="button" (click)="logout()" class="rounded-xl border px-4 py-2">Sair</button>
      </div></header>
      <main class="mx-auto max-w-6xl px-4 py-8">
        @if (error) { <p role="alert" class="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{{ error }}</p> }
        @if (notice) { <p role="status" class="mb-5 rounded-xl bg-emerald-50 p-4 text-emerald-800">{{ notice }}</p> }
        @if (mode === 'list') {
          <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
            <p class="text-slate-600">Configurações de integração e pagamento</p>
            <button type="button" (click)="newTenant()" class="rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white">Novo Tenant</button>
          </div>
          <form (ngSubmit)="searchTenants()" class="mb-5 flex gap-2">
            <label class="sr-only" for="tenant-search">Pesquisar tenant</label>
            <input id="tenant-search" name="search" [(ngModel)]="search" placeholder="Nome ou Tenant ID" class="min-w-0 flex-1 rounded-xl border px-4 py-3" />
            <button type="submit" class="rounded-xl border bg-white px-5 font-semibold">Buscar</button>
          </form>
          <div class="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table class="w-full min-w-[850px] text-left text-sm">
              <thead class="bg-slate-50"><tr><th class="p-4">Nome</th><th class="p-4">Tenant ID</th><th class="p-4">Gateway</th><th class="p-4">Fuso</th><th class="p-4">Google</th><th class="p-4">Pagamento</th><th class="p-4">Ações</th></tr></thead>
              <tbody>
                @for (tenant of page?.content ?? []; track tenant.tenantId) {
                  <tr class="border-t"><td class="p-4 font-semibold">{{ tenant.tenantName }}</td><td class="p-4">{{ tenant.tenantId }}</td><td class="p-4">{{ tenant.tenantGateway }}</td><td class="p-4">{{ tenant.timeZone }}</td><td class="p-4">{{ tenant.googleAuthMode }}</td><td class="p-4">{{ tenant.paymentRequired ? 'Obrigatório' : 'Desativado' }}</td>
                    <td class="p-4"><div class="flex gap-3 whitespace-nowrap"><button type="button" (click)="manage(tenant.tenantId)" class="font-semibold text-sky-700">Gerenciar</button><button type="button" (click)="open(tenant.tenantId, 'view')" class="text-sky-700">Ver</button><button type="button" (click)="open(tenant.tenantId, 'edit')" class="text-sky-700">Editar</button><button type="button" (click)="remove(tenant)" class="text-red-700">Excluir</button></div></td>
                  </tr>
                } @empty { <tr><td colspan="7" class="p-8 text-center text-slate-500">Nenhum tenant encontrado.</td></tr> }
              </tbody>
            </table>
          </div>
          <div class="mt-5 flex items-center justify-between gap-3 text-sm">
            <span>{{ page?.totalElements ?? 0 }} tenant(s)</span>
            <div class="flex items-center gap-3"><button type="button" [disabled]="pageNumber === 0" (click)="changePage(-1)" class="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Anterior</button><span>{{ pageNumber + 1 }} / {{ page?.totalPages || 1 }}</span><button type="button" [disabled]="!page || pageNumber + 1 >= page.totalPages" (click)="changePage(1)" class="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Próxima</button></div>
          </div>
        } @else {
          <div class="mb-6 flex items-center justify-between">
            <div><button type="button" (click)="back()" class="mb-2 text-sm font-semibold text-sky-700">Voltar à lista</button><h2 class="text-2xl font-bold">{{ mode === 'new' ? 'Novo Tenant' : mode === 'edit' ? 'Editar Tenant' : 'Detalhes do Tenant' }}</h2></div>
            @if (mode === 'view') { <button type="button" (click)="mode = 'edit'" class="rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white">Editar</button> }
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
            <section class="card"><h3 class="section-title">Dados gerais</h3><div class="grid gap-5 sm:grid-cols-2">
              <label class="field">Nome do tenant *<input formControlName="tenantName" [readOnly]="mode === 'view'" maxlength="150" class="input" /></label>
              <label class="field">Tenant ID *<input formControlName="tenantId" [readOnly]="mode !== 'new'" maxlength="100" class="input" /></label>
              <label class="field">Fuso horário IANA *<input formControlName="timeZone" [readOnly]="mode === 'view'" placeholder="Europe/Lisbon" class="input" /></label>
              <label class="field">Telefone do canal<input formControlName="phoneNumberChannel" [readOnly]="mode === 'view'" type="tel" maxlength="30" class="input" /></label>
            </div></section>
            <section class="card"><h3 class="section-title">Integração Linka</h3><div class="grid gap-5 sm:grid-cols-2">
              <label class="field">API ID Linka<input formControlName="apiIdLinka" [readOnly]="mode === 'view'" maxlength="100" class="input" /></label>
              @if (mode !== 'view') { <label class="field">API Bearer Linka<input formControlName="apiBearerLinka" type="password" autocomplete="new-password" class="input" /><span class="hint">{{ selected?.apiBearerLinkaConfigured ? 'Configurado. Deixe vazio para manter.' : 'Não configurado' }}</span></label> }
              @else { <p class="field">API Bearer Linka<span class="hint">{{ selected?.apiBearerLinkaConfigured ? 'Configurado' : 'Não configurado' }}</span></p> }
            </div></section>
            <section class="card"><h3 class="section-title">Google Calendar</h3><label class="field">Modo de autenticação *<select formControlName="googleAuthMode" class="input" [attr.disabled]="mode === 'view' ? true : null"><option value="SERVICE_ACCOUNT">SERVICE_ACCOUNT</option><option value="OAUTH_LINKA">OAUTH_LINKA</option></select></label></section>
            <section class="card"><h3 class="section-title">Pagamento</h3>
              <label class="mb-5 flex items-center gap-3 font-semibold"><input type="checkbox" formControlName="paymentRequired" [attr.disabled]="mode === 'view' ? true : null" class="h-5 w-5 accent-sky-700" /> Pagamento obrigatório</label>
              <label class="field">Gateway *<select formControlName="tenantGateway" class="input" [attr.disabled]="mode === 'view' ? true : null"><option value="STRIPE">STRIPE</option><option value="ASAAS">ASAAS</option></select></label>
              @if (form.controls.paymentRequired.value && form.controls.tenantGateway.value === 'STRIPE') {
                <div class="mt-5 grid gap-5 sm:grid-cols-2">
                  @if (mode !== 'view') {
                    <label class="field">Stripe API Key<input formControlName="stripeApiKey" type="password" autocomplete="new-password" class="input" /><span class="hint">{{ selected?.stripeApiKeyConfigured ? 'Configurada. Deixe vazio para manter.' : 'Não configurada' }}</span></label>
                    <label class="field">Stripe Webhook Secret<input formControlName="stripeWebhookSecret" type="password" autocomplete="new-password" class="input" /><span class="hint">{{ selected?.stripeWebhookSecretConfigured ? 'Configurado. Deixe vazio para manter.' : 'Não configurado' }}</span></label>
                  } @else { <p class="field">Stripe API Key<span class="hint">{{ selected?.stripeApiKeyConfigured ? 'Configurada' : 'Não configurada' }}</span></p><p class="field">Stripe Webhook Secret<span class="hint">{{ selected?.stripeWebhookSecretConfigured ? 'Configurado' : 'Não configurado' }}</span></p> }
                </div>
              }
            </section>
            @if (mode !== 'view') { <div class="flex justify-end gap-3"><button type="button" (click)="back()" class="rounded-xl border bg-white px-5 py-3">Cancelar</button><button type="submit" [disabled]="busy" class="rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{{ busy ? 'Salvando...' : 'Salvar Tenant' }}</button></div> }
          </form>
        }
      </main>
    </div>
  `,
  styles: [`
    .card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 3px #0001; }
    .section-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 1.25rem; }
    .field { display: block; font-size: .875rem; font-weight: 600; color: #334155; }
    .input { display: block; width: 100%; margin-top: .5rem; padding: .75rem; border: 1px solid #cbd5e1; border-radius: .75rem; background: white; font-weight: 400; color: #0f172a; }
    .input:focus { outline: 2px solid #bae6fd; border-color: #0284c7; }
    .hint { display: block; margin-top: .5rem; font-size: .75rem; font-weight: 400; color: #64748b; }
  `],
})
export class TenantAdminComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly builder = inject(FormBuilder);
  private readonly router = inject(Router);
  mode: 'list' | 'new' | 'view' | 'edit' = 'list';
  page: TenantPage | null = null;
  pageNumber = 0;
  search = '';
  selected: TenantConfig | null = null;
  busy = false;
  error = '';
  notice = '';
  form = this.builder.nonNullable.group({
    tenantName: ['', Validators.required], tenantId: ['', Validators.required],
    tenantGateway: ['STRIPE' as 'ASAAS' | 'STRIPE', Validators.required],
    timeZone: ['Europe/Lisbon', Validators.required], phoneNumberChannel: [''],
    apiIdLinka: [''], apiBearerLinka: [''],
    googleAuthMode: ['SERVICE_ACCOUNT' as 'SERVICE_ACCOUNT' | 'OAUTH_LINKA', Validators.required],
    paymentRequired: [true], stripeApiKey: [''], stripeWebhookSecret: [''],
  });

  ngOnInit(): void { this.load(); }
  load(): void {
    this.api.list(this.search, this.pageNumber).subscribe({
      next: ({ data }) => { this.page = data; this.error = ''; },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }
  searchTenants(): void { this.pageNumber = 0; this.load(); }
  changePage(delta: number): void { this.pageNumber += delta; this.load(); }
  manage(id: string): void { void this.router.navigate(['/admin/tenants', id, 'catalog']); }
  back(): void { this.mode = 'list'; this.selected = null; this.error = ''; this.load(); }
  newTenant(): void {
    this.selected = null; this.error = ''; this.notice = '';
    this.form.reset({ tenantName: '', tenantId: '', tenantGateway: 'STRIPE', timeZone: 'Europe/Lisbon',
      phoneNumberChannel: '', apiIdLinka: '', apiBearerLinka: '', googleAuthMode: 'SERVICE_ACCOUNT',
      paymentRequired: true, stripeApiKey: '', stripeWebhookSecret: '' });
    this.mode = 'new';
  }
  open(id: string, mode: 'view' | 'edit'): void {
    this.error = ''; this.notice = '';
    this.api.get(id).subscribe({
      next: ({ data }) => {
        this.selected = data;
        this.form.reset({ tenantName: data.tenantName, tenantId: data.tenantId,
          tenantGateway: data.tenantGateway, timeZone: data.timeZone,
          phoneNumberChannel: data.phoneNumberChannel ?? '', apiIdLinka: data.apiIdLinka ?? '',
          apiBearerLinka: '', googleAuthMode: data.googleAuthMode, paymentRequired: data.paymentRequired,
          stripeApiKey: '', stripeWebhookSecret: '' });
        this.mode = mode;
      }, error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error = 'Preencha campos obrigatórios.'; return; }
    const value = this.form.getRawValue() as TenantConfigInput;
    if (value.paymentRequired && value.tenantGateway === 'STRIPE' &&
        ((!value.stripeApiKey && !this.selected?.stripeApiKeyConfigured) ||
         (!value.stripeWebhookSecret && !this.selected?.stripeWebhookSecretConfigured))) {
      this.error = 'Informe Stripe API Key e Stripe Webhook Secret.'; return;
    }
    this.busy = true; this.error = '';
    const request = this.mode === 'new' ? this.api.create(value) : this.api.update(this.selected!.tenantId, value);
    request.subscribe({
      next: () => { this.busy = false; this.notice = 'Tenant salvo.'; this.mode = 'list'; this.selected = null; this.load(); },
      error: (err: HttpErrorResponse) => { this.busy = false; this.handleError(err); },
    });
  }
  remove(tenant: TenantConfig): void {
    if (!window.confirm(`Excluir tenant ${tenant.tenantName} (${tenant.tenantId})?`)) return;
    this.api.delete(tenant.tenantId).subscribe({
      next: () => { this.notice = 'Tenant excluído.'; this.load(); },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }
  logout(): void {
    this.api.logout().subscribe({
      next: () => void this.router.navigateByUrl('/admin/login'),
      error: () => void this.router.navigateByUrl('/admin/login'),
    });
  }
  private handleError(err: HttpErrorResponse): void {
    if (err.status === 401) { void this.router.navigateByUrl('/admin/login'); return; }
    this.error = err.error?.message || 'Operação não concluída. Tente novamente.';
  }
}
