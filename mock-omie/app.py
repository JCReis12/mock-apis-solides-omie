from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from pathlib import Path as FilePath
from typing import Dict, List
import json
import os
import re

# URL pública do Render ou ngrok (fallback para localhost:8000)
PUBLIC_SERVER_URL = (
    os.getenv("RENDER_EXTERNAL_URL")
    or os.getenv("NGROK_URL")
    or "http://localhost:8000"
)

app = FastAPI(
    title="Inovanet - Omie Financeiro (Mock API)",
    description=(
        "API de simulação do Omie (ERP Financeiro) para o projeto 'Inovanet - Centralização de Ferramentas "
        "de RH e Financeiro com Gemini Enterprise'. Expõe endpoint REST para consulta de despesas "
        "variáveis e reembolsos filtrados por CPF e período."
    ),
    version="1.0.0",
    openapi_version="3.0.2",
    servers=[
        {
            "url": PUBLIC_SERVER_URL,
            "description": "Servidor da API Mock Omie (Render / Local)",
        }
    ],
)

DB_FILE = FilePath(__file__).parent / "db_omie.json"


def carregar_banco_omie() -> Dict[str, Dict[str, List[dict]]]:
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def normalizar_cpf(cpf: str) -> str:
    """Remove pontuação do CPF para permitir comparação consistente."""
    return re.sub(r"\D", "", cpf or "")


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

    banco_omie = carregar_banco_omie()
    despesas_colaborador = banco_omie.get(cpf_limpo, {})
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
