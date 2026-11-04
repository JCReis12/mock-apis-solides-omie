# Inovanet - Omie Financeiro (Mock API)

API de simulação do **Omie (ERP Financeiro)** para o projeto **Inovanet - Centralização de Ferramentas de RH e Financeiro com Gemini Enterprise**. Expõe o endpoint REST para consulta de despesas variáveis e reembolsos por CPF e período.

---

## 1. Estrutura da Pasta
- `app.py`: Aplicação FastAPI com especificação OpenAPI 3.0.2 compatível com Gemini Enterprise e Render (`RENDER_EXTERNAL_URL`).
- `db_omie.json`: Banco de dados mockado em JSON com os lançamentos de despesas indexados por CPF e período.
- `openapi.json`: Especificação OpenAPI 3.0.2 pronta para importação no Gemini Enterprise.
- `requirements.txt`: Dependências do serviço (`fastapi`, `uvicorn`).

---

## 2. Configuração no Render (UI)
- **Root Directory:** `mock-omie`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

---

## 3. Execução Local
```powershell
pip install -r requirements.txt
uvicorn app:app --reload --port 8002
```
- **Swagger UI:** `http://127.0.0.1:8002/docs`
- **OpenAPI JSON:** `http://127.0.0.1:8002/openapi.json`
