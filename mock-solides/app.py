from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel, Field
from pathlib import Path as FilePath
from typing import Dict
import json
import os

# URL pública do Render ou ngrok (fallback para localhost:8000)
PUBLIC_SERVER_URL = (
    os.getenv("RENDER_EXTERNAL_URL")
    or os.getenv("NGROK_URL")
    or "http://localhost:8000"
)

app = FastAPI(
    title="Inovanet - Sólides RH (Mock API)",
    description=(
        "API de simulação da Sólides (RH) para o projeto 'Inovanet - Centralização de Ferramentas "
        "de RH e Financeiro com Gemini Enterprise'. Expõe endpoint REST para consulta de dados "
        "cadastrais, salário base, benefícios fixos e CPF do colaborador."
    ),
    version="1.0.0",
    servers=[
        {
            "url": PUBLIC_SERVER_URL,
            "description": "Servidor da API Mock Sólides (Render / Local)",
        }
    ],
)
app.openapi_version = "3.0.2"

DB_FILE = FilePath(__file__).parent / "db_solides.json"


def carregar_banco_solides() -> Dict[int, dict]:
    with open(DB_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)
    return {int(k): v for k, v in dados.items()}


class BeneficiosFixos(BaseModel):
    vale_refeicao_alimentacao: float = Field(..., description="Valor mensal de VR/VA em R$")
    plano_saude_sulamerica: float = Field(..., description="Custo mensal do plano de saúde SulAmérica em R$")
    wellhub_gympass: float = Field(..., description="Custo mensal do benefício Wellhub em R$")
    auxilio_home_office: float = Field(..., description="Auxílio mensal de home office em R$")


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


@app.get(
    "/solides/colaboradores/{colaborador_id}",
    operation_id="consultar_colaborador_solides",
    response_model=ColaboradorSolidesResponse,
    tags=["Sólides (RH)"],
    summary="Consultar dados cadastrais, salário base e benefícios fixos do colaborador",
    description=(
        "Retorna os dados de RH armazenados na Sólides para um colaborador específico "
        "a partir do seu `colaborador_id` (ex: `101` para Ana Beatriz Souza ou `102` para Carlos Eduardo Lima). "
        "Inclui o `colaborador_cpf` necessário para consultar despesas no Omie."
    ),
)
def obter_colaborador_solides(
    colaborador_id: int = Path(
        ...,
        description="ID interno do colaborador na Sólides (ex: 101 ou 102)",
    )
):
    colaboradores = carregar_banco_solides()
    colaborador = colaboradores.get(colaborador_id)
    if not colaborador:
        raise HTTPException(
            status_code=404,
            detail=f"Colaborador com ID {colaborador_id} não encontrado na base da Sólides.",
        )
    return colaborador
