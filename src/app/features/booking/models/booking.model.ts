export interface BookingService {
  id: string;
  name: string;
}

export interface Professional {
  id: number;
  name: string;
}

export interface AvailableTimeSlot {
  date: string; // formato ISO (yyyy-MM-dd)
  time: string; // formato HH:mm
}

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';

export interface PaymentDetails {
  name: string;
  document: string; // CPF/CNPJ
  email: string;
  method: PaymentMethod;
}
