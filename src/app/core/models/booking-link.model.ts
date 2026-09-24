export interface ValidateBookingLinkResult {
  valid: boolean;
  name: string | null;
  phoneNumber: string | null;
  expiresAt: string | null;
}
