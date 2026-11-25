# 📋 To-Do List — Gestão de Custos (PI)

---

## 🏁 Fase 1: Levantamento e Prototipagem Inicial
- [x] Levantar quais são os tipos de dados de cada ferramenta (OMIE e Sólides)
- [x] Levantar quais são os destinos recomendados para cada dado
- [x] Criar endpoint falso (mock) para **OMIE**
- [x] Criar endpoint falso (mock) para **Sólides**
- [x] Configurar visualização e documentação no **Swagger**
- [x] Criar agente de *workflow* inicial (cru)

---

## 🔗 Fase 2: Persistência Mockada e Modularização
- [x] Separar os serviços em projetos independentes (`mock-solides` e `mock-omie`) para deploy no **Render**
- [x] Criar banco de dados mockado simples para **OMIE** (`db_omie.json`, desacoplado do código)
- [x] Criar banco de dados mockado simples para **Sólides** (`db_solides.json`, desacoplado do código)
- [x] Configurar suporte nativo à variável `RENDER_EXTERNAL_URL` nas duas APIs
- [x] Gerar especificações `openapi.json` compatíveis com **OpenAPI 3.0.2** (exigência do Vertex AI / Gemini Enterprise)

---

## 🚀 Fase 3: Enriquecimento, Novos Nós do Agente e Observabilidade
- [x] Integrar base de telemetria dos conectores (`telemetria_observabilidade.json`) com 12+ sistemas mapeados (Sólides, Omie, Flash, Onfly, SulAmérica, Wellhub, Vixting, SharePoint, Porto Seguro, etc.)
- [x] Adicionar novos colaboradores de áreas estratégicas (Infra & TI, Comercial, Financeiro, Dados) nos bancos `db_solides.json` e `db_omie.json`
- [x] Implementar novos endpoints no `mock-solides`:
  - `GET /solides/colaboradores` (Busca e filtro por nome ou departamento)
  - `GET /solides/colaboradores/{id}/beneficios-detalhados` (Plano de saúde, seguro de vida, Wellhub, Alura, SST)
  - `GET /solides/integracoes/status` (Telemetria, saúde de conectores e disponibilidade)
- [x] Implementar novo endpoint no `mock-omie`:
  - `GET /omie/fechamento-consolidado` (Agrupamento automático Onfly vs Flash vs Direto)
- [x] Atualizar guia de prompts para demonstração (`docs/PROMPTS_TESTE_E_DEMONSTRACAO.md`) com 7 cenários práticos
- [ ] Subir as duas APIs no **Render** (via repositório ou web service)
- [ ] Conectar os dois endpoints no **Gemini Enterprise** (Vertex AI Agent Builder) e validar execução dos novos nós

---

## 🖥️ Fase 4: Apresentação, Gestão e Próximos Passos
- [ ] Criar front-end de apresentação do projeto
- [ ] Criar e movimentar os cards de acompanhamento do projeto (Kanban)
- [ ] Questionar/alinhar sobre a subida de dados simulados no **BigQuery (BQ)** para testes analíticos
