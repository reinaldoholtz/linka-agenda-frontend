import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }
}
