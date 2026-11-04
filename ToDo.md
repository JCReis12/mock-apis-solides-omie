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

## 🔗 Fase 2: Persistência Mockada e Integração
- [x] Separar os serviços em projetos independentes (`mock-solides` e `mock-omie`) para deploy no **Render**
- [x] Criar banco de dados mockado simples para **OMIE** (`db_omie.json`, separado do código)
- [x] Criar banco de dados mockado simples para **Sólides** (`db_solides.json`, separado do código)
- [ ] Realizar deploy dos dois serviços na UI do **Render**
- [ ] Conectar os dois endpoints (Tools OpenAPI) ao agente no **Gemini Enterprise**
- [ ] Testar chamadas dos endpoints integrados ponta a ponta

---

## 🚀 Fase 3: Enriquecimento e Refinamento do Agente
- [ ] Enriquecer os bancos de dados com cenários mais completos
- [ ] Criar prompts padrão para chamadas específicas
- [ ] Realizar bateria de testes das chamadas enriquecidas

---

## 🖥️ Fase 4: Apresentação, Gestão e Próximos Passos
- [ ] Criar front-end de apresentação do projeto
- [ ] Criar e movimentar os cards de acompanhamento do projeto (Kanban)
- [ ] Questionar/alinhar sobre a subida de dados falsos no **BigQuery (BQ)** para testes
