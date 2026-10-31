import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Title } from '@angular/platform-browser';
import { CnpjService } from '../../services/cnpj.service';

interface TerminalLine {
  text: string;
  class?: string;
}

interface StartXHistoryItem {
  label: string;
  value: string;
  isError?: boolean;
  isSuccess?: boolean;
}

declare var Dos: any;

@Component({
  selector: 'app-consulta-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SafeHtmlPipe],
  templateUrl: './consulta-terminal.component.html',
  styleUrl: './consulta-terminal.component.css'
})
export class ConsultaTerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  private cnpjService = inject(CnpjService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  @ViewChild('terminal') private terminalEl!: ElementRef<HTMLDivElement>;
  @ViewChild('inputArea') private inputAreaEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('matrixCanvas') private matrixCanvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dosGameContainer') private dosGameContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('startXTerminalBody') private startXTerminalBody?: ElementRef<HTMLDivElement>;

  public lines: TerminalLine[] = [];
  public commandHistory: string[] = [];
  public historyIndex = 0;
  public isBooted = false;
  public isFormatting = false;
  public isMuted = false;
  public audioUnlocked = false;

  public isMatrixRunning = false;
  public matrixInterval: any;
  public originalLines: TerminalLine[] = [];

  public isGameRunning = false;
  private dosInstance: any = null;

  public currentLabel = 'guest@opencnpj:~$';
  public copyableText: string | null = null;
  public isCopied = false;

  // CNPJ consultado atualmente para persistir na troca de modos
  public currentCnpj = signal<string | null>(null);

  // Estado para login interno no terminal
  public authState: 'NORMAL' | 'AWAITING_PASS' = 'NORMAL';
  public pendingUser = '';

  // Estado do Ambiente Gráfico X11 Integrado (startx)
  public isStartXRunning = false;
  public startXState: 'LOGIN' | 'PASSWORD' | 'SUCCESS' = 'LOGIN';
  public startXUsername = '';
  public startXPassword = '';
  public startXCurrentInput = '';
  public startXHistory: StartXHistoryItem[] = [];
  public startXIsMaximized = false;
  public startXIsMinimized = false;
  public startXClock = '';
  private startXClockTimer: any = null;

  // Arraste da Janela X11
  public startXPos = { x: 50, y: 50 };
  public isStartXDragging = false;
  private startXDragStart = { mouseX: 0, mouseY: 0, startX: 0, startY: 0 };

  private readonly fortunes = [
    'O software livre é como a liberdade de expressão, não como cerveja grátis. — Richard Stallman',
    'Simplicidade é pré-requisito para confiabilidade. — Edsger W. Dijkstra',
    'Existem apenas 10 tipos de pessoas no mundo: as que entendem binário e as que não entendem.',
    'No meu computador funciona! — Desenvolvedor anônimo, 1998',
    'Antes de tentar entender o código dos outros, tente entender o seu de ontem.',
    'Dados públicos devem ser abertos, acessíveis e rápidos. É para isso que o OpenCaramelo existe.',
    'Se depurar é a arte de remover bugs, programar deve ser a arte de inseri-los. — Edsger W. Dijkstra'
  ];

  private readonly bootSequence = [
    { text: 'Booting OpenCNPJ Linux Kernel v5.15-retro...', class: 'text-info' },
    { text: 'Loading SoundBlaster 16 audio emulation... [OK]', class: 'text-success' },
    { text: 'Mounting Receita Federal public database modules... [OK]', class: 'text-success' },
    { text: 'Connecting to https://kitana.opencnpj.com gateway... [OK]', class: 'text-success' },
    { text: ' ', delay: 35 },
    { text: '==================================================================', class: 'text-comment' },
    { text: '  Terminal Interativo OpenCNPJ — Iniciativa OpenCaramelo', class: 'text-info' },
    { text: "  Digite um CNPJ para consultar ou digite 'help' para comandos.", class: 'text-comment' },
    { text: '==================================================================', class: 'text-comment' },
    { text: `Data do sistema: ${new Date().toString()}`, class: 'text-comment' },
    { text: ' ', delay: 35 }
  ];

  ngOnInit(): void {
    this.titleService.setTitle('Terminal | OpenCNPJ');
  }

  ngAfterViewInit(): void {
    this.startBootSequence();
    this.checkStoredEasterEgg();
  }

  ngOnDestroy(): void {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
    }
    if (this.startXClockTimer) {
      clearInterval(this.startXClockTimer);
    }
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  public onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isStartXRunning) {
      this.closeStartX(false);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  public onStartXMouseMove(event: MouseEvent): void {
    if (!this.isStartXDragging || this.startXIsMaximized) return;
    const dx = event.clientX - this.startXDragStart.mouseX;
    const dy = event.clientY - this.startXDragStart.mouseY;
    this.startXPos = {
      x: Math.max(0, Math.min(window.innerWidth - 100, this.startXDragStart.startX + dx)),
      y: Math.max(36, Math.min(window.innerHeight - 50, this.startXDragStart.startY + dy))
    };
  }

  @HostListener('window:mouseup')
  public onStartXMouseUp(): void {
    this.isStartXDragging = false;
  }

  // Listener para capturar quando o usuário faz login no startx (interface_terminalv3.html)
  @HostListener('window:message', ['$event'])
  public onWindowMessage(event: MessageEvent): void {
    if (event.data && event.data.type === 'EASTER_EGG_STARTX_LOGIN') {
      this.triggerStartxEasterEgg(event.data.user || 'daniel');
    }
  }

  @HostListener('window:storage', ['$event'])
  public onStorageEvent(event: StorageEvent): void {
    if (event.key === 'opencnpj_startx_easter_egg' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        this.triggerStartxEasterEgg(parsed.user || 'daniel');
      } catch {}
    }
  }

  private checkStoredEasterEgg(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('opencnpj_startx_easter_egg');
      if (stored) {
        // Já foi desbloqueado recentemente
      }
    } catch {}
  }

  public triggerStartxEasterEgg(user: string): void {
    this.playSound('mixkit-hard-typewriter-click-1119.wav');
    this.addLine(' ', 'text-success');
    this.addLine('╔════════════════════════════════════════════════════════════════════════════╗', 'text-success');
    this.addLine('║  ⭐ [EASTER EGG DESCOBERTO!] SUCESSO DE AUTENTICAÇÃO NO X11 DEBIAN!        ║', 'text-success');
    this.addLine(`║  Usuário autenticado com sucesso: '${user}' (Privilégios de Administrador)  ║`, 'text-info');
    this.addLine('║  Conquista Desbloqueada: "Hacker do Debian / OpenCaramelo Sysadmin"       ║', 'text-comment');
    this.addLine('║  Você descobriu as credenciais secretas da interface gráfica retrô!        ║', 'text-info');
    this.addLine('╚════════════════════════════════════════════════════════════════════════════╝', 'text-success');
    this.addLine(' ', 'text-success');
    this.createNextPrompt();
  }

  // --- MÉTODOS DO AMBIENTE GRÁFICO X11 INTEGRADO (STARTX) ---
  public openStartX(): void {
    this.isStartXRunning = true;
    this.startXState = 'LOGIN';
    this.startXUsername = '';
    this.startXPassword = '';
    this.startXCurrentInput = '';
    this.startXHistory = [
      { label: '', value: 'Debian GNU/Linux 12 (bookworm) tty7' },
      { label: '', value: 'Linux debian 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC' },
      { label: '', value: 'X.Org X Server 1.21.1.7 running on :0.0' },
      { label: '', value: 'OpenCNPJ Graphical Display Manager' },
      { label: '', value: '---------------------------------------------------------' },
      { label: '', value: 'Por favor, autentique-se para ter acesso ao sistema gráfico Debian:' }
    ];
    this.startXIsMaximized = false;
    this.startXIsMinimized = false;
    this.updateStartXClock();
    if (this.startXClockTimer) clearInterval(this.startXClockTimer);
    this.startXClockTimer = setInterval(() => this.updateStartXClock(), 1000);

    if (typeof window !== 'undefined') {
      const w = Math.min(780, window.innerWidth - 30);
      const h = Math.min(480, window.innerHeight - 100);
      this.startXPos = {
        x: Math.max(15, Math.floor((window.innerWidth - w) / 2)),
        y: Math.max(50, Math.floor((window.innerHeight - h) / 2))
      };
    }

    setTimeout(() => {
      this.focusStartXInput();
    }, 150);
  }

  private updateStartXClock(): void {
    const now = new Date();
    this.startXClock = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  public toggleStartXMinimize(): void {
    this.startXIsMinimized = !this.startXIsMinimized;
  }

  public toggleStartXMaximize(): void {
    this.startXIsMaximized = !this.startXIsMaximized;
  }

  public closeStartX(isSuccess = false): void {
    this.isStartXRunning = false;
    if (this.startXClockTimer) {
      clearInterval(this.startXClockTimer);
      this.startXClockTimer = null;
    }

    if (isSuccess) {
      this.triggerStartxEasterEgg(this.startXUsername || 'daniel');
    } else {
      this.addLine(' ', 'text-comment');
      this.addLine('[startx] Sessão gráfica X11 encerrada pelo usuário. Retornando ao console.', 'text-info');
      this.createNextPrompt();
    }

    setTimeout(() => {
      this.focusInput();
    }, 150);
  }

  public onStartXMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.x11-window-controls') || (event.target as HTMLElement).closest('.x11-ctrl-btn')) return;
    if (this.startXIsMaximized) return;
    this.isStartXDragging = true;
    this.startXDragStart = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      startX: this.startXPos.x,
      startY: this.startXPos.y
    };
    event.preventDefault();
  }

  public handleStartXKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitStartXInput();
    } else {
      this.playKeySound();
    }
  }

  public submitStartXInput(): void {
    const val = this.startXCurrentInput.trim();

    if (this.startXState === 'LOGIN') {
      if (!val) return;
      this.playEnterSound();
      this.startXUsername = val;
      this.startXHistory.push({ label: 'login:', value: this.startXUsername });
      this.startXCurrentInput = '';
      this.startXState = 'PASSWORD';
      this.scrollStartXToBottom();
      setTimeout(() => this.focusStartXInput(), 50);
    } else if (this.startXState === 'PASSWORD') {
      this.playEnterSound();
      this.startXPassword = val;
      this.startXHistory.push({ label: 'Password:', value: '•'.repeat(Math.max(1, this.startXPassword.length)) });
      this.startXCurrentInput = '';

      if (this.startXUsername === 'daniel' && this.startXPassword === '1234') {
        this.startXState = 'SUCCESS';
        this.startXHistory.push({
          label: '',
          value: '\n[✓] Autenticação confirmada! Bem-vindo, daniel.\n[🏆] EASTER EGG DESBLOQUEADO: Mestre da Interface X11!\nRetornando automaticamente ao console em instantes...',
          isSuccess: true
        });
        this.scrollStartXToBottom();
        this.playSound('mixkit-hard-typewriter-click-1119.wav');

        // Retorna automaticamente para o terminal principal após 1.8 segundos!
        setTimeout(() => {
          this.closeStartX(true);
        }, 1800);
      } else {
        this.startXHistory.push({
          label: '',
          value: 'Login incorrect\n',
          isError: true
        });
        this.startXState = 'LOGIN';
        this.startXUsername = '';
        this.startXPassword = '';
        this.scrollStartXToBottom();
        setTimeout(() => this.focusStartXInput(), 50);
      }
    }
  }

  public focusStartXInput(): void {
    const input = document.getElementById('startx-active-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  private scrollStartXToBottom(): void {
    setTimeout(() => {
      if (this.startXTerminalBody?.nativeElement) {
        this.startXTerminalBody.nativeElement.scrollTop = this.startXTerminalBody.nativeElement.scrollHeight;
      }
    }, 10);
  }

  public unlockAudio(): void {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
  }

  public toggleSound(): void {
    this.isMuted = !this.isMuted;
    this.unlockAudio();
    this.addLine(this.isMuted ? 'Sons desabilitados.' : 'Sons habilitados.', 'text-comment');
    this.createNextPrompt();
  }

  private async startBootSequence(): Promise<void> {
    for (const item of this.bootSequence) {
      await this.delay(item.delay || 30);
      this.addLine(item.text, item.class);
    }
    this.isBooted = true;
    this.focusInput();
    this.scrollToBottom();

    // Executa busca caso a URL tenha o parâmetro
    this.route.paramMap.subscribe(paramMap => {
      let q = paramMap.get('cnpj');
      if (!q) {
        q = this.route.snapshot.queryParamMap.get('cnpj');
      }

      if (q) {
        const clean = this.cnpjService.cleanCnpj(q);
        if (clean) {
          this.currentCnpj.set(clean);
          setTimeout(() => {
            this.addLine(`guest@opencnpj:~$ cnpj ${clean}`, 'text-command');
            this.processCnpjQuery(clean);
          }, 300);
        }
      }
    });
  }

  public focusInput(): void {
    this.unlockAudio();
    setTimeout(() => {
      if (this.inputAreaEl && this.inputAreaEl.nativeElement) {
        this.inputAreaEl.nativeElement.focus();
      }
    }, 0);
  }

  public handleKeyDown(event: KeyboardEvent): void {
    this.unlockAudio();
    if (!this.inputAreaEl) return;
    const input = this.inputAreaEl.nativeElement.innerText.trim();

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.playEnterSound();
        this.addLine(`${this.currentLabel} ${input}`);

        if (this.authState === 'AWAITING_PASS') {
          this.handlePasswordInput(input);
          this.clearInput();
          return;
        }

        if (input) {
          if (input !== this.commandHistory[this.commandHistory.length - 1]) {
            this.commandHistory.push(input);
          }
          this.historyIndex = this.commandHistory.length;
          this.processInput(input);
        } else {
          this.createNextPrompt();
        }
        this.clearInput();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.navigateHistory('up');
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.navigateHistory('down');
        break;

      default:
        if (!this.isMuted && (event.key.length === 1 || event.key === 'Backspace')) {
          this.playKeySound();
        }
        break;
    }
  }

  // --- FORMATAÇÃO EM TEMPO REAL EXATA DO PROJETO ORIGINAL ---
  public handleInput(event: Event): void {
    if (this.isFormatting) return;

    const inputArea = event.target as HTMLSpanElement;
    const rawText = inputArea.innerText;

    if (!rawText || rawText.length === 0) {
      return;
    }

    const firstChar = rawText[0];

    // Só aplica a formatação de CNPJ se for explicitamente o comando 'cnpj ' ou se parecer um CNPJ (somente alfanuméricos e pontuações do CNPJ, e não bater com início de comandos conhecidos como 'cat', 'cd', 'clear', etc.)
    const isCommand = /^(help|sound|clear|cls|ls|cat|cd|matrix|startx|login|start|cowsay|sl|fortune|neofetch|caramelo|dog|coffee|cafe|top|htop|sudo|secret|windows|padrao|whoami|date|history|capsys|opencaramelo|readme|github)/i.test(rawText);
    const isCnpjCmd = rawText.toLowerCase().startsWith('cnpj ');
    
    if (isCnpjCmd || (!isCommand && /^[A-Z0-9.\/-]+$/i.test(rawText))) {
      this.isFormatting = true;
      let formatted = rawText;

      if (isCnpjCmd) {
        // Se tem o comando 'cnpj ', formata apenas o que vem depois
        const prefix = rawText.substring(0, 5);
        const rest = rawText.substring(5);
        formatted = prefix + this.formatCnpj(rest.toUpperCase().replace(/[^A-Z0-9]/g, ''));
      } else {
        formatted = this.formatCnpj(rawText.toUpperCase().replace(/[^A-Z0-9]/g, ''));
      }

      inputArea.innerText = formatted;
      this.isFormatting = false;

      this.focusAndMoveCursorToEnd(inputArea);
    }
  }

  // Formatação progressiva exata conforme cada dígito é digitado
  public formatCnpj(value: string): string {
    value = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 14);
    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/^([A-Z0-9]{2})([A-Z0-9]+)/, '$1.$2');
    if (value.length <= 8) return value.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]+)/, '$1.$2.$3');
    if (value.length <= 12) return value.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{0,4})/, '$1.$2.$3/$4');
    return value.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})([A-Z0-9]{0,2})/, '$1.$2.$3/$4-$5');
  }

  private focusAndMoveCursorToEnd(el: HTMLSpanElement): void {
    if (!el) return;
    el.focus();
    if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  private handlePasswordInput(password: string): void {
    if (this.pendingUser === 'daniel' && password === '1234') {
      this.triggerStartxEasterEgg('daniel');
    } else {
      this.addLine('Login incorrect', 'text-error');
      this.createNextPrompt();
    }
    this.authState = 'NORMAL';
    this.pendingUser = '';
    this.currentLabel = 'guest@opencnpj:~$';
  }

  public processInput(input: string): void {
    const trimmed = input.trim();
    const command = trimmed.toLowerCase();

    // 1. Comando direto de CNPJ
    if (command.startsWith('cnpj ') || /^[0-9.\/-]+$/.test(trimmed)) {
      const cleanDigits = this.cnpjService.cleanCnpj(trimmed);
      if (cleanDigits.length > 0) {
        this.processCnpjQuery(cleanDigits);
        return;
      }
    }

    // 2. Processador de comandos e Easter Eggs
    if (this.executeEasterEgg(trimmed)) {
      if (command !== 'clear' && command !== 'matrix' && this.authState === 'NORMAL') {
        this.createNextPrompt();
      }
      return;
    }

    // 3. Comando não reconhecido
    this.addLine(`bash: comando não encontrado: '${command}'. Digite 'help' para comandos.`, 'text-error');
    this.createNextPrompt();
  }

  public executeEasterEgg(rawCommand: string): boolean {
    const parts = rawCommand.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch (cmd) {
      case 'help':
        this.addLine('==================================================================', 'text-info');
        this.addLine('Comandos disponíveis no Terminal OpenCNPJ:', 'text-info');
        this.addLine('==================================================================', 'text-info');
        this.addLine('  cnpj <numero>   : Consulta CNPJ na base pública oficial da Receita', 'text-comment');
        this.addLine('  sound           : Habilita/Desabilita efeitos sonoros da máquina de escrever', 'text-comment');
        this.addLine('  clear | cls     : Limpa toda a tela do terminal', 'text-comment');
        this.addLine('  ls              : Lista arquivos e diretórios virtuais', 'text-comment');
        this.addLine('  cat <arquivo>   : Lê conteúdo de arquivos (ex: cat README.md)', 'text-comment');
        this.addLine('  cd <pasta>      : Navega entre diretórios (ex: cd jogos)', 'text-comment');
        this.addLine('  matrix          : Chuva de caracteres digitais Matrix (Pressione qualquer tecla para sair)', 'text-comment');
        this.addLine('  startx          : Inicia a interface gráfica web X11 (Descubra o login!)', 'text-comment');
        this.addLine('  login           : Efetua autenticação direta no terminal (ex: login daniel)', 'text-comment');
        this.addLine('  start <jogo>    : Inicia jogos retrô emulados (ex: start doom, start digger)', 'text-comment');
        this.addLine('  cowsay <msg>    : A vaquinha clássica do Linux fala sua mensagem', 'text-comment');
        this.addLine('  sl              : O trem a vapor clássico do Linux (typo de ls)', 'text-comment');
        this.addLine('  fortune         : Exibe uma frase ou citação clássica do mundo hacker', 'text-comment');
        this.addLine('  neofetch        : Exibe o logotipo Debian em arte ASCII e especificações', 'text-comment');
        this.addLine('  caramelo | dog  : Exibe o mascote oficial vira-lata caramelo', 'text-comment');
        this.addLine('  coffee | cafe   : Pausa para um café quente de desenvolvedor', 'text-comment');
        this.addLine('  top | htop      : Monitor de processos em tempo real do sistema', 'text-comment');
        this.addLine('  sudo            : Executa comando como superusuário (Tente!)', 'text-comment');
        this.addLine('  secret          : Dica sobre os segredos escondidos no sistema', 'text-comment');
        this.addLine('  windows         : Alterna para o modo Desktop Windows 98 (/consulta/windows)', 'text-comment');
        this.addLine('  padrao          : Alterna para a interface corporativa moderna (/consulta)', 'text-comment');
        this.addLine('  whoami          : Exibe o usuário atual da sessão', 'text-comment');
        this.addLine('  date            : Exibe a data e hora do sistema', 'text-comment');
        this.addLine('  history         : Exibe o histórico de comandos executados', 'text-comment');
        this.addLine('  capsys          : Desenho ASCII e link da CapSys', 'text-comment');
        this.addLine('  opencaramelo    : Informações sobre a iniciativa mãe OpenCaramelo', 'text-comment');
        this.addLine('  readme          : Abre o README oficial no GitHub', 'text-comment');
        this.addLine('  github          : Abre o repositório do projeto no GitHub', 'text-comment');
        return true;

      case 'sound':
        this.toggleSound();
        return true;

      case 'login':
        const loginUser = arg.toLowerCase();
        if (loginUser === 'daniel') {
          this.authState = 'AWAITING_PASS';
          this.pendingUser = 'daniel';
          this.currentLabel = 'Password:';
          this.addLine('Digite a senha para daniel:');
        } else if (loginUser) {
          this.authState = 'AWAITING_PASS';
          this.pendingUser = loginUser;
          this.currentLabel = 'Password:';
          this.addLine(`Digite a senha para ${loginUser}:`);
        } else {
          this.addLine("Uso: login <usuario> (Dica: tente 'login daniel')", 'text-info');
        }
        return true;

      case 'startx':
        this.addLine('Iniciando servidor gráfico X.Org / X11...', 'text-info');
        this.addLine('Carregando interface gráfica Debian na tela...', 'text-success');
        this.openStartX();
        return true;

      case 'secret':
      case 'segredo':
      case 'dica':
        this.addLine('🔍 [DICA SECRETA]:', 'text-info');
        this.addLine("  No comando 'startx', existe uma tela de login Debian clássica.", 'text-comment');
        this.addLine("  O usuário do criador é 'daniel' e a senha são 4 dígitos simples: 1234.", 'text-comment');
        this.addLine("  Você também pode testar digitando aqui mesmo: 'login daniel'", 'text-comment');
        return true;

      case 'cowsay':
        const msg = arg || 'OpenCNPJ: Dados abertos para todos!';
        this.printCowsay(msg);
        return true;

      case 'sl':
        this.printSteamLocomotive();
        return true;

      case 'fortune':
        const f = this.fortunes[Math.floor(Math.random() * this.fortunes.length)];
        this.addLine(`"${f}"`, 'text-info');
        return true;

      case 'caramelo':
      case 'dog':
      case 'latir':
      case 'au':
        const carameloArt = [
          '        / \\__',
          '       (    @\\___',
          '       /         O',
          '      /   (_____/',
          '     /_____/   U',
          '    Au au! O Vira-lata Caramelo protege os dados públicos brasileiros! 🐾'
        ];
        carameloArt.forEach(l => this.addLine(l, 'text-success'));
        return true;

      case 'coffee':
      case 'cafe':
        const coffeeArt = [
          '        )  (  )',
          '       (   )  (',
          '        ) (  ) )',
          '      .------------.',
          '     /              \\__',
          '    |   OPENCNPJ     |  )',
          '     \\              /__/',
          '      `------------\'',
          '   Aqui está seu café quentinho para codar!'
        ];
        coffeeArt.forEach(l => this.addLine(l, 'text-info'));
        return true;

      case 'neofetch':
        const neo = [
          '       _,met$$$$$gg.          guest@opencnpj-host',
          '    ,g$$$$$$$$$$$$$$$P.       -------------------',
          '  ,g$$P""       """Y$$.       OS: Debian GNU/Linux 12 (Bookworm) x86_64',
          ' ,$$P\'              `$$$.     Host: Retro CRT Monitor v4.2',
          '\',$$P       ,ggs.     `$$b:   Kernel: 5.15.0-opencaramelo-realtime',
          '`d$$\'     ,$P"\'   .    $$$    Uptime: 23 hours, 42 mins',
          ' $$P      d$\'     ,    $$P    Packages: 1998 (dpkg)',
          ' $$:      $$.   -    ,d$$\'    Shell: bash 5.2.15',
          ' $$;      Y$b._   _,d$P\'      Theme: Phosphor Green CRT [GTK2/3]',
          ' Y$$.    `.`"Y$$$$P"\'         CPU: MOS Technology 6502 / Z80 @ 4.77MHz',
          ' `$$b      "-.__              Memory: 64MiB / 2048MiB',
          '  `Y$$                        GPU: CGA 320x200 4-color composite'
        ];
        neo.forEach(l => this.addLine(l, 'text-info'));
        return true;

      case 'top':
      case 'htop':
        const topOutput = [
          'top - 14:32:00 up 42 days, 3 users,  load average: 0.12, 0.08, 0.05',
          'Tasks: 98 total,   1 running,  97 sleeping,   0 stopped,   0 zombie',
          '%Cpu(s):  2.4 us,  1.1 sy,  0.0 ni, 96.2 id,  0.2 wa,  0.0 hi,  0.1 si',
          'MiB Mem :   2048.0 total,   1420.5 free,    410.2 used,    217.3 buff/cache',
          ' ',
          '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
          '    1 root      20   0  168420  11240   8200 S   0.0   0.5   0:02.15 init',
          '  198 capsys    20   0  210450  45200  28100 S   1.8   2.2   1:42.80 kitana-api',
          '  304 guest     20   0   48200   6120   4200 S   0.5   0.3   0:08.10 bash',
          '  412 caramelo  20   0   89100  18200  12400 S   0.2   0.9   0:14.33 daemon-cnpj'
        ];
        topOutput.forEach(l => this.addLine(l, 'text-comment'));
        return true;

      case 'sudo':
        if (arg.includes('make me a sandwich') || arg.includes('sandwich')) {
          this.addLine('Okay. (Reference: XKCD #149)', 'text-success');
        } else {
          this.addLine('guest is not in the sudoers file. This incident will be reported to OpenCaramelo.', 'text-error');
        }
        return true;

      case 'rm':
        if (arg.includes('-rf') || arg.includes('/')) {
          this.addLine('rm: cannot remove root directory: /dev/caramelo is indestructible and protected by law.', 'text-error');
        } else {
          this.addLine(`rm: cannot remove '${arg || 'file'}': Read-only file system.`, 'text-error');
        }
        return true;

      case 'ls':
        this.addLine("drwxr-xr-x  3 capsys staff  128B Set 16 09:15 <span class='text-info'>jogos/</span>");
        this.addLine("drwxr-xr-x  2 capsys staff   64B Set 16 09:15 <span class='text-info'>interface/</span>");
        this.addLine("-rw-r--r--  1 capsys staff  1.4K Set 16 09:15 README.md");
        this.addLine("-rwxr-xr-x  1 capsys staff  350K Set 16 09:15 <span class='text-success'>cnpj*</span>");
        return true;

      case 'cd':
        if (!arg || arg === '~' || arg === '/') {
          this.currentLabel = 'guest@opencnpj:~$';
        } else if (arg.includes('jogos')) {
          this.currentLabel = 'guest@opencnpj:~/jogos$';
          this.addLine("Entrou em jogos/. Arquivos disponíveis: doom.jsdos, digger.jsdos. Digite 'start doom' para jogar.", 'text-info');
        } else if (arg === '..') {
          this.currentLabel = 'guest@opencnpj:~$';
        } else {
          this.addLine(`bash: cd: ${arg}: Diretório não encontrado.`, 'text-error');
        }
        return true;

      case 'cat':
        if (arg.toLowerCase().includes('readme')) {
          this.addLine('=== OpenCNPJ & OpenCaramelo ===', 'text-info');
          this.addLine('Portal oficial gratuito de consulta de dados de CNPJ.', 'text-comment');
          this.addLine('Site oficial: https://opencaramelo.com', 'text-comment');
          this.addLine('Repositório: https://github.com/opencaramelo/opencnpj', 'text-comment');
        } else {
          this.addLine(`cat: ${arg || 'arquivo'}: Arquivo não encontrado. Tente 'cat README.md'`, 'text-error');
        }
        return true;

      case 'clear':
      case 'cls':
        this.lines = [];
        this.copyableText = null;
        this.isCopied = false;
        this.createNextPrompt();
        return true;

      case 'date':
        this.addLine(new Date().toString(), 'text-comment');
        return true;

      case 'whoami':
        this.addLine('guest (Sessão pública anônima no terminal)', 'text-info');
        return true;

      case 'capsys':
        const logo = [
          '    _____           _____                 ',
          '   / ____|         / ____|                ',
          '  | |   | __ _ _ __ | (___   ',
          '  | |  / _` | \'_ \\ \\___ \\',
          '  | |___| (_| | |_) |____) | ',
          '   \\_____\\__,_| .__/|_____/ ',
          '               | |                      ',
          '               |_|                      '
        ];
        logo.forEach(line => this.addLine(line, 'text-success'));
        this.addLine('Visite nosso site: https://capsys.com.br', 'text-info');
        setTimeout(() => window.open('https://capsys.com.br', '_blank'), 400);
        return true;

      case 'opencaramelo':
        this.addLine('OpenCaramelo — Ecossistema Aberto de Dados Públicos Brasileiros', 'text-info');
        this.addLine('Portal oficial: https://opencaramelo.com', 'text-comment');
        return true;

      case 'readme':
        this.addLine('Abrindo README em nova aba...', 'text-info');
        setTimeout(() => window.open('https://github.com/danieldouglas26/retro-terminal-static/blob/main/README.md', '_blank'), 300);
        return true;

      case 'github':
        this.addLine('Abrindo repositório GitHub em nova aba...', 'text-info');
        setTimeout(() => window.open('https://github.com/danieldouglas26/retro-terminal-static/', '_blank'), 300);
        return true;

      case 'matrix':
        this.startMatrix();
        return true;

      case 'start':
        if (arg.includes('doom')) {
          this.addLine('Iniciando DOOM em emulador DOS...', 'text-info');
          this.startGame('assets/games/doom.jsdos');
        } else if (arg.includes('digger')) {
          this.addLine('Iniciando Digger em emulador DOS...', 'text-info');
          this.startGame('assets/games/digger.jsdos');
        } else {
          this.addLine(`Jogo '${arg || 'desconhecido'}' não encontrado. Jogos disponíveis: doom, digger.`, 'text-error');
        }
        return true;

      case 'windows':
      case 'win':
        this.addLine('Redirecionando para a experiência Desktop Windows 98...', 'text-info');
        const winUrl = this.currentCnpj() ? `/windows/${this.currentCnpj()}` : '/windows';
        setTimeout(() => { window.location.href = winUrl; }, 400);
        return true;

      case 'padrao':
        this.addLine('Redirecionando para a interface corporativa moderna...', 'text-info');
        const padraoUrl = this.currentCnpj() ? `/${this.currentCnpj()}` : '/';
        setTimeout(() => { window.location.href = padraoUrl; }, 400);
        return true;

      default:
        return false;
    }
  }

  private printCowsay(text: string): void {
    const border = '-'.repeat(text.length + 2);
    this.addLine(` ${border} `, 'text-info');
    this.addLine(`< ${text} >`, 'text-success');
    this.addLine(` ${border} `, 'text-info');
    this.addLine('        \\   ^__^', 'text-info');
    this.addLine('         \\  (oo)\\_______', 'text-info');
    this.addLine('            (__)\\       )\\/\\', 'text-info');
    this.addLine('                ||----w |', 'text-info');
    this.addLine('                ||     ||', 'text-info');
  }

  private printSteamLocomotive(): void {
    const train = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------| [___] |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |_____I_____I_____I_____I_____I___\\_____/|'
    ];
    train.forEach(l => this.addLine(l, 'text-success'));
  }

  private async processCnpjQuery(cleanInput: string): Promise<void> {
    this.copyableText = null;
    this.isCopied = false;
    this.currentCnpj.set(cleanInput);

    if (cleanInput.length !== 14) {
      this.displayError('CNPJ deve conter exatamente 14 dígitos numéricos.');
      this.createNextPrompt();
      return;
    }

    if (!this.validateCnpj(cleanInput)) {
      this.displayError('CNPJ inválido (dígitos verificadores não conferem com a regra oficial).');
      this.createNextPrompt();
      return;
    }

    this.addLine(`Consultando base da Receita Federal para o CNPJ ${this.cnpjService.formatCnpj(cleanInput)}...`, 'text-comment');
    this.isBooted = false;

    const currentUrlCnpj = this.route.snapshot.paramMap.get('cnpj');
    if (typeof window !== 'undefined' && currentUrlCnpj !== cleanInput) {
      window.location.href = `/terminal/${cleanInput}`;
      return;
    }

    try {
      const res = await this.cnpjService.consultCnpj(cleanInput);
      if (res.status === 200 && res.data?.data) {
        const data = res.data.data;
        const cnpjFormatado = this.cnpjService.formatCnpj(cleanInput);
        this.titleService.setTitle(`${cnpjFormatado} - ${data.razaoSocial || data.nomeFantasia || 'Consulta'} | OpenCNPJ`);
        this.displayCnpjData(data);
      } else {
        this.titleService.setTitle('CNPJ não encontrado | OpenCNPJ');
        this.displayError(res.data?.message || res.data?.error || 'CNPJ não encontrado na base de dados.');
      }
    } catch {
      this.titleService.setTitle('Erro na consulta | OpenCNPJ');
      this.displayError('API pública temporariamente indisponível. Tente novamente.');
    } finally {
      this.createNextPrompt();
    }
  }

  private displayCnpjData(cnpjData: any): void {
    const d = cnpjData;
    const keyWidth = 25;
    const contentWidth = 72;
    const valueWidth = contentWidth - keyWidth - 7;
    const border = `+${'-'.repeat(contentWidth)}+`;
    let textToCopy = '*** Dados da Empresa ***\n\n';

    const formattedData: Record<string, string> = {
      'CNPJ': this.cnpjService.formatCnpj(d.cnpj),
      'Razão Social': d.razaoSocial || 'N/A',
      'Nome Fantasia': d.nomeFantasia || 'N/A',
      'Situação Cadastral': d.situacaoCadastral || 'N/A',
      'Data Situação': d.dataSituacaoCadastral || 'N/A',
      'Início Atividades': d.dataInicioAtividades || 'N/A',
      'Natureza Jurídica': d.naturezaJuridica || 'N/A',
      'Capital Social': this.cnpjService.formatCurrency(d.capitalSocial),
      'Opção Simples': d.opcaoSimples === 'Sim' || d.opcaoSimples === true ? 'SIM' : 'NÃO',
      'Opção MEI': d.opcaoMei === 'Sim' || d.opcaoMei === true ? 'SIM' : 'NÃO',
      'Email': d.email || 'N/A',
      'Telefone': d.telefone || 'N/A',
      'Logradouro': d.logradouro || 'N/A',
      'Número': d.numero || 'SN',
      'Complemento': d.complemento || 'N/A',
      'Bairro': d.bairro || 'N/A',
      'Município / UF': `${d.municipio || ''} - ${d.uf || ''}`,
      'CEP': d.cep || 'N/A'
    };

    this.addLine(' ', 'text-success');
    this.addLine('--- DADOS CADASTRAIS ---', 'text-info');
    this.addLine(border, 'text-success');

    for (const key in formattedData) {
      const value = formattedData[key] || 'N/A';
      const displayValue = value.toString().substring(0, valueWidth);
      const line = `| ${key.padEnd(keyWidth)}: ${displayValue.padEnd(valueWidth)}|`;
      this.addLine(line, 'text-success');
      textToCopy += `${key}: ${value}\n`;
    }
    this.addLine(border, 'text-success');

    // CNAEs
    if (d.cnaes && d.cnaes.length > 0) {
      textToCopy += '\n*** Atividades Econômicas (CNAEs) ***\n';
      this.addLine(' ', 'text-info');
      this.addLine('--- ATIVIDADES ECONÔMICAS (CNAEs) ---', 'text-info');
      const cnaePrincipal = d.cnaes[0];
      this.addLine('PRINCIPAL:', 'text-comment');
      textToCopy += 'PRINCIPAL:\n';
      const cnaeLine = `${cnaePrincipal.cnae} - ${cnaePrincipal.descricao}`;
      this.addLine(cnaeLine, 'text-success');
      textToCopy += cnaeLine + '\n';

      const cnaesSecundarios = d.cnaes.slice(1);
      if (cnaesSecundarios.length > 0) {
        this.addLine('SECUNDÁRIAS:', 'text-comment');
        textToCopy += 'SECUNDÁRIAS:\n';
        cnaesSecundarios.slice(0, 10).forEach((cnae: any) => {
          const sLine = `- ${cnae.cnae} - ${cnae.descricao}`;
          this.addLine(sLine, 'text-success');
          textToCopy += sLine + '\n';
        });
        if (cnaesSecundarios.length > 10) {
          this.addLine(`... e mais ${cnaesSecundarios.length - 10} CNAEs secundários.`, 'text-comment');
        }
      }
    }

    // Sócios (QSA)
    if (d.socios && d.socios.length > 0) {
      const maxSociosDisplay = 10;
      textToCopy += `\n*** Quadro de Sócios e Administradores (${d.socios.length} no total) ***\n`;
      this.addLine(' ', 'text-info');
      this.addLine(`--- QUADRO DE SÓCIOS E ADMINISTRADORES (${d.socios.length} sócios) ---`, 'text-info');

      d.socios.slice(0, maxSociosDisplay).forEach((socio: any) => {
        const socioLine = `> ${socio.nomeSocio} (${socio.faixaEtaria || 'N/A'}) - ${socio.descricao} (Desde: ${socio.dataEntradaSociedade})`;
        this.addLine(socioLine, 'text-success');
      });

      if (d.socios.length > maxSociosDisplay) {
        const remaining = d.socios.length - maxSociosDisplay;
        this.addLine(`... e mais ${remaining} sócios/administradores (Apenas na cópia).`, 'text-comment');
      }

      d.socios.forEach((socio: any) => {
        const socioCopyLine = `> ${socio.nomeSocio} (CPF/CNPJ: ${socio.cnpjCpfSocio}) - ${socio.descricao} (Desde: ${socio.dataEntradaSociedade} / Faixa Etária: ${socio.faixaEtaria || 'N/A'})`;
        textToCopy += socioCopyLine + '\n';
      });
    }

    this.addLine(' ', 'text-success');
    this.copyableText = textToCopy.trim();
  }

  private displayError(message: string): void {
    const contentWidth = 72;
    const border = `+${'-'.repeat(contentWidth)}+`;
    this.addLine(' ', 'text-error');
    this.addLine(border, 'text-error');
    this.addLine(`| ERRO: ${message.padEnd(contentWidth - 8)}|`, 'text-error');
    this.addLine(border, 'text-error');
    this.addLine(' ', 'text-error');
  }

  private validateCnpj(cnpj: string): boolean {
    cnpj = cnpj.toUpperCase().replace(/[^A-Z0-9]+/g, '');
    if (cnpj === '' || cnpj.length !== 14 || /^([A-Z0-9])\1+$/.test(cnpj)) return false;
    let tamanho = 12;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(12);
    let soma = 0;
    let pos = 5;
    for (let i = tamanho; i >= 1; i--) {
      soma += (numeros.charCodeAt(tamanho - i) - 48) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

    tamanho = 13;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = 6;
    for (let i = tamanho; i >= 1; i--) {
      soma += (numeros.charCodeAt(tamanho - i) - 48) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1), 10)) return false;
    return true;
  }

  // Efeito Matrix Rain
  public startMatrix(): void {
    if (this.isMatrixRunning) return;
    this.isMatrixRunning = true;

    const canvas = this.matrixCanvasEl?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.display = 'block';

    const setCanvasSize = () => {
      canvas.width = this.terminalEl.nativeElement.clientWidth;
      canvas.height = this.terminalEl.nativeElement.clientHeight;
    };
    setCanvasSize();

    this.originalLines = [...this.lines];
    this.isBooted = false;
    this.lines = [];

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const alphabet = katakana + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = Array.from({ length: columns }).map(() => 1);

    this.matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(8, 20, 8, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#45ff45';
      ctx.font = `${fontSize}px monospace`;

      rainDrops.forEach((y, ind) => {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = ind * fontSize;
        ctx.fillText(text, x, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[ind] = 0;
        }
        rainDrops[ind]++;
      });
    }, 33);

    const stopHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      clearInterval(this.matrixInterval);
      this.isMatrixRunning = false;
      canvas.style.display = 'none';
      document.removeEventListener('keydown', stopHandler);

      this.lines = this.originalLines;
      this.createNextPrompt();
    };

    document.addEventListener('keydown', stopHandler, { once: true });
    this.addLine('Efeito Matrix ativado. Pressione qualquer tecla para sair...', 'text-info');
  }

  // Emulador de Jogos DOS
  public startGame(bundleUrl: string): void {
    if (this.isGameRunning) return;

    if (typeof Dos === 'undefined') {
      this.addLine('Aviso: Emulador js-dos runtime não detectado no browser.', 'text-error');
      this.addLine(`O pacote de jogo está localizado em: ${bundleUrl}`, 'text-comment');
      return;
    }

    this.isGameRunning = true;
    setTimeout(() => {
      if (!this.dosGameContainer) {
        this.isGameRunning = false;
        return;
      }
      this.dosInstance = Dos(this.dosGameContainer.nativeElement, {
        url: bundleUrl,
        fullscreen: true,
        onexit: () => {
          this.stopGame();
        }
      });
    }, 100);
  }

  public stopGame(): void {
    if (this.dosInstance) {
      this.dosInstance.stop();
      this.dosInstance = null;
    }
    this.isGameRunning = false;
    this.focusInput();
  }

  public copyToClipboard(): void {
    if (!this.copyableText || !navigator.clipboard) return;
    navigator.clipboard.writeText(this.copyableText).then(() => {
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2500);
    });
  }

  private addLine(text: string, className = ''): void {
    const safeText = (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/ /g, '&nbsp;');
    this.lines.push({ text: safeText, class: className });
    this.scrollToBottom();
  }

  private createNextPrompt(): void {
    this.isBooted = true;
    this.focusInput();
    this.scrollToBottom();
  }

  private clearInput(): void {
    if (this.inputAreaEl && this.inputAreaEl.nativeElement) {
      this.inputAreaEl.nativeElement.innerText = '';
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.terminalEl && this.terminalEl.nativeElement) {
        this.terminalEl.nativeElement.scrollTop = this.terminalEl.nativeElement.scrollHeight;
      }
    }, 0);
  }

  private navigateHistory(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      if (this.historyIndex > 0) this.historyIndex--;
    } else {
      if (this.historyIndex < this.commandHistory.length) this.historyIndex++;
    }

    const command = this.commandHistory[this.historyIndex] || '';
    if (this.inputAreaEl) {
      this.inputAreaEl.nativeElement.innerText = command;
      this.focusAndMoveCursorToEnd(this.inputAreaEl.nativeElement);
    }
  }

  private playKeySound(): void {
    this.playSound('mixkit-typewriter-soft-hit-1366.wav', 0.4);
  }

  private playEnterSound(): void {
    this.playSound('mixkit-hard-typewriter-click-1119.wav', 0.6);
  }

  private playSound(filename: string, volume = 0.5): void {
    if (this.isMuted) return;
    try {
      const audio = new Audio(`assets/sounds/${filename}`);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {}
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
