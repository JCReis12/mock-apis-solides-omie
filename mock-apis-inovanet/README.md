# Inovanet - Mock APIs (Sólides RH & Omie Financeiro)

API de simulação local para o projeto **Inovanet - Centralização de Ferramentas de RH e Financeiro com Gemini Enterprise**. Expõe endpoints REST para consulta de dados cadastrais/salariais na **Sólides** e despesas variáveis/reembolsos no **Omie**.

---

## 1. Pré-requisitos e Instalação

Certifique-se de ter o **Python 3.9+** instalado. No terminal, dentro da pasta do projeto, instale as dependências necessárias:

```powershell
pip install fastapi uvicorn
```

---

## 2. Como Iniciar o Servidor

Execute o comando abaixo no terminal para iniciar o servidor local com recarregamento automático:

```powershell
uvicorn app:app --reload
```

Por padrão, a API ficará disponível em: `http://127.0.0.1:8000`

---

## 3. Acessando o Swagger e a Documentação Interativa

Com o servidor em execução, acesse no seu navegador:

| Interface | URL | Descrição |
| :--- | :--- | :--- |
| **Swagger UI** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interface interativa para visualizar e testar os endpoints direto pelo navegador. |
| **ReDoc** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Documentação alternativa em formato de leitura. |
| **OpenAPI JSON** | [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json) | Especificação OpenAPI bruta (útil para importar no Postman, Insomnia ou Gemini Enterprise). |

### Como testar pelo Swagger UI (`/docs`):
1. Abra [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
2. Clique no endpoint desejado para expandir seus detalhes.
3. Clique no botão **"Try it out"** (canto superior direito do bloco).
4. Preencha os parâmetros necessários e clique em **"Execute"**.

---

## 4. Endpoints Disponíveis

### 4.1. Consultar Colaborador na Sólides (RH)
Retorna dados cadastrais, salário base e benefícios fixos do colaborador, além do `colaborador_cpf` utilizado para cruzar dados com o Omie.

- **Método:** `GET`
- **Rota:** `/solides/colaboradores/{colaborador_id}`
- **Parâmetro de Rota (`Path`):**
  - `colaborador_id` *(int, obrigatório)*: ID do colaborador na Sólides (`101` ou `102`).

#### Exemplos de Chamada:
- **Navegador / cURL (Colaborador 101 - Ana Beatriz Souza):**
  ```powershell
  curl http://127.0.0.1:8000/solides/colaboradores/101
  ```
- **Navegador / cURL (Colaborador 102 - Carlos Eduardo Lima):**
  ```powershell
  curl http://127.0.0.1:8000/solides/colaboradores/102
  ```

---

### 4.2. Consultar Despesas Variáveis no Omie (Financeiro)
Filtra os lançamentos de despesas variáveis e reembolsos (vindos de integrações como Onfly e Flash) pelo CPF do colaborador e período de competência.

- **Método:** `GET`
- **Rota:** `/omie/despesas`
- **Parâmetros de Consulta (`Query`):**
  - `colaborador_cpf` *(string, obrigatório)*: CPF do colaborador com ou sem pontuação (ex: `123.456.789-00` ou `12345678900`).
  - `periodo` *(string, obrigatório)*: Mês/ano de competência no formato `YYYY-MM` (ex: `2026-10`).

#### Exemplos de Chamada:
- **Com despesas cadastradas (Ana Beatriz em Outubro/2026):**
  ```powershell
  curl "http://127.0.0.1:8000/omie/despesas?colaborador_cpf=123.456.789-00&periodo=2026-10"
  ```
- **Com despesas cadastradas (Ana Beatriz em Setembro/2026):**
  ```powershell
  curl "http://127.0.0.1:8000/omie/despesas?colaborador_cpf=123.456.789-00&periodo=2026-09"
  ```
- **Sem despesas no período (Carlos Eduardo em Outubro/2026):**
  ```powershell
  curl "http://127.0.0.1:8000/omie/despesas?colaborador_cpf=987.654.321-11&periodo=2026-10"
  ```

---

## 5. Resumo da Base de Dados Simulada (Mock Data)

| ID Sólides | Nome | CPF | Cargo | Salário Base | Total Benefícios Fixos | Períodos com Despesas no Omie |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| `101` | Ana Beatriz Souza | `123.456.789-00` | Analista de Dados Sênior | R\$ 8.500,00 | R\$ 1.880,00 | `2026-10` (R\$ 1.645,50)<br>`2026-09` (R\$ 310,00) |
| `102` | Carlos Eduardo Lima | `987.654.321-11` | Analista Financeiro Pleno | R\$ 6.200,00 | R\$ 1.600,00 | *Nenhuma despesa registrada* |

