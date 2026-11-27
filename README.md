# Inovanet — Gestão de Custos & Centralização de Ferramentas (PI)

Repositório do projeto de centralização de ferramentas de **RH (Sólides & Ecossistema People)**, **Financeiro (Omie, Onfly & Flash)**, **Dados Estáticos (BigQuery)** e **Observabilidade** integrados a um Agente Orquestrador no **Google Cloud Gemini Enterprise**.

---

## Estrutura do Projeto

| Pasta / Arquivo | Descrição |
| :--- | :--- |
| [`docs/`](docs/) | Documentação geral, roadmap, prompts de demonstração, padrão Git e estudos técnicos de integração. |
| [`data/`](data/) | 6 bases `.csv` estruturadas por domínio para consumo nos nós do agente no Gemini Enterprise / BigQuery. |
| [`mock-solides/`](mock-solides/) | API Mock FastAPI v1.1.0 da Sólides, Ecossistema People e Observabilidade (Render Web Service 1). |
| [`mock-omie/`](mock-omie/) | API Mock FastAPI v1.1.0 do Omie ERP e Fechamento Consolidado (Render Web Service 2). |
| [`scripts/`](scripts/) | Scripts utilitários de sincronização ETL entre as APIs do Render e a pasta `data/`. |
| [`render.yaml`](render.yaml) | Blueprint de deploy automatizado dos dois Web Services no Render. |

---

## Documentos Principais

- **Visão 360º e Arquitetura:** [docs/CONTEXTO_GERAL_PROJETO.md](docs/CONTEXTO_GERAL_PROJETO.md)
- **Roadmap e Checklist:** [docs/ToDo.md](docs/ToDo.md)
- **Prompts de Demonstração do Agente:** [docs/PROMPTS_TESTE_E_DEMONSTRACAO.md](docs/PROMPTS_TESTE_E_DEMONSTRACAO.md)
- **Padrão de Commits e Branches:** [docs/padrao-commits-e-versionamento.md](docs/padrao-commits-e-versionamento.md)

---

## Execução Local Rápida

```powershell
# Terminal 1 — Sólides RH, People e Observabilidade (Swagger em http://127.0.0.1:8001/docs)
py -m uvicorn app:app --reload --port 8001 --app-dir mock-solides

# Terminal 2 — Omie Financeiro e Fechamento (Swagger em http://127.0.0.1:8002/docs)
py -m uvicorn app:app --reload --port 8002 --app-dir mock-omie
```

## Endpoints em Produção (Render)

- **Sólides Swagger UI:** https://inovanet-mock-solides.onrender.com/docs
- **Omie Swagger UI:** https://inovanet-mock-omie.onrender.com/docs
