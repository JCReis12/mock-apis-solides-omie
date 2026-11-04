# Inovanet - Sólides RH (Mock API)

API de simulação da **Sólides (RH)** para o projeto **Inovanet - Centralização de Ferramentas de RH e Financeiro com Gemini Enterprise**. Expõe o endpoint REST para consulta de dados cadastrais, salário base, benefícios fixos e CPF do colaborador.

---

## 1. Estrutura da Pasta
- `app.py`: Aplicação FastAPI com especificação OpenAPI 3.0.2 compatível com Gemini Enterprise e Render (`RENDER_EXTERNAL_URL`).
- `db_solides.json`: Banco de dados mockado em JSON com os registros dos colaboradores.
- `openapi.json`: Especificação OpenAPI 3.0.2 pronta para importação no Gemini Enterprise.
- `requirements.txt`: Dependências do serviço (`fastapi`, `uvicorn`).

---

## 2. Configuração no Render (UI)
- **Root Directory:** `mock-solides`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

---

## 3. Execução Local
```powershell
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```
- **Swagger UI:** `http://127.0.0.1:8001/docs`
- **OpenAPI JSON:** `http://127.0.0.1:8001/openapi.json`
