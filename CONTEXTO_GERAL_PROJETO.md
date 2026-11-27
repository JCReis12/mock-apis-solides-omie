# 📘 Contexto Geral do Projeto — Inovanet: Centralização e Gestão de Custos (PI)

---

## 1. Visão Geral e Problema de Negócio

O projeto **Inovanet — Centralização de Ferramentas de RH e Financeiro com Gemini Enterprise** tem como objetivo resolver a fragmentação de dados operacionais, cadastrais e financeiros relacionados aos colaboradores e fornecedores da empresa.

Atualmente, as informações que compõem o **custo real de cada colaborador** e das operações de infraestrutura/pessoas estão distribuídas em múltiplos sistemas independentes, exigindo cadastros manuais repetitivos e cruzamentos manuais em planilhas:

1. **Módulo People / RH (Conector Central: Sólides):**
   - Concentra dados cadastrais do colaborador, cargo, departamento, status contratual, data de admissão, salário base e benefícios fixos (Flash Benefícios, SulAmérica Saúde, Wellhub/Gympass, Clude, Porto Seguro Vida, Vixting SST/Onboarding, Alura, SENAI, Auxílio Home Office).
2. **Módulo Financeiro / ERP (Conector Central: Omie):**
   - Concentra o contas a pagar, conciliação bancária (Santander, Safra, Bradesco), notas fiscais (NFS-e), contabilidade (Contabil Plus 10) e, principalmente, **despesas variáveis e reembolsos de colaboradores** originados em plataformas como **Onfly (Viagens e Hospedagens)** e **Flash (Gestão de Despesas)**.
3. **Módulo de Infraestrutura, Fornecedores e Operações (GLPI, Grafana/Prometheus, Entra ID, SharePoint):**
   - Concentra chamados técnicos, inventário de ativos e licenças (GLPI / OCS Inventory), monitoramento de recursos (Grafana / Prometheus), gestão de identidades (Entra ID / AD) e backups documentais (SharePoint / Autentique).

### Objetivo da Solução
Construir uma arquitetura centralizada de integração e consulta inteligente baseada em **APIs REST**, **Pipelines de Sincronização de Dados** e um **Agente Orquestrador no Google Cloud Gemini Enterprise (Workflow Builder)** capaz de:
- Consultar dados de RH na **Sólides** e dados financeiros no **Omie**;
- Cruzar automaticamente os registros entre os sistemas utilizando o **CPF do colaborador (`colaborador_cpf`)** como chave única de integração;
- Consolidar, em linguagem natural via chat, o **Custo Mensal Total por Colaborador** ($\text{Salário Base} + \text{Benefícios Fixos} + \text{Despesas Variáveis e Reembolsos}$).

---

## 2. Arquitetura da Solução

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CAMADA 1: SISTEMAS E MOCK APIs                        │
│                                                                              │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │   API Mock Sólides RH (FastAPI)    │  │ API Mock Omie ERP (FastAPI)    │  │
│  │   Banco: mock-solides/db_solides   │  │ Banco: mock-omie/db_omie       │  │
│  │   Deploy: Render (Web Service 1)   │  │ Deploy: Render (Web Service 2) │  │
│  └─────────────────┬──────────────────┘  └────────────────┬───────────────┘  │
└────────────────────┼──────────────────────────────────────┼──────────────────┘
                     │ GET /solides/colaboradores/{id}      │ GET /omie/despesas
                     ▼                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 CAMADA 2: INGESTÃO E PERSISTÊNCIA ANALÍTICA                  │
│                                                                              │
│         Script de Sincronização (sync_apis_to_drive.py / ETL)                │
│                                    │                                         │
│                                    ▼                                         │
│      Fontes de Conhecimento (CSV / Google Drive / Google Cloud BigQuery)      │
│         • solides_colaboradores.csv       • omie_despesas.csv                │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│              CAMADA 3: ORQUESTRAÇÃO IA (GEMINI ENTERPRISE)                   │
│                                                                              │
│   [Manual Trigger: solicitacao_usuario (Prompt em Linguagem Natural)]        │
│                                    │                                         │
│                                    ▼                                         │
│   [Nó 1: Consulta RH (Sólides)] ──► Extrai Salário, Benefícios e CPF         │
│                                    │                                         │
│                                    ▼                                         │
│   [Nó 2: Consulta Financeiro (Omie) e Consolidação]                          │
│          ──► Filtra Despesas por CPF + Período (YYYY-MM)                     │
│          ──► Calcula Custo Mensal Consolidado e gera Relatório               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura do Repositório (`pi-i1`)

```text
pi-i1/
├── docs/                                         # Documentação de negócio e mapeamentos de arquitetura
│   ├── anotacoes_reuniao_inicial.md              # Ata de priorização de demandas (RH, Saúde, Educação, Infra)
│   ├── lista_ferramentas.md                      # Catálogo geral de ferramentas conectadas ao Omie, Sólides e Infra
│   ├── img_fluxo/                                # Diagramas visuais do ecossistema (Financeiro, RH Sólides, Externos)
│   └── mapeamentos/                              # Estudos técnicos profundos de integração por vertical
│       ├── mapeamento_conexao_infra/             # Relatórios de integração GLPI, Grafana e Fornecedores de TI
│       ├── mapeamento_conexao_omie/              # Relatório técnico de integrações financeiras com o ERP Omie
│       └── mapeamento_conexao_solides/           # Arquitetura do Integration Hub, Webhooks e APIs da Sólides
│
├── mock-solides/                                 # Serviço 1: API Mock da Sólides (RH)
│   ├── app.py                                    # Aplicação FastAPI (OpenAPI 3.0.2)
│   ├── db_solides.json                           # Banco de dados mockado de colaboradores e benefícios fixos
│   ├── openapi.json                              # Especificação OpenAPI 3.0.2 do serviço Sólides
│   ├── requirements.txt                          # Dependências Python (fastapi, uvicorn)
│   └── README.md                                 # Guia de execução local e deploy no Render
│
├── mock-omie/                                    # Serviço 2: API Mock do Omie (Financeiro)
│   ├── app.py                                    # Aplicação FastAPI (OpenAPI 3.0.2)
│   ├── db_omie.json                              # Banco de dados mockado de despesas variáveis por CPF e período
│   ├── openapi.json                              # Especificação OpenAPI 3.0.2 do serviço Omie
│   ├── requirements.txt                          # Dependências Python (fastapi, uvicorn)
│   └── README.md                                 # Guia de execução local e deploy no Render
│
├── exports_drive/                                # Bases sincronizadas a partir das APIs para consumo do Agente
│   ├── solides_colaboradores.csv                 # Tabela consolidada de colaboradores e custos fixos (Sólides)
│   └── omie_despesas.csv                         # Tabela consolidada de lançamentos variáveis (Omie)
│
├── sync_apis_to_drive.py                         # Script ETL que consome as APIs no Render e gera os CSVs
├── padrao-commits-e-versionamento.md             # Guia obrigatório de Git Flow, branches e Conventional Commits
├── CONTEXTO_GERAL_PROJETO.md                     # Este documento de visão 360º do projeto
└── ToDo.md                                       # Roadmap e controle de tarefas dividido em 4 fases
```

---

## 4. Detalhamento Técnico dos Componentes Implementados

### 4.1. API Mock Sólides (`mock-solides/`)
- **URL em Produção (Render):** `https://inovanet-mock-solides.onrender.com`
- **Swagger UI:** `https://inovanet-mock-solides.onrender.com/docs`
- **Endpoint Principal:** `GET /solides/colaboradores/{colaborador_id}` (`operationId: consultar_colaborador_solides`)
- **Persistência:** Lê dinamicamente o arquivo `mock-solides/db_solides.json`.
- **Dados Retornados:**
  - Identificação: `colaborador_id`, `nome`, `colaborador_cpf` (chave de cruzamento), `cargo`, `departamento`, `status`, `data_admissao`.
  - Custos Fixos: `salario_base`, `beneficios_fixos` (`vale_refeicao_alimentacao`, `plano_saude_sulamerica`, `wellhub_gympass`, `auxilio_home_office`) e `total_beneficios_fixos`.

### 4.2. API Mock Omie (`mock-omie/`)
- **URL em Produção (Render):** `https://inovanet-mock-omie.onrender.com`
- **Swagger UI:** `https://inovanet-mock-omie.onrender.com/docs`
- **Endpoint Principal:** `GET /omie/despesas?colaborador_cpf={cpf}&periodo={YYYY-MM}` (`operationId: consultar_despesas_omie`)
- **Persistência:** Lê dinamicamente o arquivo `mock-omie/db_omie.json`.
- **Regras de Negócio na API:**
  - Normaliza automaticamente o CPF recebido (`re.sub(r"\D", "", cpf)`), aceitando buscas com ou sem pontuação (`123.456.789-00` ou `12345678900`).
  - Valida se o CPF possui 11 dígitos e se o período segue a máscara `YYYY-MM`.
  - Calcula em tempo de execução a quantidade de lançamentos e a soma `total_despesas_variaveis`.

### 4.3. Decisões Técnicas de Compatibilidade (FastAPI + Render + Gemini Enterprise)
1. **OpenAPI 3.0.2 (`app.openapi_version = "3.0.2"`):** Definido como atributo da instância `FastAPI` para garantir compatibilidade tanto com versões recentes do FastAPI no Python 3.14 do Render quanto com importadores de schema OpenAPI 3.0 do Google Cloud.
2. **Detecção Automática de URL Pública (`RENDER_EXTERNAL_URL`):** Ambas as APIs leem automaticamente a variável de ambiente injetada pelo Render para preencher o bloco `servers` do `openapi.json`.
3. **Modelos Pydantic sem `anyOf/null`:** Evitou-se o uso de `Optional[str]` que gera construtos `anyOf` do OpenAPI 3.1, utilizando valores default explícitos (`default=""`).

---

## 5. Configuração e Funcionamento do Agente no Gemini Enterprise

O agente **`Agente de Gestão de Custos - Inovanet`** foi construído no **Gemini Enterprise Workflow Builder** utilizando uma arquitetura em múltiplos nós:

1. **Gatilho (`Manual Trigger`):**
   - Configurado com entrada única em linguagem natural (`solicitacao_usuario`), permitindo que o usuário converse livremente no chat (ex: *"Qual foi o custo consolidado da colaboradora de ID 101 no período 2026-10?"*).
2. **Nó 1 — `Consulta RH (Sólides)`:**
   - Interpreta o prompt do usuário para identificar o colaborador (`colaborador_id` ou nome) e o `periodo` (`YYYY-MM`).
   - Consulta a fonte de dados `solides_colaboradores.csv`, extraindo os custos fixos mensais e descobrindo o `colaborador_cpf`.
3. **Nó 2 — `Consulta Financeiro (Omie) e Consolidação`:**
   - Recebe os dados do Nó 1 (incluindo o `colaborador_cpf` e o `periodo`).
   - Consulta a fonte de dados `omie_despesas.csv`, filtrando todas as despesas variáveis e reembolsos (Onfly, Flash) daquele CPF no mês.
   - Calcula o **Custo Mensal Consolidado** e responde ao usuário com o demonstrativo completo.

### Caso de Teste Validado Ponta a Ponta
- **Entrada:** Colaboradora ID `101` (**Ana Beatriz Souza**), Período `2026-10`.
- **Retorno Sólides (Fixo):**
  - Salário Base: `R$ 8.500,00`
  - Benefícios Fixos: `R$ 1.880,00` (VR/VA R\$ 880 + SulAmérica R\$ 650 + Wellhub R\$ 150 + Home Office R\$ 200)
  - Subtotal Fixo: `R$ 10.380,00`
- **Retorno Omie (Variável em `2026-10` para CPF `123.456.789-00`):**
  - `OMIE-202610-001` (Onfly - Viagens Corporativas): `R$ 940,50`
  - `OMIE-202610-002` (Flash - Reembolso de Despesas): `R$ 285,00`
  - `OMIE-202610-003` (Onfly - Hospedagem): `R$ 420,00`
  - Subtotal Variável: `R$ 1.645,50`
- **Custo Total Consolidado Validado pelo Agente:** **`R$ 12.025,50`**

---

## 6. Padrão de Versionamento e Fluxo de Trabalho (Git)

Todo o desenvolvimento segue as diretrizes documentadas em `padrao-commits-e-versionamento.md`:
- **Formato obrigatório de commit:** `tipo: descrição` (sem escopo, em português, iniciando com letra minúscula e substantivo nominalizado — ex: `feat: criação da api mock da sólides`, `docs: adição do contexto geral do projeto`).
- **Granularidade:** Cada commit representa uma única alteração lógica.
- **Branches:** Criadas a partir da `develop` seguindo o padrão `feature/nome_da_tarefa[CODIGO_CARD_GLPI]`.

---

## 7. Roadmap e Próximos Passos

### ✅ Concluído (Fases 1 e 2)
- Mapeamento completo das ferramentas e integrações de RH (Sólides), Financeiro (Omie) e Infraestrutura (GLPI/Grafana).
- Criação e separação das APIs Mock em projetos independentes (`mock-solides` e `mock-omie`) com bancos de dados JSON desacoplados do código (`db_solides.json` e `db_omie.json`).
- Deploy dos 2 serviços na nuvem via **Render**.
- Criação do pipeline de extração (`sync_apis_to_drive.py`) e geração dos arquivos de dados em `exports_drive/`.
- Construção e validação ponta a ponta do workflow multi-step no **Gemini Enterprise**.

### 🔜 Próximas Etapas (Fases 3 e 4)
1. **Enriquecimento das Bases Mockadas (Fase 3):**
   - Expandir `db_solides.json` e `db_omie.json` com novos colaboradores, múltiplos departamentos (TI, Financeiro, Operações, RH), diferentes status contratuais e novos períodos/categorias de despesas.
   - Criar catálogo de **Prompts Padrão** para demonstração de diferentes cenários analíticos no Agente.
2. **Integração com BigQuery e Apresentação Final (Fase 4):**
   - Alinhar com a equipe de infraestrutura a liberação de dataset no **Google Cloud BigQuery** para conectar o Agente diretamente às tabelas analíticas, mantendo o suporte às Knowledge Sources.
   - Desenvolver o front-end de apresentação do projeto e atualizar os cards do Kanban.
