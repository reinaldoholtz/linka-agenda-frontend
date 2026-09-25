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
  email: string;
  method: PaymentMethod;
}

export interface AvailablePaymentMethodsResponse {
  paymentMethods: string[];
}

export interface PaymentConfirmation {
  paid: boolean;
  paymentStatus: string;
  service: string;
  professional: string;
  date: string;
  time: string;
}
