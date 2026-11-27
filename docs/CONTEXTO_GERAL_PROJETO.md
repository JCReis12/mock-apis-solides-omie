# 📘 Contexto Geral do Projeto — Inovanet: Centralização e Gestão de Custos (PI)

---

## 1. Visão Geral e Problema de Negócio

O projeto **Inovanet — Centralização de Ferramentas de RH e Financeiro com Gemini Enterprise** resolve a fragmentação de dados cadastrais, operacionais, financeiros e de observabilidade relacionados aos colaboradores e conectores da empresa (**2RPnet / Inovanet**).

Atualmente, as informações que compõem o **custo real de cada colaborador** e o estado das integrações estão distribuídas em múltiplos sistemas independentes, exigindo cadastros manuais repetitivos e cruzamentos manuais em planilhas:

1. **Camada de Dados Mestres / Estáticos (Simulação Google BigQuery):**
   - Concentra a tabela dimensional de colaboradores (`colaborador_id`, `nome`, `colaborador_cpf`, `email_corporativo`, `cargo`, `departamento`, `centro_custo`, `regime_contratacao`, `status`, `data_admissao` e `gestor_direto`).
   - Atua como **ponto único de entrada (Single Source of Truth)** para resolver IDs e CPFs antes de qualquer consulta transacional.
2. **Módulo People / RH (Conector Central: Sólides + Ecossistema People):**
   - **Sólides RH:** Salário base e benefícios fixos mensais (VR/VA, Plano de Saúde SulAmérica, Wellhub/Gympass, Auxílio Home Office).
   - **Ecossistema People:** Detalhamento de planos e dependentes (SulAmérica Saúde), check-ins de academia (Wellhub), seguro de vida (Porto Seguro), saldo de benefícios (Flash Benefícios), saúde ocupacional / ASO (Vixting) e capacitação (Alura e SENAI).
3. **Módulo Financeiro / ERP (Conector Central: Omie + Onfly / Flash):**
   - **Omie ERP:** Contas a pagar, lançamentos financeiros por CPF e competência (`YYYY-MM`), infraestrutura direta (GCP/Cloud) e fechamento consolidado por canal.
   - **Onfly & Flash:** Detalhamento granular de viagens corporativas, hospedagens (Onfly) e reembolsos/cartão corporativo (Flash).
4. **Módulo de Observabilidade e Infraestrutura (Telemetria dos Conectores):**
   - Monitoramento de saúde (`available`, `degraded`, `unavailable`, `maintenance`, `unknown`), estado de integração (`enabled`, `paused`, `not_configured`), disponibilidade, latência p95, taxa de erro, status HTTP e rastreio de execução do pipeline (`DEMO-EXEC-0042`) para **14 sistemas integrados** (Sólides, Omie, Agente, Frontend, Onfly, Flash, Vixting, SharePoint, Autentique, Saúde/Wellhub, Porto Seguro, Clude, Alura e SENAI).

### Objetivo da Solução
Construir uma arquitetura modular baseada em **APIs REST (FastAPI / OpenAPI 3.0.2)**, **Bases Tabulares Estruturadas (`data/*.csv` / BigQuery)** e um **Agente Orquestrador no Google Cloud Gemini Enterprise (Workflow Builder com Switch Condicional)** capaz de:
- Resolver dados estáticos e chaves de integração (`colaborador_id` e `colaborador_cpf`) a partir do **BigQuery**;
- Rotear cada solicitação em linguagem natural **apenas para os nós necessários** via Switch condicional (evitando execuções desnecessárias em perguntas simples);
- Consolidar, quando solicitado, o **Custo Mensal Total por Colaborador** ($\text{Salário Base} + \text{Benefícios Fixos} + \text{Despesas Variáveis e Reembolsos}$), além de responder auditorias de benefícios, viagens e saúde de conectores.

---

## 2. Arquitetura da Solução

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA 1: MOCK APIs (FASTAPI v1.1.0)                         │
│                                                                                      │
│  ┌────────────────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │  API Mock Sólides & People (FastAPI)   │  │  API Mock Omie ERP (FastAPI)       │  │
│  │  • db_solides.json (4 colaboradores)   │  │  • db_omie.json (despesas/canais)  │  │
│  │  • telemetria_observabilidade.json     │  │  • /omie/despesas                  │  │
│  │  Deploy: Render (Web Service 1)        │  │  • /omie/fechamento-consolidado    │  │
│  └──────────────────┬─────────────────────┘  │  Deploy: Render (Web Service 2)    │  │
│                     │                        └──────────────────┬─────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┼────────────────────┘
                      ▼                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                  CAMADA 2: BASES TABULARES (data/*.csv / BIGQUERY)                   │
│                                                                                      │
│  • bigquery_dados_estaticos.csv       • solides_colaboradores.csv                    │
│  • omie_despesas.csv                  • people_beneficios_capacitacao.csv            │
│  • onfly_flash_despesas.csv           • observabilidade_conectores.csv               │
│  (Sincronização auxiliar via scripts/sync_apis_to_drive.py)                          │
└─────────────────────────────────────────┬────────────────────────────────────────────┘
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│             CAMADA 3: ORQUESTRAÇÃO IA (GEMINI ENTERPRISE WORKFLOW)                   │
│                                                                                      │
│   [Manual Trigger: solicitacao_usuario]                                              │
│                     │                                                                │
│                     ▼                                                                │
│   [Nó 1: BigQuery - Dados Estáticos e Cadastrais] ──► Resolve ID, CPF, Cargo, CC     │
│                     │                                                                │
│                     ▼                                                                │
│              ╔══════╧══════╗                                                         │
│              ║   SWITCH    ║ (Roteamento Condicional por Intenção)                   │
│              ╚══════╤══════╝                                                         │
│   ┌─────────┬───────┴───┬──────────────┬─────────────────┬───────────────────────┐   │
│   ▼         ▼           ▼              ▼                 ▼                       ▼   │
│ [Ramo 1]  [Ramo 2]    [Ramo 3]       [Ramo 4]          [Ramo 5]               [Else] │
│ Apenas    Sólides     Omie +         Ecossistema       Observabilidade     Sólides → │
│ BigQuery  (Folha/     Onfly/Flash    People            (14 sistemas +      Omie →    │
│ (Cadastro Benef.)     (Despesas)     (Saúde/Cursos)    DEMO-EXEC-0042)     Onfly →   │
│  Direto)                                                                 Consolidação│
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura do Repositório (`pi-i1`)

```text
pi-i1/
├── README.md                                     # Página inicial com guia rápido e índices do projeto
├── render.yaml                                   # Blueprint de infraestrutura dos 2 serviços no Render
├── .gitignore                                    # Regras de arquivos ignorados pelo Git
│
├── data/                                         # Bases CSV estruturadas consumidas pelos nós do Agente
│   ├── bigquery_dados_estaticos.csv              # Tabela dimensional de colaboradores (ID, CPF, cargo, CC, gestor)
│   ├── solides_colaboradores.csv                 # Folha base e benefícios fixos (Sólides RH)
│   ├── omie_despesas.csv                         # Lançamentos de contas a pagar e reembolsos (Omie)
│   ├── people_beneficios_capacitacao.csv         # SulAmérica, Wellhub, Porto Seguro, Flash, Vixting, Alura, SENAI
│   ├── onfly_flash_despesas.csv                  # Detalhamento granular de viagens (Onfly) e reembolsos (Flash)
│   └── observabilidade_conectores.csv            # Telemetria, saúde e métricas de 14 sistemas + DEMO-EXEC-0042
│
├── docs/                                         # Documentação completa, prompts, planejamento e mapeamentos
│   ├── CONTEXTO_GERAL_PROJETO.md                 # Este documento de visão 360º do projeto
│   ├── ToDo.md                                   # Roadmap e controle de tarefas dividido em 4 fases
│   ├── PROMPTS_TESTE_E_DEMONSTRACAO.md           # Catálogo com 7 prompts executivos prontos para demonstração
│   ├── padrao-commits-e-versionamento.md         # Guia de Git Flow, branches e Conventional Commits
│   ├── anotacoes_reuniao_inicial.md              # Ata de priorização de demandas (RH, Saúde, Educação, Infra)
│   ├── empresas_e_parcerias_tipos_de_dados.md    # Mapeamento de empresas/parceiros e tipos de dados emitidos
│   ├── lista_ferramentas.md                      # Catálogo geral de ferramentas conectadas ao Omie, Sólides e Infra
│   ├── mapeamento_ferramentas_bigquery.md        # Mapeamento das bases candidatas ao Google Cloud BigQuery
│   ├── img_fluxo/                                # Diagramas visuais do ecossistema (Financeiro, RH, Externos)
│   └── mapeamentos/                              # Estudos técnicos profundos por vertical
│       ├── mapeamento_conexao_infra/             # Relatórios GLPI, Grafana e Fornecedores de TI
│       ├── mapeamento_conexao_omie/              # Relatório técnico de integrações financeiras Omie
│       └── mapeamento_conexao_solides/           # Arquitetura Integration Hub, Webhooks e APIs Sólides
│
├── mock-solides/                                 # Serviço 1 (Render Root Directory: mock-solides/)
│   ├── app.py                                    # FastAPI v1.1.0 (OpenAPI 3.0.2, 4 endpoints)
│   ├── db_solides.json                           # Banco mockado (4 colaboradores + integrações People)
│   ├── telemetria_observabilidade.json           # Base de telemetria dos conectores e pipeline
│   ├── openapi.json                              # Especificação OpenAPI 3.0.2 exportada
│   ├── requirements.txt                          # Dependências Python (fastapi, uvicorn)
│   └── README.md                                 # Guia de execução local e deploy no Render
│
├── mock-omie/                                    # Serviço 2 (Render Root Directory: mock-omie/)
│   ├── app.py                                    # FastAPI v1.1.0 (OpenAPI 3.0.2, 2 endpoints)
│   ├── db_omie.json                              # Banco mockado de despesas variáveis por CPF e período
│   ├── openapi.json                              # Especificação OpenAPI 3.0.2 exportada
│   ├── requirements.txt                          # Dependências Python (fastapi, uvicorn)
│   └── README.md                                 # Guia de execução local e deploy no Render
│
└── scripts/                                      # Scripts utilitários e automações
    └── sync_apis_to_drive.py                     # Script ETL que consome as APIs do Render e gera CSVs em data/
```

> [!IMPORTANT]
> As pastas `mock-solides/`, `mock-omie/` e o arquivo `render.yaml` permanecem na raiz do repositório por exigência direta da configuração de **Root Directory** dos Web Services no Render.

---

## 4. Detalhamento Técnico das APIs Mock (v1.1.0)

### 4.1. API Mock Sólides & Ecossistema People (`mock-solides/`)
- **URL em Produção (Render):** `https://inovanet-mock-solides.onrender.com`
- **Swagger UI:** `https://inovanet-mock-solides.onrender.com/docs`
- **OpenAPI JSON:** `https://inovanet-mock-solides.onrender.com/openapi.json`
- **Endpoints Disponíveis:**
  1. `GET /solides/colaboradores` (`operationId: listar_colaboradores_solides`) — Lista colaboradores com filtros opcionais por `nome` e `departamento`.
  2. `GET /solides/colaboradores/{colaborador_id}` (`operationId: consultar_colaborador_solides`) — Retorna ficha cadastral, salário base, benefícios fixos e CPF (`101` a `104`).
  3. `GET /solides/colaboradores/{colaborador_id}/beneficios-detalhados` (`operationId: consultar_beneficios_detalhados_people`) — Retorna planos SulAmérica, Wellhub, Porto Seguro, Flash Benefícios, Vixting (ASO) e Alura/SENAI.
  4. `GET /solides/integracoes/status` (`operationId: consultar_status_integracoes_people`) — Retorna telemetria, saúde e métricas dos sistemas mapeados em `telemetria_observabilidade.json`.

### 4.2. API Mock Omie Financeiro (`mock-omie/`)
- **URL em Produção (Render):** `https://inovanet-mock-omie.onrender.com`
- **Swagger UI:** `https://inovanet-mock-omie.onrender.com/docs`
- **OpenAPI JSON:** `https://inovanet-mock-omie.onrender.com/openapi.json`
- **Endpoints Disponíveis:**
  1. `GET /omie/despesas?colaborador_cpf={cpf}&periodo={YYYY-MM}` (`operationId: consultar_despesas_omie`) — Normaliza CPF com/sem pontuação, valida formato `YYYY-MM` e retorna lançamentos + soma `total_despesas_variaveis`.
  2. `GET /omie/fechamento-consolidado?colaborador_cpf={cpf}&periodo={YYYY-MM}` (`operationId: consultar_fechamento_consolidado_omie`) — Agrupa automaticamente os gastos por canal (`total_onfly`, `total_flash`, `total_outros`) e por categoria.

### 4.3. Base de Colaboradores Simulados (Consistente entre APIs e CSVs)

| ID | Nome | CPF | Cargo / Departamento | Salário Base | Benefícios Fixos | Despesas Variáveis (`2026-10`) | Custo Total (`2026-10`) |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `101` | Ana Beatriz Souza | `123.456.789-00` | Analista de Dados Sênior (Tecnologia e Dados) | R\$ 8.500,00 | R\$ 1.880,00 | R\$ 1.645,50 *(Onfly + Flash)* | **R\$ 12.025,50** |
| `102` | Carlos Eduardo Lima | `987.654.321-11` | Analista Financeiro Pleno (Financeiro) | R\$ 6.200,00 | R\$ 1.600,00 | R\$ 0,00 *(sem lançamentos)* | **R\$ 7.800,00** |
| `103` | Mariana Ribeiro Costa | `456.789.012-34` | Tech Lead Infra & Cloud (Infraestrutura e TI) | R\$ 12.500,00 | R\$ 2.080,00 | R\$ 3.050,00 *(GCP + Certificação)* | **R\$ 17.630,00** |
| `104` | Rodrigo Silva Santos | `321.654.987-88` | Executivo de Contas Sênior (Comercial) | R\$ 9.000,00 | R\$ 1.780,00 | R\$ 2.810,00 *(Viagem BH + Jantar)* | **R\$ 13.590,00** |

### 4.4. Decisões Técnicas de Compatibilidade
1. **OpenAPI 3.0.2 (`app.openapi_version = "3.0.2"`):** Garante compatibilidade com importadores de schema OpenAPI 3.0 no Google Cloud / Gemini Enterprise.
2. **Detecção Automática de URL Pública (`RENDER_EXTERNAL_URL`):** Ambas as APIs preenchem o bloco `servers` do `openapi.json` automaticamente no Render (com fallback para `NGROK_URL` e `http://localhost:8000`).
3. **Execução Local Simplificada:**
   - Sólides: `py -m uvicorn app:app --reload --port 8001 --app-dir mock-solides`
   - Omie: `py -m uvicorn app:app --reload --port 8002 --app-dir mock-omie`

---

## 5. Arquitetura do Agente no Gemini Enterprise (Workflow com Switch)

O agente **`Agente de Gestão de Custos - Inovanet`** evoluiu de um fluxo linear de 2 nós para uma arquitetura condicional inteligente em **6 especialidades**:

1. **`Manual Trigger`:** Recebe a solicitação em linguagem natural (`solicitacao_usuario`).
2. **`BigQuery - Dados Estáticos e Cadastrais` (`data/bigquery_dados_estaticos.csv`):** Executado sempre primeiro para resolver dados estáticos (`colaborador_id`, `colaborador_cpf`, `cargo`, `departamento`, `centro_custo`, `gestor_direto`). Todos os nós subsequentes leem chaves diretamente deste nó (eliminando acoplamento entre ramos).
3. **`Switch` Condicional (6 Ramos Independentes):**
   - **Ramo 1 (Apenas Cadastro/Estático):** Responde direto usando somente o BigQuery.
   - **Ramo 2 (Folha/Benefícios Fixos):** Aciona apenas `Consulta RH (Sólides)` (`solides_colaboradores.csv`).
   - **Ramo 3 (Despesas/Viagens):** Aciona `Consulta Financeiro (Omie)` (`omie_despesas.csv`) + `Onfly e Flash` (`onfly_flash_despesas.csv`).
   - **Ramo 4 (Ecossistema People):** Aciona apenas `Ecossistema People - Benefícios e Capacitação` (`people_beneficios_capacitacao.csv`).
   - **Ramo 5 (Observabilidade):** Aciona apenas `Observabilidade - Saúde dos Conectores` (`observabilidade_conectores.csv`).
   - **Ramo 6 (`Else` — Consolidação Completa):** Cadeia dedicada (`Sólides` -> `Omie` -> `Onfly/Flash` -> `Consolidação Executiva`) para perguntas de custo total mensal consolidado.

---

## 6. Infraestrutura de Versionamento e Deploy (Dual Remote)

O repositório local opera com **dois remotes configurados** para conciliar governança corporativa e estabilidade de deploy no Render:
- **`origin` (Bitbucket oficial da equipe):** `https://bitbucket.org/2rp-net/pi-i1.git` — autenticado via `credential.helper = store` (API Token Atlassian com usuário `x-bitbucket-api-token-auth`) e `user.email = joao.junior@inovanet.tech`.
- **`github` (Espelho pessoal para deploy no Render):** `https://github.com/JCReis12/mock-apis-solides-omie.git` — autenticado via Windows Credential Manager (`JCReis12`), conectado diretamente aos Web Services `inovanet-mock-solides` e `inovanet-mock-omie` no Render.

Diretrizes de commits e branches estão documentadas em [docs/padrao-commits-e-versionamento.md](padrao-commits-e-versionamento.md).

---

## 7. Status Atual e Próximos Passos

Consulte o checklist completo e atualizado em [docs/ToDo.md](ToDo.md) e o roteiro de validação executiva em [docs/PROMPTS_TESTE_E_DEMONSTRACAO.md](PROMPTS_TESTE_E_DEMONSTRACAO.md).
