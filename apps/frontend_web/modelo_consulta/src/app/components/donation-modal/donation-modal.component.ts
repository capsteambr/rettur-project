import { Component, inject, HostListener } from '@angular/core';
import { DonationService } from '../../services/donation.service';

@Component({
  selector: 'app-donation-modal',
  standalone: true,
  imports: [],
  templateUrl: './donation-modal.component.html',
  styleUrl: './donation-modal.component.css'
})
export class DonationModalComponent {
  public donationService = inject(DonationService);

  @HostListener('document:keydown.escape')
  public onEscKey(): void {
    if (this.donationService.isOpen()) {
      this.close();
    }
  }

  public close(): void {
    this.donationService.close();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('donation-modal-overlay')) {
      this.close();
    }
  }
}
