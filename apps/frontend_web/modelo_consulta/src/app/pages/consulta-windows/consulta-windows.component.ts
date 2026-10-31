import { Component, signal, inject, OnInit, OnDestroy, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CnpjService, CnpjData, QueryResult } from '../../services/cnpj.service';

interface DesktopWindow {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-consulta-windows',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-windows.component.html',
  styleUrl: './consulta-windows.component.css'
})
export class ConsultaWindowsComponent implements OnInit, OnDestroy {
  public cnpjService = inject(CnpjService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);

  // Time for Windows taskbar clock
  public currentTime = signal<string>('12:00');
  private clockInterval?: any;

  // Start Menu toggle
  public isStartMenuOpen = signal<boolean>(false);

  // Windows State
  public windows = signal<Record<string, DesktopWindow>>({
    cnpjApp: {
      id: 'cnpjApp',
      title: 'Consulta de Empresas — OpenCNPJ 98',
      icon: 'fa-building',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      x: 60,
      y: 40,
      width: 680,
      height: 520
    },
    cmdApp: {
      id: 'cmdApp',
      title: 'Prompt do MS-DOS',
      icon: 'fa-terminal',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 9,
      x: 140,
      y: 90,
      width: 620,
      height: 400
    },
    notepadApp: {
      id: 'notepadApp',
      title: 'LEIAME.txt - Bloco de Notas',
      icon: 'fa-file-lines',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 8,
      x: 200,
      y: 120,
      width: 500,
      height: 360
    },
    mobileApp: {
      id: 'mobileApp',
      title: 'OpenCNPJ Mobile & Extensão',
      icon: 'fa-mobile-screen',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 7,
      x: 240,
      y: 150,
      width: 480,
      height: 380
    }
  });

  private topZIndex = 20;

  // Dragging state
  private draggingWindowId: string | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // CNPJ Form State in Windows 98
  public cnpjInput = signal<string>('');
  public currentCnpj = signal<string | null>(null);
  public isConsulting = signal<boolean>(false);
  public companyData = signal<CnpjData | null>(null);
  public errorMessage = signal<string | null>(null);
  public copyFeedback = signal<string | null>(null);

  // MS-DOS Command Prompt state
  public cmdInput = signal<string>('');
  public cmdLines = signal<string[]>([
    'Microsoft(R) Windows 98',
    '   (C)Copyright Microsoft Corp 1981-1998.',
    ' ',
    'OpenCNPJ MS-DOS Subsystem v2.1 [OpenCaramelo]',
    "Digite 'cnpj <numero>' para consultar ou 'help' para comandos.",
    ' '
  ]);

  ngOnInit(): void {
    this.titleService.setTitle('Windows 98 | OpenCNPJ');
    this.updateClock();
    
    if (isPlatformBrowser(this.platformId)) {
      this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }

    this.route.paramMap.subscribe(paramMap => {
      let q = paramMap.get('cnpj');
      if (!q) {
        q = this.route.snapshot.queryParamMap.get('cnpj');
      }

      if (q) {
        const clean = this.cnpjService.cleanCnpj(q);
        if (clean) {
          this.currentCnpj.set(clean);
          this.cnpjInput.set(this.cnpjService.maskCnpjInput(clean));
          this.runCnpjConsultation(false);
          return;
        }
      }
      // Estado inicial limpo e vazio (sem CNPJ pré-carregado)
      this.cnpjInput.set('');
      this.currentCnpj.set(null);
      this.companyData.set(null);
      this.errorMessage.set(null);
    });
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    this.currentTime.set(`${hours}:${mins}`);
  }

  public openWindow(id: string): void {
    this.isStartMenuOpen.set(false);
    const winMap = { ...this.windows() };
    if (winMap[id]) {
      this.topZIndex++;
      winMap[id] = {
        ...winMap[id],
        isOpen: true,
        isMinimized: false,
        zIndex: this.topZIndex
      };
      this.windows.set(winMap);
    }
  }

  public closeWindow(id: string): void {
    const winMap = { ...this.windows() };
    if (winMap[id]) {
      winMap[id] = { ...winMap[id], isOpen: false };
      this.windows.set(winMap);
    }
  }

  public minimizeWindow(id: string): void {
    const winMap = { ...this.windows() };
    if (winMap[id]) {
      winMap[id] = { ...winMap[id], isMinimized: true };
      this.windows.set(winMap);
    }
  }

  public toggleMaximizeWindow(id: string): void {
    const winMap = { ...this.windows() };
    if (winMap[id]) {
      winMap[id] = { ...winMap[id], isMaximized: !winMap[id].isMaximized };
      this.windows.set(winMap);
    }
  }

  public focusWindow(id: string): void {
    const winMap = { ...this.windows() };
    if (winMap[id]) {
      if (winMap[id].isMinimized) {
        winMap[id].isMinimized = false;
      }
      this.topZIndex++;
      winMap[id].zIndex = this.topZIndex;
      this.windows.set(winMap);
    }
  }

  // Dragging handlers
  public startDrag(id: string, event: MouseEvent): void {
    if (this.windows()[id]?.isMaximized) return;
    this.draggingWindowId = id;
    this.focusWindow(id);
    const win = this.windows()[id];
    this.dragOffsetX = event.clientX - win.x;
    this.dragOffsetY = event.clientY - win.y;
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (!this.draggingWindowId) return;
    const winMap = { ...this.windows() };
    const win = winMap[this.draggingWindowId];
    if (win) {
      win.x = Math.max(0, event.clientX - this.dragOffsetX);
      win.y = Math.max(0, event.clientY - this.dragOffsetY);
      this.windows.set(winMap);
    }
  }

  @HostListener('window:mouseup')
  public onMouseUp(): void {
    this.draggingWindowId = null;
  }

  // CNPJ Consultation
  public onCnpjInputChange(value: string): void {
    const masked = this.cnpjService.maskCnpjInput(value);
    this.cnpjInput.set(masked);
  }

  public async runCnpjConsultation(updateUrl = true): Promise<void> {
    const clean = this.cnpjService.cleanCnpj(this.cnpjInput());
    if (!clean || clean.length < 14) {
      this.errorMessage.set('O CNPJ deve conter 14 dígitos numéricos.');
      return;
    }

    this.currentCnpj.set(clean);
    this.isConsulting.set(true);
    this.errorMessage.set(null);

    if (updateUrl) {
      if (typeof window !== 'undefined') {
        window.location.href = `/windows/${clean}`;
        return;
      }
    }

    try {
      const res = await this.cnpjService.consultCnpj(clean);
      if (res.status === 200 && res.data?.data) {
        const data = res.data.data;
        this.companyData.set(data);
        const cnpjFormatado = this.cnpjService.formatCnpj(clean);
        this.titleService.setTitle(`${cnpjFormatado} - ${data.razaoSocial || data.nomeFantasia || 'Consulta'} | OpenCNPJ`);
      } else {
        this.companyData.set(null);
        this.titleService.setTitle('CNPJ não encontrado | OpenCNPJ');
        const errorMsg = res.data?.message || res.data?.error || 'Empresa não encontrada na base de dados da Receita.';
        this.errorMessage.set(errorMsg);
      }
    } catch {
      this.companyData.set(null);
      this.titleService.setTitle('Erro na consulta | OpenCNPJ');
      this.errorMessage.set('Falha de conexão com os servidores de consulta.');
    } finally {
      this.isConsulting.set(false);
    }
  }

  public clearSearch(): void {
    this.cnpjInput.set('');
    this.currentCnpj.set(null);
    this.companyData.set(null);
    this.errorMessage.set(null);
    this.titleService.setTitle('Consulta de CNPJ | OpenCNPJ');
    this.router.navigate(['/windows']);
  }

  public setPreset(val: string): void {
    this.cnpjInput.set(val);
    this.runCnpjConsultation(true);
  }

  public copyCnpjSummary(): void {
    const d = this.companyData();
    if (!d) return;

    const text = [
      `CNPJ: ${this.cnpjService.formatCnpj(d.cnpj)}`,
      `RAZÃO SOCIAL: ${d.razaoSocial}`,
      `FANTASIA: ${d.nomeFantasia || 'N/A'}`,
      `SITUAÇÃO: ${d.situacaoCadastral} (${d.dataSituacaoCadastral})`,
      `CAPITAL SOCIAL: ${this.cnpjService.formatCurrency(d.capitalSocial)}`,
      `ENDEREÇO: ${d.logradouro}, ${d.numero} - ${d.bairro}, ${d.municipio}-${d.uf} (CEP: ${d.cep})`,
      `TELEFONE: ${d.telefone || 'N/A'}`
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copyFeedback.set('Ficha copiada para a Área de Transferência!');
        setTimeout(() => this.copyFeedback.set(null), 2500);
      });
    }
  }

  // MS-DOS Command Execution
  public handleCmdKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const raw = this.cmdInput().trim();
      this.executeCmd(raw);
      this.cmdInput.set('');
    }
  }

  private async executeCmd(cmd: string): Promise<void> {
    const lines = [...this.cmdLines(), `C:\\OPENCNPJ> ${cmd}`];
    const lower = cmd.toLowerCase().trim();

    if (!lower) {
      this.cmdLines.set(lines);
      return;
    }

    if (lower === 'cls' || lower === 'clear') {
      this.cmdLines.set(['C:\\OPENCNPJ> ']);
      return;
    }

    if (lower === 'ver') {
      lines.push('Microsoft Windows 98 [Version 4.10.1998]');
      lines.push('OpenCNPJ Command Processor 1.0');
      this.cmdLines.set(lines);
      return;
    }

    if (lower === 'dir') {
      lines.push(' Volume in drive C is OPENCNPJ');
      lines.push(' Volume Serial Number is 1998-0001');
      lines.push(' Directory of C:\\OPENCNPJ');
      lines.push(' ');
      lines.push('09/16/2026  09:00a    <DIR>          .');
      lines.push('09/16/2026  09:00a    <DIR>          ..');
      lines.push('09/16/2026  10:30a           145,280 CNPJ.EXE');
      lines.push('09/16/2026  10:32a             1,240 LEIAME.TXT');
      lines.push('09/16/2026  11:15a           384,192 MOBILE.LNK');
      lines.push('               3 File(s)        530,712 bytes');
      lines.push('               2 Dir(s)   2,147,483,648 bytes free');
      this.cmdLines.set(lines);
      return;
    }

    if (lower === 'help') {
      lines.push('Comandos suportados no MS-DOS OpenCNPJ:');
      lines.push('  CNPJ <numero>   Consulta o CNPJ na base pública oficial');
      lines.push('  DIR             Exibe os arquivos do diretório');
      lines.push('  VER             Exibe a versão do sistema operacional');
      lines.push('  CLS             Limpa a tela do prompt');
      lines.push('  WIN             Abre o utilitário gráfico Consulta CNPJ.exe');
      lines.push('  EXIT            Fecha a janela do prompt');
      this.cmdLines.set(lines);
      return;
    }

    if (lower === 'win') {
      this.openWindow('cnpjApp');
      lines.push('Iniciando Consulta CNPJ.exe...');
      this.cmdLines.set(lines);
      return;
    }

    if (lower === 'exit') {
      this.closeWindow('cmdApp');
      return;
    }

    // Se começar com cnpj ou for uma sequência numérica
    const cleanNumber = this.cnpjService.cleanCnpj(cmd);
    if (lower.startsWith('cnpj') || cleanNumber.length >= 11) {
      const targetCnpj = cleanNumber || '00000000000191';
      lines.push(`Consultando Receita Federal para o CNPJ ${this.cnpjService.formatCnpj(targetCnpj)}...`);
      this.cmdLines.set(lines);

      try {
        const res = await this.cnpjService.consultCnpj(targetCnpj);
        if (res.status === 200 && res.data?.data) {
          const d = res.data.data;
          lines.push('----------------------------------------------------');
          lines.push(`RAZAO SOCIAL: ${d.razaoSocial}`);
          lines.push(`FANTASIA    : ${d.nomeFantasia || 'Nenhum'}`);
          lines.push(`SITUACAO    : ${d.situacaoCadastral} em ${d.dataSituacaoCadastral}`);
          lines.push(`CAPITAL     : ${this.cnpjService.formatCurrency(d.capitalSocial)}`);
          lines.push(`ENDERECO    : ${d.logradouro}, ${d.numero} - ${d.municipio}/${d.uf}`);
          lines.push('----------------------------------------------------');
        } else {
          lines.push(`ERRO: ${res.data?.error || 'CNPJ não encontrado.'}`);
        }
      } catch {
        lines.push('ERRO: Não foi possível conectar ao servidor de consulta.');
      }
      this.cmdLines.set([...lines, ' ']);
      return;
    }

    lines.push(`Comando ou nome de arquivo inválido: '${cmd}'`);
    lines.push("Digite 'help' para ver a lista de comandos disponíveis.");
    this.cmdLines.set(lines);
  }
}
