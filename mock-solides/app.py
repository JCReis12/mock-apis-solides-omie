from fastapi import FastAPI, HTTPException, Path, Query
from pydantic import BaseModel, Field
from pathlib import Path as FilePath
from typing import Dict, List, Optional
import json
import os

# URL pública do Render ou ngrok (fallback para localhost:8000)
PUBLIC_SERVER_URL = (
    os.getenv("RENDER_EXTERNAL_URL")
    or os.getenv("NGROK_URL")
    or "http://localhost:8000"
)

app = FastAPI(
    title="Inovanet - Sólides RH & Ecossistema People (Mock API)",
    description=(
        "API de simulação da Sólides (RH) e conectores do ecossistema People (SulAmérica, Wellhub, "
        "Flash Benefícios, Vixting, Porto Seguro e Alura/Senai) para o projeto Inovanet com Gemini Enterprise."
    ),
    version="1.1.0",
    servers=[
        {
            "url": PUBLIC_SERVER_URL,
            "description": "Servidor da API Mock Sólides (Render / Local)",
        }
    ],
)
app.openapi_version = "3.0.2"

BASE_DIR = FilePath(__file__).parent
DB_FILE = BASE_DIR / "db_solides.json"
TELEMETRIA_FILE = BASE_DIR / "telemetria_observabilidade.json"


def carregar_banco_solides() -> Dict[int, dict]:
    with open(DB_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)
    return {int(k): v for k, v in dados.items()}


def carregar_telemetria() -> dict:
    if TELEMETRIA_FILE.exists():
        with open(TELEMETRIA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


# =====================================================================
# MODELOS DE DADOS OPENAPI 3.0.2
# =====================================================================

class BeneficiosFixos(BaseModel):
    vale_refeicao_alimentacao: float = Field(..., description="Valor mensal de VR/VA em R$")
    plano_saude_sulamerica: float = Field(..., description="Custo mensal do plano de saúde SulAmérica em R$")
    wellhub_gympass: float = Field(..., description="Custo mensal do benefício Wellhub em R$")
    auxilio_home_office: float = Field(..., description="Auxílio mensal de home office em R$")


class ColaboradorResumo(BaseModel):
    colaborador_id: int = Field(..., description="ID único do colaborador na Sólides")
    nome: str = Field(..., description="Nome completo")
    cargo: str = Field(..., description="Cargo atual")
    departamento: str = Field(..., description="Departamento/Área")
    colaborador_cpf: str = Field(..., description="CPF do colaborador")
    status: str = Field(..., description="Status do contrato")


class ColaboradorSolidesResponse(BaseModel):
    fonte: str = Field(default="Sólides RH (Mock)", description="Sistema de origem do registro")
    colaborador_id: int = Field(..., description="ID único do colaborador na Sólides")
    nome: str = Field(..., description="Nome completo do colaborador")
    colaborador_cpf: str = Field(..., description="CPF do colaborador (chave de cruzamento com o Omie)")
    cargo: str = Field(..., description="Cargo atual")
    departamento: str = Field(..., description="Área/Departamento de alocação")
    status: str = Field(..., description="Status contratual do colaborador")
    data_admissao: str = Field(..., description="Data de admissão (YYYY-MM-DD)")
    salario_base: float = Field(..., description="Salário bruto base mensal em R$")
    beneficios_fixos: BeneficiosFixos
    total_beneficios_fixos: float = Field(..., description="Soma dos benefícios fixos mensais em R$")


class IntegracoesPeopleResponse(BaseModel):
    colaborador_id: int = Field(..., description="ID do colaborador")
    nome: str = Field(..., description="Nome do colaborador")
    integracoes_people: dict = Field(..., description="Detalhamento em SulAmérica, Wellhub, Porto Seguro, Flash, Vixting e Alura")


class HealthStatusItem(BaseModel):
    systemId: str = Field(..., description="Identificador do sistema integrado")
    health: str = Field(..., description="Saúde operacional (available, degraded, maintenance, unavailable, unknown)")
    integrationState: str = Field(..., description="Estado da integração (enabled, paused, not_configured)")
    metrics: dict = Field(default_factory=dict, description="Métricas de disponibilidade e latência")


class HealthOverviewResponse(BaseModel):
    businessPeriod: str = Field(..., description="Período de referência (YYYY-MM)")
    totalSistemas: int = Field(..., description="Total de sistemas monitorados")
    observations: List[HealthStatusItem] = Field(..., description="Status e indicadores de cada conector")


# =====================================================================
# ENDPOINTS REST
# =====================================================================

@app.get(
    "/solides/colaboradores",
    operation_id="listar_colaboradores_solides",
    response_model=List[ColaboradorResumo],
    tags=["Sólides (RH)"],
    summary="Listar ou buscar colaboradores por nome ou departamento",
    description="Permite ao agente buscar colaboradores pelo nome ou listar todos os cadastros disponíveis para descobrir IDs e CPFs.",
)
def listar_colaboradores(
    nome: Optional[str] = Query(None, description="Filtro parcial por nome do colaborador (ex: 'Mariana', 'Beatriz')"),
    departamento: Optional[str] = Query(None, description="Filtro por departamento (ex: 'Tecnologia', 'Comercial')"),
):
    colaboradores = carregar_banco_solides()
    resultado = []
    nome_filtro = nome.lower().strip() if nome else ""
    dep_filtro = departamento.lower().strip() if departamento else ""

    for colab in colaboradores.values():
        if nome_filtro and nome_filtro not in colab["nome"].lower():
            continue
        if dep_filtro and dep_filtro not in colab["departamento"].lower():
            continue
        resultado.append({
            "colaborador_id": colab["colaborador_id"],
            "nome": colab["nome"],
            "cargo": colab["cargo"],
            "departamento": colab["departamento"],
            "colaborador_cpf": colab["colaborador_cpf"],
            "status": colab["status"],
        })
    return resultado


@app.get(
    "/solides/colaboradores/{colaborador_id}",
    operation_id="consultar_colaborador_solides",
    response_model=ColaboradorSolidesResponse,
    tags=["Sólides (RH)"],
    summary="Consultar dados cadastrais, salário base e benefícios fixos do colaborador",
    description="Retorna dados de RH, salário base, benefícios fixos e CPF da Sólides a partir do ID (ex: 101, 102, 103, 104).",
)
def obter_colaborador_solides(
    colaborador_id: int = Path(..., description="ID interno do colaborador na Sólides (ex: 101, 102, 103, 104)")
):
    colaboradores = carregar_banco_solides()
    colaborador = colaboradores.get(colaborador_id)
    if not colaborador:
        raise HTTPException(
            status_code=404,
            detail=f"Colaborador com ID {colaborador_id} não encontrado na base da Sólides.",
        )
    return colaborador


@app.get(
    "/solides/colaboradores/{colaborador_id}/beneficios-detalhados",
    operation_id="consultar_beneficios_detalhados_people",
    response_model=IntegracoesPeopleResponse,
    tags=["Sólides (RH)"],
    summary="Consultar detalhamento das integrações People (SulAmérica, Wellhub, Vixting, Porto Seguro, Alura)",
    description="Retorna status e planos detalhados dos benefícios e fornecedores de RH vinculados ao colaborador.",
)
def obter_beneficios_detalhados(
    colaborador_id: int = Path(..., description="ID interno do colaborador na Sólides (ex: 101, 102, 103, 104)")
):
    colaboradores = carregar_banco_solides()
    colaborador = colaboradores.get(colaborador_id)
    if not colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado.")
    return {
        "colaborador_id": colaborador_id,
        "nome": colaborador["nome"],
        "integracoes_people": colaborador.get("integracoes_people", {}),
    }


@app.get(
    "/solides/integracoes/status",
    operation_id="consultar_status_integracoes_people",
    response_model=HealthOverviewResponse,
    tags=["Observabilidade & Conectores"],
    summary="Consultar telemetria e integridade dos conectores do ecossistema (Sólides, Flash, Onfly, etc.)",
    description="Retorna disponibilidade, latência p95, taxa de erro e saúde de todos os nós e fornecedores mapeados no projeto.",
)
def obter_status_integracoes():
    telemetria = carregar_telemetria()
    observacoes = telemetria.get("observations", [])
    periodo = telemetria.get("provenance", {}).get("businessPeriod", "2026-10")
    
    lista = []
    for obs in observacoes:
        lista.append({
            "systemId": obs.get("systemId"),
            "health": obs.get("health"),
            "integrationState": obs.get("integrationState"),
            "metrics": obs.get("metrics") or {},
        })
    return {
        "businessPeriod": periodo,
        "totalSistemas": len(lista),
        "observations": lista,
    }
