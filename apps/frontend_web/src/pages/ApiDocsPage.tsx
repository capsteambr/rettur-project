import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ApiDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'js'>('curl');

  const curlExample = `curl -X POST "http://localhost:8000/api/v1/analyze/text" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "CONTRATO DE ALUGUEL: Multa de 6 meses em caso de saída antecipada...",
    "provider": "gemini",
    "user_role": "locatario"
  }'`;

  const pythonExample = `import requests

url = "http://localhost:8000/api/v1/analyze/text"
payload = {
    "text": "CONTRATO DE ALUGUEL: Multa de 6 meses...",
    "provider": "gemini",
    "user_role": "locatario"
}

response = requests.post(url, json=payload)
print(response.json())`;

  const jsExample = `const response = await fetch("http://localhost:8000/api/v1/analyze/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "CONTRATO DE ALUGUEL...",
    provider: "gemini",
    user_role: "locatario"
  })
});
const data = await response.json();
console.log(data);`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Cabeçalho da Documentação */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border-custom text-xs font-semibold text-secondary-text mb-3">
          <span className="text-accent">● OpenAPI / REST v1</span>
          <span>FastAPI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-text tracking-tight mb-2">
          Documentação da API Condinome Panda
        </h1>
        <p className="text-secondary-text text-sm sm:text-base leading-relaxed">
          Integre auditoria de contratos, detecção de pegadinhas e tradução de termos jurídicos diretamente no seu sistema ou aplicativo.
        </p>
      </div>

      {/* Endpoints Principais */}
      <div className="space-y-4">
        {/* Endpoint 1: POST /analyze */}
        <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold text-xs">
              POST
            </span>
            <code className="text-primary-text font-mono text-sm font-bold">/api/v1/analyze</code>
            <span className="text-xs text-secondary-text hidden sm:inline">• Upload multipart/form-data</span>
          </div>
          <p className="text-xs text-secondary-text mb-4">
            Recebe um arquivo (PDF ou TXT) ou texto de contrato e retorna o relatório estruturado completo.
          </p>

          <div className="bg-secondary-bg border border-border-custom rounded-xl p-4 font-mono text-xs text-secondary-text overflow-x-auto">
            <span className="text-accent font-bold">Campos aceitos (Form-Data):</span>
            <div className="mt-2 space-y-1">
              <div>• <strong>file:</strong> Arquivo PDF ou TXT (opcional)</div>
              <div>• <strong>text:</strong> Texto corrido do contrato (opcional se enviar arquivo)</div>
              <div>• <strong>provider:</strong> "gemini" | "ollama" | "openai" (opcional)</div>
              <div>• <strong>user_role:</strong> Papel do usuário (ex: "locatario", "prestador")</div>
              <div>• <strong>api_key:</strong> Chave de API temporária (opcional)</div>
            </div>
          </div>
        </div>

        {/* Endpoint 2: POST /analyze/text */}
        <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-400 font-mono font-bold text-xs">
              POST
            </span>
            <code className="text-primary-text font-mono text-sm font-bold">/api/v1/analyze/text</code>
            <span className="text-xs text-secondary-text hidden sm:inline">• JSON Payload</span>
          </div>
          <p className="text-xs text-secondary-text mb-4">
            Recebe o texto do contrato diretamente em formato JSON. Ideal para webhooks, automações e bots.
          </p>

          {/* Abas de código */}
          <div className="border border-border-custom rounded-xl overflow-hidden bg-secondary-bg">
            <div className="flex border-b border-border-custom bg-card px-2 pt-2 gap-1">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold ${
                  activeTab === 'curl' ? 'bg-secondary-bg text-accent' : 'text-secondary-text'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold ${
                  activeTab === 'python' ? 'bg-secondary-bg text-accent' : 'text-secondary-text'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold ${
                  activeTab === 'js' ? 'bg-secondary-bg text-accent' : 'text-secondary-text'
                }`}
              >
                Node / JS
              </button>
            </div>

            <pre className="p-4 font-mono text-xs text-primary-text overflow-x-auto leading-relaxed">
              {activeTab === 'curl' && curlExample}
              {activeTab === 'python' && pythonExample}
              {activeTab === 'js' && jsExample}
            </pre>
          </div>
        </div>

        {/* Endpoint 3: GET /ai/providers */}
        <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-400 font-mono font-bold text-xs">
              GET
            </span>
            <code className="text-primary-text font-mono text-sm font-bold">/api/v1/ai/providers</code>
          </div>
          <p className="text-xs text-secondary-text">
            Lista os provedores de inteligência artificial habilitados e seus status de conectividade.
          </p>
        </div>
      </div>

      {/* Link de volta */}
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline"
        >
          ← Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
};
