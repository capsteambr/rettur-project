import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ConsultaComponent } from './pages/consulta/consulta.component';
import { ConsultaTerminalComponent } from './pages/consulta-terminal/consulta-terminal.component';
import { ConsultaWindowsComponent } from './pages/consulta-windows/consulta-windows.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProjectMobileComponent } from './pages/project-mobile/project-mobile.component';
import { ProjectExtensionComponent } from './pages/project-extension/project-extension.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ApiDocsComponent } from './pages/api-docs/api-docs.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'OpenCNPJ | API Gratuita e de Alta Performance para Consulta de Dados'
  },
  {
    path: 'api',
    component: ApiDocsComponent,
    title: 'Documentação da API REST | OpenCNPJ & OpenCaramelo'
  },
  {
    path: 'documentacao',
    redirectTo: 'api',
    pathMatch: 'full'
  },
  {
    path: 'docs',
    redirectTo: 'api',
    pathMatch: 'full'
  },
  {
    path: 'politica-de-privacidade',
    component: PrivacyPolicyComponent,
    title: 'Política de Privacidade | OpenCNPJ (Extensão, Mobile e Web)'
  },
  {
    path: 'privacidade',
    redirectTo: 'politica-de-privacidade',
    pathMatch: 'full'
  },
  {
    path: 'privacy',
    redirectTo: 'politica-de-privacidade',
    pathMatch: 'full'
  },
  {
    path: 'politica-privacidade',
    redirectTo: 'politica-de-privacidade',
    pathMatch: 'full'
  },
  {
    path: 'downloads/OpenCNPJ/Mobile/privacidade',
    component: PrivacyPolicyComponent,
    title: 'Política de Privacidade - OpenCNPJ Mobile'
  },
  {
    path: 'downloads/OpenCNPJ/Extensao/privacidade',
    component: PrivacyPolicyComponent,
    title: 'Política de Privacidade - OpenCNPJ Extensão'
  },
  {
    path: 'consulta',
    component: ConsultaComponent,
    title: 'Consulta Cadastral de CNPJ | OpenCNPJ'
  },
  {
    path: 'terminal',
    component: ConsultaTerminalComponent,
    title: 'Terminal Retrô Linux | OpenCNPJ & OpenCaramelo'
  },
  {
    path: 'linux',
    component: ConsultaTerminalComponent,
    title: 'Terminal Retrô Linux | OpenCNPJ & OpenCaramelo'
  },
  {
    path: 'windows',
    component: ConsultaWindowsComponent,
    title: 'Windows 98 Desktop | OpenCNPJ & OpenCaramelo'
  },
  {
    path: 'consulta/terminal',
    redirectTo: 'terminal',
    pathMatch: 'full'
  },
  {
    path: 'consulta/linux',
    redirectTo: 'linux',
    pathMatch: 'full'
  },
  {
    path: 'consulta/windows',
    redirectTo: 'windows',
    pathMatch: 'full'
  },
  {
    path: 'consulta/:cnpj',
    redirectTo: '/:cnpj',
    pathMatch: 'full'
  },
  
  {
    path: 'downloads/OpenCNPJ/Mobile',
    component: ProjectMobileComponent,
    title: 'OpenCNPJ Mobile - Aplicativo Android & iOS | OpenCNPJ'
  },
  {
    path: 'downloads/OpenCNPJ/Extensao',
    component: ProjectExtensionComponent,
    title: 'OpenCNPJ Extensão de Navegador | OpenCNPJ'
  },
  {
    path: 'downloads/opencnpj/mobile',
    redirectTo: 'downloads/OpenCNPJ/Mobile',
    pathMatch: 'full'
  },
  {
    path: 'downloads/opencnpj/extensao',
    redirectTo: 'downloads/OpenCNPJ/Extensao',
    pathMatch: 'full'
  },
  {
    path: 'downloads/mobile',
    redirectTo: 'downloads/OpenCNPJ/Mobile',
    pathMatch: 'full'
  },
  {
    path: 'downloads/extensao',
    redirectTo: 'downloads/OpenCNPJ/Extensao',
    pathMatch: 'full'
  },
  {
    path: 'terminal/:cnpj',
    component: ConsultaTerminalComponent,
    title: 'Terminal Retrô Linux | OpenCNPJ'
  },
  {
    path: 'linux/:cnpj',
    component: ConsultaTerminalComponent,
    title: 'Terminal Retrô Linux | OpenCNPJ'
  },
  {
    path: 'windows/:cnpj',
    component: ConsultaWindowsComponent,
    title: 'Windows 98 Desktop | OpenCNPJ'
  },
  {
    path: ':cnpj',
    component: ConsultaComponent,
    title: 'Consulta Cadastral de CNPJ | OpenCNPJ'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Página Não Encontrada | OpenCNPJ'
  }
];
