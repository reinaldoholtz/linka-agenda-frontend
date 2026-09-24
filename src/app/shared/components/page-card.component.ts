import { Component } from '@angular/core';

@Component({
  selector: 'app-page-card',
  standalone: true,
  template: `
    <div class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:max-w-lg">
      <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageCardComponent {}
