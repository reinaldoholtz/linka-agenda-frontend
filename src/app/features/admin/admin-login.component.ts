import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminApiService } from './admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-slate-100 px-4 py-12 flex items-center justify-center">
      <section class="w-full max-w-md rounded-3xl bg-white p-7 sm:p-10 shadow-xl shadow-slate-200/70">
        <div class="mb-8">
          <p class="text-sm font-bold uppercase tracking-[.2em] text-sky-700">Linka Agenda</p>
          <h1 class="mt-3 text-3xl font-bold text-slate-900">Acesso administrativo</h1>
          <p class="mt-2 text-slate-600">Entre para gerenciar configurações dos tenants.</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <label class="block text-sm font-semibold text-slate-700">Usuário
            <input formControlName="username" autocomplete="username" class="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label class="block text-sm font-semibold text-slate-700">Senha
            <input type="password" formControlName="password" autocomplete="current-password" class="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" />
          </label>
          @if (error) { <p role="alert" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error }}</p> }
          <button type="submit" [disabled]="busy" class="w-full rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800 disabled:opacity-50">
            {{ busy ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <a routerLink="/" class="mt-8 inline-block text-sm text-slate-500 hover:text-sky-700">Voltar à agenda</a>
      </section>
    </main>
  `,
})
export class AdminLoginComponent {
  private readonly builder = inject(FormBuilder);
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  form = this.builder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  busy = false;
  error = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Informe usuário e senha.';
      return;
    }
    this.busy = true;
    this.error = '';
    const { username, password } = this.form.getRawValue();
    this.api.login(username, password).subscribe({
      next: () => void this.router.navigateByUrl('/admin/tenants'),
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.status === 401 ? 'Usuário ou senha inválidos.' : 'Não foi possível entrar. Tente novamente.';
      },
    });
  }
}
