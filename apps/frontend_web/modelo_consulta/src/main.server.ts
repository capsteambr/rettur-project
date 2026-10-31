import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { INITIAL_THEME } from './app/services/theme.service';

const bootstrap = (context: BootstrapContext) => {
  const serverTheme = context?.platformRef?.injector?.get(INITIAL_THEME, 'dark') || 'dark';
  return bootstrapApplication(AppComponent, {
    ...config,
    providers: [
      ...config.providers,
      { provide: INITIAL_THEME, useValue: serverTheme }
    ]
  }, context);
};

export default bootstrap;
