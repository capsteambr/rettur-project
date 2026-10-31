import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  public isOpen = signal<boolean>(false);

  public open(): void {
    this.isOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  public close(): void {
    this.isOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
