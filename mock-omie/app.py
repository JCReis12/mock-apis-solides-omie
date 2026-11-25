from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from pathlib import Path as FilePath
from typing import Dict, List, Optional
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
    title="Inovanet - Omie Financeiro & Despesas (Mock API)",
    description=(
        "API de simulação do Omie (ERP Financeiro) para o projeto Inovanet com Gemini Enterprise. "
        "Expõe endpoints REST para consulta de despesas variáveis, reembolsos (Onfly, Flash) e fechamento consolidado."
    ),
    version="1.1.0",
    servers=[
        {
            "url": PUBLIC_SERVER_URL,
            "description": "Servidor da API Mock Omie (Render / Local)",
        }
    ],
)
app.openapi_version = "3.0.2"

DB_FILE = FilePath(__file__).parent / "db_omie.json"


def carregar_banco_omie() -> Dict[str, Dict[str, List[dict]]]:
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def normalizar_cpf(cpf: str) -> str:
    """Remove pontuação do CPF para permitir comparação consistente."""
    return re.sub(r"\D", "", cpf or "")


# =====================================================================
# MODELOS DE DADOS OPENAPI 3.0.2
# =====================================================================

class ItemDespesaOmie(BaseModel):
    id_lancamento: str = Field(..., description="Código identificador do lançamento no Omie")
    data_lancamento: str = Field(..., description="Data da despesa (YYYY-MM-DD)")
    categoria: str = Field(..., description="Categoria financeira (ex: Viagem, Reembolso, Hospedagem, Infraestrutura Cloud)")
    origem_integracao: str = Field(..., description="Plataforma de origem do gasto (ex: Onfly - Refund, Flash - Gestão de Despesas, Direto Omie)")
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


class FechamentoCategoriaItem(BaseModel):
    categoria: str = Field(..., description="Nome da categoria (ex: Viagens Corporativas, Reembolso, Cloud)")
    origem: str = Field(..., description="Origem da integração (Onfly, Flash, Direto Omie)")
    subtotal: float = Field(..., description="Subtotal da categoria em R$")
    quantidade: int = Field(..., description="Quantidade de lançamentos")


class FechamentoFinanceiroResponse(BaseModel):
    colaborador_cpf: str = Field(..., description="CPF do colaborador")
    periodo: str = Field(..., description="Período apurado (YYYY-MM)")
    total_geral_variavel: float = Field(..., description="Total de despesas variáveis somadas em R$")
    total_onfly: float = Field(..., description="Total gasto em viagens/hospedagens via Onfly em R$")
    total_flash: float = Field(..., description="Total de reembolsos via Flash em R$")
    total_outros: float = Field(..., description="Total de despesas diretas/outros em R$")
    resumo_por_categoria: List[FechamentoCategoriaItem] = Field(..., description="Agrupamento das despesas")


# =====================================================================
# ENDPOINTS REST
# =====================================================================

@app.get(
    "/omie/despesas",
    operation_id="consultar_despesas_omie",
    response_model=DespesasOmieResponse,
    tags=["Omie (Financeiro)"],
    summary="Consultar despesas variáveis e reembolsos por CPF e período",
    description="Filtra lançamentos de despesas variáveis e reembolsos no Omie pelo CPF do colaborador e pelo período (YYYY-MM).",
)
def listar_despesas_omie(
    colaborador_cpf: str = Query(..., description="CPF do colaborador com ou sem pontuação"),
    periodo: str = Query(..., pattern=r"^\d{4}-\d{2}$", description="Período de competência no formato YYYY-MM (ex: 2026-10)"),
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


@app.get(
    "/omie/fechamento-consolidado",
    operation_id="consultar_fechamento_consolidado_omie",
    response_model=FechamentoFinanceiroResponse,
    tags=["Omie (Financeiro)"],
    summary="Obter resumo financeiro agrupado por canal (Onfly vs Flash vs Direto)",
    description="Agrupa e totaliza os gastos do colaborador separando automaticamente o que foi Onfly, Flash e Outros no mês.",
)
def obter_fechamento_consolidado(
    colaborador_cpf: str = Query(..., description="CPF do colaborador"),
    periodo: str = Query(..., pattern=r"^\d{4}-\d{2}$", description="Período no formato YYYY-MM (ex: 2026-10)"),
):
    cpf_limpo = normalizar_cpf(colaborador_cpf)
    banco_omie = carregar_banco_omie()
    despesas = banco_omie.get(cpf_limpo, {}).get(periodo, [])

    total_onfly = 0.0
    total_flash = 0.0
    total_outros = 0.0
    categorias_map = {}

    for d in despesas:
        val = d["valor"]
        origem = d.get("origem_integracao", "")
        cat = d.get("categoria", "Geral")

        if "Onfly" in origem:
            total_onfly += val
        elif "Flash" in origem:
            total_flash += val
        else:
            total_outros += val

        chave = (cat, origem)
        if chave not in categorias_map:
            categorias_map[chave] = {"subtotal": 0.0, "quantidade": 0}
        categorias_map[chave]["subtotal"] += val
        categorias_map[chave]["quantidade"] += 1

    resumo = [
        {
            "categoria": k[0],
            "origem": k[1],
            "subtotal": round(v["subtotal"], 2),
            "quantidade": v["quantidade"],
        }
        for k, v in categorias_map.items()
    ]

    total_geral = round(total_onfly + total_flash + total_outros, 2)

    return {
        "colaborador_cpf": colaborador_cpf,
        "periodo": periodo,
        "total_geral_variavel": total_geral,
        "total_onfly": round(total_onfly, 2),
        "total_flash": round(total_flash, 2),
        "total_outros": round(total_outros, 2),
        "resumo_por_categoria": resumo,
    }
