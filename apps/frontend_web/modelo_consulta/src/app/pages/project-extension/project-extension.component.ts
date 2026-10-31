import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-project-extension',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-extension.component.html',
  styleUrl: './project-extension.component.css'
})
export class ProjectExtensionComponent {
  private analyticsService = inject(AnalyticsService);

  public trackDownload(platform: string, url: string): void {
    this.analyticsService.trackDownload('OpenCNPJ Extensao', platform, url);
  }
}
