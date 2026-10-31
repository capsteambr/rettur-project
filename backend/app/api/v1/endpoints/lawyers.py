from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.contract import Lawyer, LawyerRegisterRequest

router = APIRouter()

# Base inicial de Advogados Credenciados para a plataforma SaaS
MOCK_LAWYERS: List[Lawyer] = [
    Lawyer(
        id="adv-1",
        name="Dra. Camila Vasconcelos",
        oab="OAB/GO 54.321",
        state="GO",
        city="Goiânia",
        areas=["Direito Imobiliário", "Direito Civil", "Direito do Consumidor"],
        bio="Especialista em contratos de locação residencial e comercial, revisão de cláusulas abusivas e incorporação imobiliária. Mais de 10 anos de atuação preventiva.",
        rating=4.9,
        review_count=48,
        phone="+55 62 99123-4567",
        email="camila.vasconcelos@adv.oabgo.org.br",
        verified=True,
        available_online=True
    ),
    Lawyer(
        id="adv-2",
        name="Dr. Rodrigo Mendes",
        oab="OAB/GO 61.890",
        state="GO",
        city="Goiânia",
        areas=["Direito do Trabalho", "Direito Empresarial"],
        bio="Atuação focada em relações de trabalho, contratos PJ/MEI, diagnóstico de vínculo empregatício e acordos coletivos com segurança jurídica.",
        rating=4.8,
        review_count=32,
        phone="+55 62 98456-7890",
        email="rodrigo.mendes@mendesadv.com.br",
        verified=True,
        available_online=True
    ),
    Lawyer(
        id="adv-3",
        name="Dra. Juliana Faria",
        oab="OAB/SP 412.333",
        state="SP",
        city="São Paulo",
        areas=["Direito do Consumidor", "Direito Bancário", "Direito Civil"],
        bio="Defesa de consumidores em contratos bancários, juros abusivos em financiamentos e contratos de adesão de serviços de grande porte.",
        rating=5.0,
        review_count=64,
        phone="+55 11 97654-3210",
        email="juliana.faria@fariajuridico.com.br",
        verified=True,
        available_online=True
    ),
    Lawyer(
        id="adv-4",
        name="Dr. Eduardo Albuquerque",
        oab="OAB/RJ 198.774",
        state="RJ",
        city="Rio de Janeiro",
        areas=["Direito Imobiliário", "Direito Empresarial"],
        bio="Mestre em Direito Civil com ênfase em garantias locatícias, resilição contratual sem multas desproporcionais e contratos de prestação continuada.",
        rating=4.7,
        review_count=29,
        phone="+55 21 99887-1122",
        email="eduardo@albuquerqueadv.com.br",
        verified=True,
        available_online=True
    ),
    Lawyer(
        id="adv-5",
        name="Dra. Larissa Bittencourt",
        oab="OAB/DF 48.912",
        state="DF",
        city="Brasília",
        areas=["Direito do Trabalho", "Direito Civil"],
        bio="Consultoria preventiva para profissionais autônomos, prestadores de serviços e pequenas empresas. Análise de riscos pré-contratuais.",
        rating=4.9,
        review_count=41,
        phone="+55 61 98112-3344",
        email="larissa@bittencourtadv.com.br",
        verified=True,
        available_online=True
    ),
    Lawyer(
        id="adv-6",
        name="Dr. Marcos Aurélio Prado",
        oab="OAB/GO 42.115",
        state="GO",
        city="Anápolis",
        areas=["Direito do Consumidor", "Direito Imobiliário"],
        bio="Especialista em contratos de compra e venda de imóveis na planta, rescisão por atraso de entrega e restituição de parcelas pagas.",
        rating=4.8,
        review_count=23,
        phone="+55 62 98765-4321",
        email="marcos.prado@pradoadv.com.br",
        verified=True,
        available_online=True
    )
]

PRACTICE_AREAS = [
    "Direito Imobiliário",
    "Direito do Trabalho",
    "Direito do Consumidor",
    "Direito Civil",
    "Direito Empresarial",
    "Direito Bancário",
    "Direito Digital e LGPD"
]


@router.get("/lawyers", response_model=List[Lawyer], summary="Lista advogados credenciados com filtros")
async def list_lawyers(
    area: Optional[str] = Query(None, description="Especialidade jurídica"),
    state: Optional[str] = Query(None, description="UF do advogado (ex: GO, SP, RJ)"),
    city: Optional[str] = Query(None, description="Cidade do advogado"),
    search: Optional[str] = Query(None, description="Busca textual por nome ou bio")
):
    results = MOCK_LAWYERS

    if area:
        area_lower = area.lower()
        results = [
            l for l in results
            if any(area_lower in a.lower() for a in l.areas)
        ]

    if state:
        results = [l for l in results if l.state.upper() == state.upper()]

    if city:
        city_lower = city.lower()
        results = [l for l in results if city_lower in l.city.lower()]

    if search:
        s = search.lower()
        results = [
            l for l in results
            if s in l.name.lower() or s in l.bio.lower() or s in l.oab.lower()
        ]

    return results


@router.get("/lawyers/areas", response_model=List[str], summary="Lista áreas de especialidade jurídica")
async def get_practice_areas():
    return PRACTICE_AREAS


@router.post("/lawyers/register", response_model=Lawyer, summary="Cadastro de advogado na plataforma SaaS")
async def register_lawyer(data: LawyerRegisterRequest):
    new_lawyer = Lawyer(
        id=f"adv-{len(MOCK_LAWYERS) + 1}",
        name=data.name,
        oab=data.oab,
        state=data.state.upper(),
        city=data.city,
        areas=data.areas,
        bio=data.bio,
        rating=5.0,
        review_count=1,
        phone=data.phone,
        email=data.email,
        verified=True,
        available_online=True
    )
    MOCK_LAWYERS.append(new_lawyer)
    return new_lawyer
