import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  public donationService = inject(DonationService);
  public cookieConsentService = inject(CookieConsentService);

  public openDonationModal(event: Event): void {
    event.preventDefault();
    this.donationService.open();
  }

  public openCookiePreferences(event: Event): void {
    event.preventDefault();
    this.cookieConsentService.openSettings();
  }
}
