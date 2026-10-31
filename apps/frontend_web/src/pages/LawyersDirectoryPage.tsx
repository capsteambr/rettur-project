import React, { useState, useEffect } from 'react';
import { Lawyer } from '../types/contract';
import { fetchLawyers, fetchPracticeAreas, registerLawyer } from '../services/api';

export const LawyersDirectoryPage: React.FC = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de cadastro para novos advogados
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formOab, setFormOab] = useState('');
  const [formState, setFormState] = useState('GO');
  const [formCity, setFormCity] = useState('');
  const [formAreas, setFormAreas] = useState<string[]>(['Direito Imobiliário']);
  const [formBio, setFormBio] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  useEffect(() => {
    fetchPracticeAreas().then(setAreas);
    loadLawyers();
  }, [selectedArea, selectedState]);

  const loadLawyers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLawyers({
        area: selectedArea || undefined,
        state: selectedState || undefined,
        search: searchTerm || undefined,
      });
      setLawyers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLawyers();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerLawyer({
        name: formName,
        oab: formOab,
        state: formState,
        city: formCity,
        areas: formAreas,
        bio: formBio,
        phone: formPhone,
        email: formEmail,
      });
      setRegisterSuccess(true);
      setTimeout(() => {
        setIsRegisterOpen(false);
        setRegisterSuccess(false);
        loadLawyers();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Topo / Hero do Diretório */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-custom">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border-custom text-xs font-semibold text-secondary-text mb-3 shadow-sm">
            <span className="text-accent">● OAB Verificada</span>
            <span>Conexão Ética e Responsável (Provimento 205/2021)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-text tracking-tight">
            Advogados Especialistas Credenciados
          </h1>
          <p className="text-secondary-text text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
            Consulte profissionais habilitados pela OAB para validar seu contrato, emitir parecer formal ou conduzir negociações com segurança jurídica.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-card hover:bg-card-hover border border-accent/40 text-accent font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <i className="fas fa-briefcase"></i>
          <span>Sou Advogado (Cadastrar no SaaS)</span>
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-card border border-border-custom rounded-2xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca por texto */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-secondary-text mb-1">
              Buscar por Nome ou Termo:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Camila, Imobiliário..."
                className="w-full bg-secondary-bg border border-border-custom text-primary-text rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Filtro por Especialidade */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-secondary-text mb-1">
              Área de Atuação:
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-secondary-bg border border-border-custom text-primary-text rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent font-medium"
            >
              <option value="">Todas as Especialidades</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado / UF */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-secondary-text mb-1">
              Estado / Região:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-secondary-bg border border-border-custom text-primary-text rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent font-medium"
            >
              <option value="">Todos os Estados</option>
              <option value="GO">Goiás (GO)</option>
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="DF">Distrito Federal (DF)</option>
              <option value="MG">Minas Gerais (MG)</option>
            </select>
          </div>

          {/* Botão de Filtrar */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition"
            >
              <i className="fas fa-magnifying-glass"></i>
              <span>Filtrar Resultados</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Advogados */}
      {isLoading ? (
        <div className="text-center py-16 text-secondary-text">
          <i className="fas fa-spinner fa-spin text-2xl text-accent mb-2"></i>
          <p className="text-xs">Buscando advogados cadastrados...</p>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border-custom rounded-2xl p-8">
          <i className="fas fa-scale-balanced text-4xl text-secondary-text/50 mb-3"></i>
          <p className="text-primary-text font-bold">Nenhum advogado encontrado para estes filtros.</p>
          <p className="text-xs text-secondary-text mt-1">Tente remover os filtros ou buscar por outra região.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-card border border-border-custom hover:border-accent/50 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between group"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-primary-text text-sm group-hover:text-accent transition">
                        {lawyer.name}
                      </h3>
                      <i className="fas fa-circle-check text-accent text-xs" title="OAB Verificada"></i>
                    </div>
                    <span className="text-[11px] font-mono text-secondary-text font-bold">
                      {lawyer.oab} • {lawyer.city} - {lawyer.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold">
                    <i className="fas fa-star text-[10px]"></i>
                    <span>{lawyer.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Tags de Especialidade */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {lawyer.areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-bg border border-border-custom text-accent"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                {/* Biografia */}
                <p className="text-xs text-secondary-text line-clamp-3 leading-relaxed mb-4">
                  {lawyer.bio}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-border-custom flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${lawyer.phone.replace(/[^0-9]/g, '')}?text=Olá,%20Doutor(a)%20${encodeURIComponent(
                    lawyer.name
                  )},%20encontrei%20seu%20contato%20no%20Rettur%20e%20gostaria%20de%20consultoria%20sobre%20um%20contrato.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`mailto:${lawyer.email}?subject=Consulta Jurídica via Rettur`}
                  className="py-2 px-3 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs flex items-center justify-center transition"
                  title="Enviar E-mail"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro de Advogados (SaaS) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border-custom rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
              <div>
                <h3 className="font-extrabold text-primary-text text-base">
                  Cadastro de Advogado no SaaS
                </h3>
                <p className="text-xs text-secondary-text">Faça parte do diretório credenciado do Rettur</p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-secondary-text hover:text-primary-text"
              >
                <i className="fas fa-xmark text-lg"></i>
              </button>
            </div>

            {registerSuccess ? (
              <div className="py-8 text-center text-accent">
                <i className="fas fa-circle-check text-4xl mb-2"></i>
                <h4 className="font-extrabold text-lg text-primary-text">Cadastro Realizado com Sucesso!</h4>
                <p className="text-xs text-secondary-text mt-1">Seu perfil já está visível para os clientes da sua comarca.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-secondary-text mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Ramos"
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-secondary-text mb-1">Número da OAB/UF:</label>
                    <input
                      type="text"
                      required
                      value={formOab}
                      onChange={(e) => setFormOab(e.target.value)}
                      placeholder="Ex: OAB/GO 12.345"
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-secondary-text mb-1">Estado / UF:</label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                    >
                      <option value="GO">Goiás (GO)</option>
                      <option value="SP">São Paulo (SP)</option>
                      <option value="RJ">Rio de Janeiro (RJ)</option>
                      <option value="DF">Distrito Federal (DF)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">Cidade / Comarca:</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Ex: Goiânia"
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-secondary-text mb-1">WhatsApp de Contato:</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+55 62 99999-9999"
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-secondary-text mb-1">E-mail Profissional:</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="advogado@escritorio.com"
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">Especialidade Principal:</label>
                  <select
                    value={formAreas[0] || 'Direito Imobiliário'}
                    onChange={(e) => setFormAreas([e.target.value])}
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">Apresentação / Biografia:</label>
                  <textarea
                    rows={3}
                    required
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Descreva suas principais especialidades contratuais e anos de atuação..."
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="p-3 bg-secondary-bg border border-border-custom rounded-xl text-[11px] text-secondary-text">
                  <span className="font-bold text-primary-text block mb-1">Plano Piloto Hackathon:</span>
                  Acesso gratuito por 30 dias com recebimento de leads qualificados de contratos analisados.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-4 py-2 rounded-xl text-secondary-text hover:text-primary-text font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black shadow"
                  >
                    Cadastrar e Ativar Perfil
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
