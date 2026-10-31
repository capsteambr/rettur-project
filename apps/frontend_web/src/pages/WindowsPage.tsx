import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppAIState, ContractAnalysisResponse } from '../types/contract';
import { analyzeContractText } from '../services/api';

interface WindowsPageProps {
  aiState: AppAIState;
}

export const WindowsPage: React.FC<WindowsPageProps> = ({ aiState }) => {
  const [activeWindow, setActiveWindow] = useState<'auditor' | 'readme' | 'dos' | null>('auditor');
  const [contractText, setContractText] = useState(
    'CONTRATO DE ALUGUEL RESIDENCIAL: Aluguel R$ 1.800,00. Multa rescisória de 6 meses. Obras estruturais de responsabilidade do locatário. Renovação compulsória se não notificar com 90 dias.'
  );
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleAudit = async () => {
    if (!contractText || contractText.length < 20) {
      alert('Por favor, digite ou cole um contrato com no mínimo 20 caracteres.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const active = aiState.activeProvider;
      const current = aiState[active];
      const result = await analyzeContractText(contractText, {
        provider: active,
        model_name: current.selectedModel || undefined,
        api_key: active !== 'ollama' ? current.apiKey?.trim() || undefined : undefined,
        base_url: active === 'ollama' ? current.baseUrl?.trim() || undefined : undefined,
        user_role: aiState.user_role,
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao auditar no Windows 98.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#008080] font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Barra de Troca de Modos Superior */}
      <div className="bg-[#c0c0c0] border-b-2 border-white border-b-black p-2 flex flex-wrap items-center justify-between text-xs text-black shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <i className="fab fa-windows text-blue-800 text-sm"></i>
          <span>Microsoft Windows 98 - Edição Panda Contratos</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black active:border-inset font-bold text-[11px]"
          >
            Modo Web Padrão
          </Link>
          <Link
            to="/terminal"
            className="px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black active:border-inset font-bold text-[11px]"
          >
            Terminal Linux
          </Link>
          <span className="px-2 py-1 bg-[#000080] text-white font-bold text-[11px]">
            Windows 98 (Ativo)
          </span>
        </div>
      </div>

      {/* Área de Trabalho com Ícones */}
      <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6 items-start relative">
        {/* Coluna de Ícones da Área de Trabalho */}
        <div className="flex flex-col gap-6 z-10">
          <button
            onDoubleClick={() => setActiveWindow('auditor')}
            onClick={() => setActiveWindow('auditor')}
            className="flex flex-col items-center gap-1 w-20 text-center group focus:outline-none"
          >
            <div className="w-10 h-10 bg-white border border-black shadow flex items-center justify-center text-xl">
              🐼
            </div>
            <span className="text-white text-xs font-semibold px-1 group-focus:bg-[#000080]">
              Auditor_Panda.exe
            </span>
          </button>

          <button
            onDoubleClick={() => setActiveWindow('readme')}
            onClick={() => setActiveWindow('readme')}
            className="flex flex-col items-center gap-1 w-20 text-center group focus:outline-none"
          >
            <div className="w-10 h-10 bg-white border border-black shadow flex items-center justify-center text-xl text-blue-700">
              📝
            </div>
            <span className="text-white text-xs font-semibold px-1 group-focus:bg-[#000080]">
              LEIAME.txt
            </span>
          </button>

          <button
            onDoubleClick={() => setActiveWindow('dos')}
            onClick={() => setActiveWindow('dos')}
            className="flex flex-col items-center gap-1 w-20 text-center group focus:outline-none"
          >
            <div className="w-10 h-10 bg-black border border-white shadow flex items-center justify-center text-xl text-white font-mono">
              C:\_
            </div>
            <span className="text-white text-xs font-semibold px-1 group-focus:bg-[#000080]">
              MS-DOS.bat
            </span>
          </button>
        </div>

        {/* Janela 1: Auditor de Contratos Win98 */}
        {activeWindow === 'auditor' && (
          <div className="w-full max-w-2xl bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black p-1 shadow-2xl z-20">
            {/* Barra de Título 3D Clássica */}
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between text-white font-bold text-xs select-none">
              <div className="flex items-center gap-1.5">
                <span>🐼</span>
                <span>Auditor de Contratos v1.0 [Win32]</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveWindow(null)}
                  className="w-4 h-4 bg-[#c0c0c0] text-black border border-black text-[10px] font-bold flex items-center justify-center"
                >
                  X
                </button>
              </div>
            </div>

            {/* Menu de Arquivo */}
            <div className="flex gap-4 text-xs px-2 py-1 border-b border-gray-400 text-black">
              <span className="hover:underline cursor-pointer">Arquivo</span>
              <span className="hover:underline cursor-pointer">Editar</span>
              <span className="hover:underline cursor-pointer">Modelos</span>
              <span className="hover:underline cursor-pointer">Ajuda</span>
            </div>

            {/* Corpo da Janela */}
            <div className="p-4 space-y-3 text-black">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Texto do Contrato para Auditoria:
                </label>
                <textarea
                  rows={4}
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="w-full bg-white border-t-2 border-l-2 border-gray-700 border-r-2 border-b-2 border-white p-2 text-xs font-mono text-black focus:outline-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setContractText(
                        'CONTRATO PJ: 44h semanais com ponto biométrico, exclusividade total, sem férias, 13º ou FGTS.'
                      )
                    }
                    className="px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black font-bold text-xs"
                  >
                    Exemplo PJ
                  </button>
                  <button
                    onClick={() =>
                      setContractText(
                        'CONTRATO DE ALUGUEL: Aluguel R$ 1.800,00. Multa de 6 meses de rescisão irrevogável.'
                      )
                    }
                    className="px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black font-bold text-xs"
                  >
                    Exemplo Aluguel
                  </button>
                </div>

                <button
                  onClick={handleAudit}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black font-extrabold text-xs active:border-inset shadow flex items-center gap-2"
                >
                  {isLoading ? 'Auditando...' : 'Iniciar Auditoria (OK)'}
                </button>
              </div>

              {/* Barra de Progresso Win98 */}
              {isLoading && (
                <div className="w-full bg-white border-t border-l border-gray-600 p-1">
                  <div className="flex gap-1 animate-pulse">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="h-4 w-4 bg-[#000080]" />
                    ))}
                  </div>
                </div>
              )}

              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="p-2 bg-red-100 border border-red-400 text-red-900 text-xs">
                  ❌ {errorMessage}
                </div>
              )}

              {/* Exibição do Resultado da Análise */}
              {analysisResult && (
                <div className="mt-3 p-3 bg-white border-t-2 border-l-2 border-gray-700 border-r-2 border-b-2 border-white max-h-56 overflow-y-auto font-mono text-xs space-y-2">
                  <div className="bg-[#000080] text-white p-1 font-bold">
                    RELATÓRIO: {analysisResult.contract_type} [SCORE: {analysisResult.risk_score}/10 - {analysisResult.risk_level}]
                  </div>
                  <p className="text-black font-sans leading-relaxed">
                    {analysisResult.summary_plain_text}
                  </p>
                  <div className="border-t border-gray-300 pt-1">
                    <span className="font-bold text-red-700">ARMADILHAS DETECTADAS:</span>
                    {analysisResult.weaknesses_and_traps.map((t, i) => (
                      <div key={i} className="text-gray-900 text-[11px] mt-1">
                        • <strong>{t.title}</strong>: {t.plain_explanation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Janela 2: LEIAME.txt (Notepad) */}
        {activeWindow === 'readme' && (
          <div className="w-full max-w-lg bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black p-1 shadow-2xl z-20">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between text-white font-bold text-xs select-none">
              <span>Bloco de Notas - LEIAME.txt</span>
              <button
                onClick={() => setActiveWindow(null)}
                className="w-4 h-4 bg-[#c0c0c0] text-black border border-black text-[10px] font-bold"
              >
                X
              </button>
            </div>
            <div className="p-3 bg-white border-t-2 border-l-2 border-gray-700 border-r-2 border-b-2 border-white font-mono text-xs text-black space-y-2">
              <p>PROJETO: CONDINOME PANDA</p>
              <p>AUTORES: Daniel Douglas Melo Gomes Neto & Lucas Pereira Brito</p>
              <p>OBJETIVO: Leitor de contratos para cidadãos leigos.</p>
              <p>MOTOR DE IA: Bring Your Own AI (Gemini, Ollama local, OpenAI).</p>
              <p>--- FIM DO DOCUMENTO ---</p>
            </div>
          </div>
        )}

        {/* Janela 3: MS-DOS Prompt */}
        {activeWindow === 'dos' && (
          <div className="w-full max-w-lg bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black p-1 shadow-2xl z-20">
            <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-white font-bold text-xs">
              <span>Prompt do MS-DOS</span>
              <button
                onClick={() => setActiveWindow(null)}
                className="w-4 h-4 bg-[#c0c0c0] text-black border border-black text-[10px] font-bold"
              >
                X
              </button>
            </div>
            <div className="p-3 bg-black text-[#c0c0c0] font-mono text-xs space-y-1">
              <p>Microsoft(R) Windows 98</p>
              <p>(C)Copyright Microsoft Corp 1981-1998.</p>
              <p className="text-yellow-400">C:\PANDA&gt; DIR</p>
              <p>AUDITOR~1 EXE  2.048.576 31-10-26</p>
              <p>LEIAME   TXT         512 31-10-26</p>
              <p className="text-yellow-400">C:\PANDA&gt; <span className="animate-pulse">_</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Menu Iniciar do Windows 98 */}
      {isStartMenuOpen && (
        <div className="absolute bottom-9 left-1 w-52 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black shadow-2xl z-50 text-black text-xs font-bold">
          <div className="bg-[#000080] text-white p-2 font-black tracking-widest text-sm flex items-center gap-2">
            <span>WINDOWS 98</span>
          </div>
          <div className="p-1 space-y-1">
            <button
              onClick={() => {
                setActiveWindow('auditor');
                setIsStartMenuOpen(false);
              }}
              className="w-full text-left p-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
            >
              <span>🐼</span> Auditor de Contratos
            </button>
            <button
              onClick={() => {
                setActiveWindow('readme');
                setIsStartMenuOpen(false);
              }}
              className="w-full text-left p-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
            >
              <span>📝</span> LEIAME.txt
            </button>
            <div className="border-t border-gray-400 my-1"></div>
            <Link
              to="/"
              className="w-full text-left p-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
            >
              <span>🌐</span> Modo Padrão Web
            </Link>
            <Link
              to="/terminal"
              className="w-full text-left p-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
            >
              <span>🐧</span> Terminal Linux
            </Link>
          </div>
        </div>
      )}

      {/* Barra de Tarefas Inferior Clássica do Windows 98 */}
      <div className="h-9 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1 z-30 shadow-inner">
        {/* Botão Iniciar */}
        <button
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`px-2 py-0.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black font-extrabold text-xs text-black flex items-center gap-1.5 ${
            isStartMenuOpen ? 'border-inset bg-gray-300' : ''
          }`}
        >
          <i className="fab fa-windows text-blue-800"></i>
          <span>Iniciar</span>
        </button>

        {/* Janela Ativa na Barra */}
        {activeWindow && (
          <div className="px-3 py-0.5 bg-[#c0c0c0] border-t-2 border-l-2 border-gray-600 border-r-2 border-b-2 border-white text-xs font-bold text-black flex items-center gap-1.5 truncate max-w-xs">
            <span>🐼</span>
            <span className="truncate">Auditor de Contratos</span>
          </div>
        )}

        {/* Relógio Digital no Canto */}
        <div className="px-2 py-0.5 border-t border-l border-gray-600 border-r border-b border-white text-[11px] font-mono text-black">
          15:25
        </div>
      </div>
    </div>
  );
};
