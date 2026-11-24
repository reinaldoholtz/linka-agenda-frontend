export interface AdminService {
  id: number;
  tenantConfigId: number;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  locationType: string | null;
  price: number;
  requiresAppointment: boolean;
  requiresPayment: boolean;
  active: boolean;
  professionalIds: number[];
}

export type AdminServiceInput = Omit<AdminService, 'id' | 'tenantConfigId'>;

export interface WeeklyInterval {
  dayOfWeek: number;
  periodNumber: 1 | 2;
  startTime: string;
  endTime: string;
}

export interface GoogleAccountOption {
  id: string;
  email: string;
  isActive: boolean;
  isDefault: boolean;
  connected: boolean;
  authExpired: boolean;
  selectable: boolean;
}

export interface AdminProfessional {
  id: number;
  tenantConfigId: number;
  name: string;
  email: string;
  googleAccountId: string | null;
  googleCalendarId: string | null;
  active: boolean;
  serviceIds: number[];
  weeklyIntervals: WeeklyInterval[];
}

export type AdminProfessionalInput = Omit<AdminProfessional, 'id' | 'tenantConfigId'>;
