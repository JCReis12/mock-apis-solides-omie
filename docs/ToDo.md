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

## 🔗 Fase 2: Persistência Mockada, Modularização e Deploy
- [x] Separar os serviços em projetos independentes (`mock-solides` e `mock-omie`) para deploy no **Render**
- [x] Criar banco de dados mockado simples para **OMIE** (`db_omie.json`, desacoplado do código)
- [x] Criar banco de dados mockado simples para **Sólides** (`db_solides.json`, desacoplado do código)
- [x] Configurar suporte nativo à variável `RENDER_EXTERNAL_URL` nas duas APIs e criar `render.yaml`
- [x] Gerar especificações `openapi.json` compatíveis com **OpenAPI 3.0.2** (exigência do Vertex AI / Gemini Enterprise)
- [x] Configurar espelho no GitHub (`JCReis12/mock-apis-solides-omie`) e realizar deploy da v1.1.0 dos dois serviços no **Render**

---

## 🚀 Fase 3: Enriquecimento, Switch no Agente e Observabilidade
- [x] Integrar base de telemetria dos conectores (`telemetria_observabilidade.json`) com 14 sistemas mapeados (Sólides, Omie, Flash, Onfly, SulAmérica, Wellhub, Vixting, SharePoint, Porto Seguro, etc.)
- [x] Adicionar novos colaboradores de áreas estratégicas (Infra & TI, Comercial, Financeiro, Dados) nos bancos `db_solides.json` e `db_omie.json`
- [x] Implementar novos endpoints no `mock-solides` (`GET /solides/colaboradores`, `GET /solides/colaboradores/{id}/beneficios-detalhados`, `GET /solides/integracoes/status`)
- [x] Implementar novo endpoint no `mock-omie` (`GET /omie/fechamento-consolidado`)
- [x] Gerar os 6 arquivos `.csv` estruturados por domínio na pasta `data/` (incluindo simulação BigQuery para dados estáticos)
- [x] Evoluir o workflow no **Gemini Enterprise** para arquitetura com **BigQuery -> Switch condicional -> 6 ramos independentes**
- [x] Atualizar guia de prompts para demonstração (`docs/PROMPTS_TESTE_E_DEMONSTRACAO.md`) com 7 cenários práticos
- [x] Reorganizar estrutura de pastas do repositório (`docs/`, `data/`, `scripts/`, `README.md`) e atualizar `docs/CONTEXTO_GERAL_PROJETO.md`
- [ ] Executar bateria completa de validação dos 7 prompts em todos os ramos do Switch no **Gemini Enterprise**

---

## 🖥️ Fase 4: Apresentação, Gestão e Próximos Passos
- [ ] Integrar/evoluir o front-end de apresentação do projeto (branch `migration/frontend-gestao-de-custos`)
- [ ] Criar e movimentar os cards de acompanhamento do projeto (Kanban / GLPI)
- [ ] Alinhar subida definitiva dos datasets simulados (`data/*.csv`) no **Google Cloud BigQuery (BQ)** real para testes analíticos
