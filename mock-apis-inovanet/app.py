from fastapi import FastAPI, HTTPException, Path, Query
from pydantic import BaseModel, Field
from typing import Dict, List
import os
import re

# URL pública do ngrok (pode ser definida via variável de ambiente NGROK_URL ou editada aqui)
PUBLIC_SERVER_URL = os.getenv("NGROK_URL", "http://localhost:8000")

app = FastAPI(
    title="Inovanet - Mock APIs (Sólides RH & Omie Financeiro)",
    description=(
        "API de simulação local para o projeto 'Inovanet - Centralização de Ferramentas "
        "de RH e Financeiro com Gemini Enterprise'. Expõe endpoints REST para consulta "
        "de dados cadastrais/salariais na Sólides e despesas variáveis/reembolsos no Omie."
    ),
    version="1.0.0",
    openapi_version="3.0.2",
    servers=[
        {
            "url": PUBLIC_SERVER_URL,
            "description": "Servidor da API Mock Inovanet (ngrok / Local)",
        }
    ],
)


# =====================================================================
# MODELOS DE DADOS (SCHEMAS OPENAPI 3.0 COMPATÍVEIS COM GEMINI ENTERPRISE)
# =====================================================================

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


class ItemDespesaOmie(BaseModel):
    id_lancamento: str = Field(..., description="Código identificador do lançamento no Omie")
    data_lancamento: str = Field(..., description="Data da despesa (YYYY-MM-DD)")
    categoria: str = Field(..., description="Categoria financeira (ex: Viagem, Reembolso, Hospedagem)")
    origem_integracao: str = Field(..., description="Plataforma de origem do gasto (ex: Onfly, Flash, Direto Omie)")
    descricao: str = Field(..., description="Histórico/descrição da despesa")
    valor: float = Field(..., description="Valor da despesa em R$")
    status_pagamento: str = Field(..., description="Status do pagamento no contas a pagar do Omie")


class DespesasOmieResponse(BaseModel):
    fonte: str = Field(default="Omie ERP Financeiro (Mock REST)", description="Sistema de origem dos lançamentos")
    colaborador_cpf: str = Field(..., description="CPF consultado")
    periodo: str = Field(..., description="Período de competência consultado (YYYY-MM)")
    quantidade_lancamentos: int = Field(..., description="Total de registros encontrados para o filtro")
    total_despesas_variaveis: float = Field(..., description="Soma total das despesas variáveis no período em R$")
    despesas: List[ItemDespesaOmie] = Field(..., description="Lista detalhada de despesas/reembolsos")
    observacao: str = Field(
        default="",
        description="Mensagem informativa sobre o resultado da consulta ou ausência de dados no período",
    )


# =====================================================================
# BASE DE DADOS SIMULADA (MOCK DATA)
# =====================================================================

COLABORADORES_SOLIDES: Dict[int, dict] = {
    101: {
        "fonte": "Sólides RH (Mock)",
        "colaborador_id": 101,
        "nome": "Ana Beatriz Souza",
        "colaborador_cpf": "123.456.789-00",
        "cargo": "Analista de Dados Sênior",
        "departamento": "Tecnologia e Dados",
        "status": "Ativo",
        "data_admissao": "2024-03-10",
        "salario_base": 8500.00,
        "beneficios_fixos": {
            "vale_refeicao_alimentacao": 880.00,
            "plano_saude_sulamerica": 650.00,
            "wellhub_gympass": 150.00,
            "auxilio_home_office": 200.00,
        },
        "total_beneficios_fixos": 1880.00,
    },
    102: {
        "fonte": "Sólides RH (Mock)",
        "colaborador_id": 102,
        "nome": "Carlos Eduardo Lima",
        "colaborador_cpf": "987.654.321-11",
        "cargo": "Analista Financeiro Pleno",
        "departamento": "Financeiro",
        "status": "Ativo",
        "data_admissao": "2025-01-15",
        "salario_base": 6200.00,
        "beneficios_fixos": {
            "vale_refeicao_alimentacao": 880.00,
            "plano_saude_sulamerica": 520.00,
            "wellhub_gympass": 0.00,
            "auxilio_home_office": 200.00,
        },
        "total_beneficios_fixos": 1600.00,
    },
}

# Despesas no Omie indexadas por CPF (apenas dígitos para facilitar busca com/sem máscara)
DESPESAS_OMIE_POR_CPF: Dict[str, Dict[str, List[dict]]] = {
    "12345678900": {
        "2026-10": [
            {
                "id_lancamento": "OMIE-202610-001",
                "data_lancamento": "2026-10-08",
                "categoria": "Viagens Corporativas",
                "origem_integracao": "Onfly - Refund",
                "descricao": "Passagem aérea e deslocamento para reunião presencial em São Paulo",
                "valor": 940.50,
                "status_pagamento": "Pago",
            },
            {
                "id_lancamento": "OMIE-202610-002",
                "data_lancamento": "2026-10-15",
                "categoria": "Reembolso de Despesas",
                "origem_integracao": "Flash - Gestão de Despesas",
                "descricao": "Alimentação e táxi durante evento técnico",
                "valor": 285.00,
                "status_pagamento": "Pago",
            },
            {
                "id_lancamento": "OMIE-202610-003",
                "data_lancamento": "2026-10-22",
                "categoria": "Hospedagem",
                "origem_integracao": "Onfly - Refund",
                "descricao": "Diária de hotel em São Paulo (1 noite)",
                "valor": 420.00,
                "status_pagamento": "Pago",
            },
        ],
        "2026-09": [
            {
                "id_lancamento": "OMIE-202609-001",
                "data_lancamento": "2026-09-12",
                "categoria": "Reembolso de Despesas",
                "origem_integracao": "Flash - Gestão de Despesas",
                "descricao": "Compra de periférico autorizado (headset corporativo)",
                "valor": 310.00,
                "status_pagamento": "Pago",
            }
        ],
    },
    # Carlos Eduardo Lima (CPF 987.654.321-11) não possui despesas cadastradas no Omie
    "98765432111": {},
}


def normalizar_cpf(cpf: str) -> str:
    """Remove pontuação do CPF para permitir comparação consistente."""
    return re.sub(r"\D", "", cpf or "")


# =====================================================================
# ENDPOINTS DA API
# =====================================================================

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
    colaborador = COLABORADORES_SOLIDES.get(colaborador_id)
    if not colaborador:
        raise HTTPException(
            status_code=404,
            detail=f"Colaborador com ID {colaborador_id} não encontrado na base da Sólides.",
        )
    return colaborador


@app.get(
    "/omie/despesas",
    operation_id="consultar_despesas_omie",
    response_model=DespesasOmieResponse,
    tags=["Omie (Financeiro)"],
    summary="Consultar despesas variáveis e reembolsos por CPF e período",
    description=(
        "Simula via REST simplificado uma consulta ao módulo de Contas a Pagar / Despesas do Omie. "
        "Filtra os lançamentos pelo `colaborador_cpf` (obtido na Sólides) e pelo `periodo` de competência (`YYYY-MM`)."
    ),
)
def listar_despesas_omie(
    colaborador_cpf: str = Query(
        ...,
        description="CPF do colaborador com ou sem pontuação (ex: 123.456.789-00 ou 987.654.321-11)",
    ),
    periodo: str = Query(
        ...,
        pattern=r"^\d{4}-\d{2}$",
        description="Período de competência no formato YYYY-MM (ex: 2026-10)",
    ),
):
    cpf_limpo = normalizar_cpf(colaborador_cpf)
    if len(cpf_limpo) != 11:
        raise HTTPException(
            status_code=400,
            detail="O parâmetro 'colaborador_cpf' deve conter um CPF válido de 11 dígitos.",
        )

    despesas_colaborador = DESPESAS_OMIE_POR_CPF.get(cpf_limpo, {})
    lista_despesas = despesas_colaborador.get(periodo, [])
    total = round(sum(item["valor"] for item in lista_despesas), 2)

    observacao = "Despesas localizadas com sucesso."
    if not lista_despesas:
        observacao = (
            f"Nenhuma despesa variável ou reembolso encontrado no Omie para o CPF {colaborador_cpf} "
            f"no período {periodo}."
        )

    return {
        "fonte": "Omie ERP Financeiro (Mock REST)",
        "colaborador_cpf": colaborador_cpf,
        "periodo": periodo,
        "quantidade_lancamentos": len(lista_despesas),
        "total_despesas_variaveis": total,
        "despesas": lista_despesas,
        "observacao": observacao,
    }
