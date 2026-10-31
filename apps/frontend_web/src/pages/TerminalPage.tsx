import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppAIState, ContractAnalysisResponse } from '../types/contract';
import { analyzeContractText } from '../services/api';

interface TerminalPageProps {
  aiState: AppAIState;
}

interface TerminalLine {
  text: string;
  type?: 'prompt' | 'output' | 'error' | 'success' | 'warning' | 'info';
}

export const TerminalPage: React.FC<TerminalPageProps> = ({ aiState }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: '=================================================================', type: 'info' },
    { text: '  🐼 CONDINOME PANDA v1.0.0 - KERNEL AUDIT TERMINAL [LINUX RETRO]', type: 'success' },
    { text: '  Autores: Daniel Douglas Melo Gomes Neto & Lucas Pereira Brito', type: 'info' },
    { text: '=================================================================', type: 'info' },
    { text: 'Digite "help" para ver os comandos ou "preset aluguel" para auditar.', type: 'info' },
    { text: '', type: 'output' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Efeito Matrix Rain no fundo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01PANDA⚖️§¶CLTCDC10';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(10, 16, 28, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00CCB3';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setLines((prev) => [...prev, { text: `panda@audit:~$ ${trimmed}`, type: 'prompt' }]);
    setInputVal('');

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (command === 'clear' || command === 'cls') {
      setLines([]);
      return;
    }

    if (command === 'help') {
      setLines((prev) => [
        ...prev,
        { text: 'COMANDOS DISPONÍVEIS:', type: 'success' },
        { text: '  preset aluguel   -> Audita contrato residencial com multa abusiva', type: 'info' },
        { text: '  preset pj        -> Audita contrato PJ com regras ilegais de CLT', type: 'info' },
        { text: '  audit <texto>    -> Audita qualquer texto colado diretamente', type: 'info' },
        { text: '  models           -> Lista modelos de IA configurados', type: 'info' },
        { text: '  whoami           -> Informações da equipe e arquitetura', type: 'info' },
        { text: '  clear            -> Limpa a tela do terminal', type: 'info' },
        { text: '', type: 'output' },
      ]);
      return;
    }

    if (command === 'whoami') {
      setLines((prev) => [
        ...prev,
        { text: 'CONDINOME PANDA - IA JURÍDICA E AUDITORIA CONTRATUAL', type: 'success' },
        { text: 'Equipe: Daniel Douglas Melo Gomes Neto & Lucas Pereira Brito', type: 'info' },
        { text: 'Arquitetura: BYO-AI (Gemini / Ollama Local / OpenAI) + FastAPI + React', type: 'info' },
        { text: '', type: 'output' },
      ]);
      return;
    }

    if (command === 'models') {
      const active = aiState.activeProvider;
      setLines((prev) => [
        ...prev,
        { text: `PROVEDOR ATIVO: ${active.toUpperCase()}`, type: 'success' },
        { text: `Modelo Selecionado: ${aiState[active].selectedModel || 'Padrão'}`, type: 'info' },
        { text: '', type: 'output' },
      ]);
      return;
    }

    if (command === 'preset') {
      const presetType = arg.toLowerCase();
      let textToAudit = '';
      if (presetType === 'aluguel') {
        textToAudit = `CONTRATO DE ALUGUEL: Aluguel R$ 1.800,00. Multa de 6 meses de rescisão irrevogável. Reajuste acumulado pelo IGP-M sem deflação. Obras estruturais por conta do inquilino. Renovação compulsória se não avisar com 90 dias.`;
      } else if (presetType === 'pj') {
        textToAudit = `CONTRATO PJ: O prestador cumprirá 44h semanais com ponto biométrico, exclusividade total, sem férias, 13º ou FGTS, sob subordinação direta do Diretor.`;
      } else {
        setLines((prev) => [
          ...prev,
          { text: 'Erro: use "preset aluguel" ou "preset pj"', type: 'error' },
        ]);
        return;
      }

      await runAudit(textToAudit);
      return;
    }

    if (command === 'audit') {
      if (!arg || arg.length < 20) {
        setLines((prev) => [
          ...prev,
          { text: 'Erro: forneça o texto do contrato com no mínimo 20 caracteres.', type: 'error' },
          { text: 'Exemplo: audit CONTRATO DE ALUGUEL: Multa de 6 meses...', type: 'info' },
        ]);
        return;
      }
      await runAudit(arg);
      return;
    }

    setLines((prev) => [
      ...prev,
      { text: `Comando não reconhecido: "${command}". Digite "help" para ajuda.`, type: 'error' },
    ]);
  };

  const runAudit = async (text: string) => {
    setIsBusy(true);
    setLines((prev) => [
      ...prev,
      { text: 'Iniciando pipeline de auditoria com IA...', type: 'info' },
      { text: `[1/4] Higienizando texto e segmentando cláusulas...`, type: 'info' },
      { text: `[2/4] Caçando ambiguidades e multas abusivas...`, type: 'info' },
      { text: `[3/4] Traduzindo termos herméticos para linguagem simples...`, type: 'info' },
      { text: `[4/4] Sintetizando Score de Risco...`, type: 'info' },
    ]);

    try {
      const active = aiState.activeProvider;
      const current = aiState[active];
      const result: ContractAnalysisResponse = await analyzeContractText(text, {
        provider: active,
        model_name: current.selectedModel || undefined,
        api_key: active !== 'ollama' ? current.apiKey?.trim() || undefined : undefined,
        base_url: active === 'ollama' ? current.baseUrl?.trim() || undefined : undefined,
        user_role: aiState.user_role,
      });

      setLines((prev) => [
        ...prev,
        { text: '=============================================================', type: 'success' },
        { text: ` RELATÓRIO: ${result.contract_type.toUpperCase()}`, type: 'success' },
        { text: ` SCORE DE RISCO: [ ${result.risk_score} / 10 ] - GRAVIDADE: ${result.risk_level}`, type: result.risk_score >= 7 ? 'error' : 'warning' },
        { text: '=============================================================', type: 'success' },
        { text: `RESUMO EXECUTIVO:`, type: 'info' },
        { text: result.summary_plain_text, type: 'output' },
        { text: '', type: 'output' },
        { text: `PEGADINHAS & CLÁUSULAS ABUSIVAS ENCONTRADAS (${result.weaknesses_and_traps.length}):`, type: 'error' },
        ...result.weaknesses_and_traps.map((t, i) => ({
          text: `  [${i + 1}] ${t.clause_reference} - ${t.title}\n      Significado: ${t.plain_explanation}\n      Recomendação: ${t.recommendation}`,
          type: 'warning' as const,
        })),
        { text: '', type: 'output' },
        { text: `PERGUNTAS RECOMENDADAS PARA FAZER ANTES DE ASSINAR:`, type: 'success' },
        ...result.actionable_questions.map((q, i) => ({
          text: `  [?] ${i + 1}. ${q}`,
          type: 'info' as const,
        })),
        { text: '=============================================================', type: 'success' },
        { text: 'Auditoria concluída com sucesso.', type: 'success' },
        { text: '', type: 'output' },
      ]);
    } catch (err: any) {
      setLines((prev) => [
        ...prev,
        { text: `FALHA NA AUDITORIA: ${err.message || 'Erro inesperado'}`, type: 'error' },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#070b12] text-[#00ffcc] font-mono p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
      {/* Matrix Canvas no fundo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
      />

      {/* Barra de Troca de Modos Superior */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#00ffcc]/30 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <i className="fas fa-terminal text-[#00ffcc] text-sm animate-pulse"></i>
          <span className="font-extrabold uppercase tracking-wider text-white">
            Panda Linux CRT Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1 rounded bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/30 text-white transition"
          >
            <i className="fas fa-file-contract mr-1"></i> Modo Padrão
          </Link>

          <span className="px-3 py-1 rounded bg-[#00ffcc] text-black font-bold">
            <i className="fab fa-linux mr-1"></i> Terminal Linux (Ativo)
          </span>

          <Link
            to="/windows"
            className="px-3 py-1 rounded bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/30 text-white transition"
          >
            <i className="fab fa-windows mr-1"></i> Windows 98
          </Link>
        </div>
      </div>

      {/* Janela do Terminal CRT */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative z-10 flex-1 bg-black/80 border-2 border-[#00ffcc]/40 rounded-xl p-4 sm:p-6 shadow-[0_0_40px_rgba(0,255,204,0.15)] overflow-y-auto max-h-[70vh] cursor-text"
      >
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
          {lines.map((l, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap ${
                l.type === 'error'
                  ? 'text-rose-400 font-bold'
                  : l.type === 'warning'
                  ? 'text-amber-300'
                  : l.type === 'success'
                  ? 'text-[#00ffcc] font-bold'
                  : l.type === 'prompt'
                  ? 'text-white font-bold'
                  : l.type === 'info'
                  ? 'text-[#80e5d8]'
                  : 'text-slate-300'
              }`}
            >
              {l.text}
            </div>
          ))}

          {isBusy && (
            <div className="text-amber-400 animate-pulse font-bold">
              [AGUARDE] Os agentes cognitivos estão processando o documento...
            </div>
          )}

          {/* Linha de Prompt Ativa */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isBusy) handleCommand(inputVal);
            }}
            className="flex items-center gap-2 pt-2"
          >
            <span className="text-[#00ffcc] font-bold select-none">panda@audit:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isBusy}
              autoFocus
              className="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none caret-[#00ffcc]"
            />
          </form>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Rodapé com Dicas de Comandos Rápidos */}
      <div className="relative z-10 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div>
          <span>Dicas: clique em </span>
          <button
            onClick={() => handleCommand('preset aluguel')}
            className="text-[#00ffcc] hover:underline font-bold"
          >
            preset aluguel
          </button>
          <span> ou </span>
          <button
            onClick={() => handleCommand('preset pj')}
            className="text-[#00ffcc] hover:underline font-bold"
          >
            preset pj
          </button>
        </div>
        <div>
          <span>Sessão segura • 100% Ephemeral Processing (LGPD)</span>
        </div>
      </div>
    </div>
  );
};
