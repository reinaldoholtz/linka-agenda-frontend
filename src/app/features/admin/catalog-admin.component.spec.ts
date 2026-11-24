import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from './admin-api.service';
import { CatalogAdminComponent } from './catalog-admin.component';

describe('CatalogAdminComponent weekly periods', () => {
  let component: CatalogAdminComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: AdminApiService, useValue: {} },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'tenant-1' } } } },
      { provide: Router, useValue: {} },
    ] });
    component = TestBed.runInInjectionContext(() => new CatalogAdminComponent());
  });

  it('recarrega segundo período isolado na segunda coluna', () => {
    component.weeklyDays = component['toWeeklyDays']([
      { dayOfWeek: 3, periodNumber: 2, startTime: '14:00', endTime: '18:00' },
    ]);
    const wednesday = component.weeklyDays.find((day) => day.dayOfWeek === 3)!;
    expect(wednesday.open).toBeTrue();
    expect(wednesday.firstStart).toBe('');
    expect(wednesday.secondStart).toBe('14:00');
    expect(component['toWeeklyIntervals']()).toEqual([
      { dayOfWeek: 3, periodNumber: 2, startTime: '14:00', endTime: '18:00' },
    ]);
  });

  it('rejeita período parcial e sobreposição e ignora dia fechado', () => {
    const monday = component.weeklyDays[0];
    monday.open = true;
    monday.secondStart = '14:00';
    expect(() => component['toWeeklyIntervals']()).toThrowError(/preencha início e fim/);
    monday.secondEnd = '18:00';
    monday.firstStart = '09:00';
    monday.firstEnd = '15:00';
    expect(() => component['toWeeklyIntervals']()).toThrowError(/1º período/);
    component.setDayOpen(monday, false);
    expect(component['toWeeklyIntervals']()).toEqual([]);
  });
});
