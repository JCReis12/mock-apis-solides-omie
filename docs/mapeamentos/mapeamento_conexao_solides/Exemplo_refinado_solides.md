# Exemplo prático — Integração Sólides ↔ Flash

**Versão para apresentação**  
**Objetivo:** demonstrar uma integração implementável usando as interfaces oficiais das duas plataformas.

---

## 1. Cenário

A Sólides centraliza o cadastro do colaborador e a Flash gerencia benefícios.

Quando um colaborador é criado, alterado ou desligado, o evento pode ser tratado por uma API intermediária.

```text
SÓLIDES / PEOPLE
      |
      | Webhook
      v
INTEGRATION API
      |
      | REST + API Key
      v
FLASH
```

A Sólides documenta **API REST + Token + Webhooks**. A Flash documenta **API REST + API Key** para seus recursos de colaboradores e benefícios.

**Fontes:** [Sólides API Docs](https://gestaoapidocs.solides.com.br/) · [Flash API Docs](https://docs.api.flashapp.services/)

---

# 2. Fluxo completo

```text
1. RH cadastra colaborador na Sólides
                |
                v
2. Sólides envia novo_colaborador
                |
                v
3. Integration API recebe o evento
                |
                v
4. Valida e verifica duplicidade
                |
                v
5. Localiza/cria vínculo Sólides -> Flash
                |
                v
6. Chama a API da Flash
                |
                v
7. Salva ID, status e resultado
```

Nos eventos de alteração e desligamento, o mesmo padrão é utilizado:

```text
edicao_colaborador  -> atualizar o que for necessário

demissao_colaborador -> inativar/encerrar conforme regra da Flash
```

A operação comercial exata de desligamento deve ser validada no produto Flash utilizado.

---

# 3. Dados do evento

Exemplo simplificado para mostrar o conceito:

```json
{
  "acao": "novo_colaborador",
  "dados": {
    "id": 12543,
    "nome": "Maria Silva",
    "email": "maria@empresa.com.br",
    "matricula": "MAT-9842",
    "cpf": "12345678901",
    "data_admissao": "30/09/2026",
    "departamento": "Recursos Humanos",
    "cargo": "Analista de RH",
    "ativo": true
  }
}
```

Esse payload é **didático**. Em produção, deve ser usado exatamente o schema fornecido pela Sólides para o webhook configurado.

---

# 4. Quais dados são usados

```text
Sólides
  |
  +-- id -------------> ID interno do colaborador
  +-- nome -----------> nome
  +-- CPF ------------> identificação
  +-- matrícula ------> referência empresarial
  +-- status ----------> controle de ativo/inativo
  +-- benefício ------> benefício a movimentar
  +-- valor ----------> valor do benefício
```

A regra deve ser **enviar somente os campos necessários** ao fluxo de benefícios.

---

# 5. Chamada para a Flash

A Flash documenta a autenticação da API de benefícios por:

```http
x-flash-auth: SUA_API_KEY
Content-Type: application/json
```

Um exemplo documentado de dados de benefício usa campos como:

```json
{
  "employeeId": "FL-87321",
  "employeeName": "Maria Silva",
  "employeeDocument": "12345678901",
  "benefitId": "VR",
  "benefitName": "Vale Refeição",
  "amount": 95000
}
```

Quando o endpoint trabalha com centavos, `95000` corresponde a **R$ 950,00**.

**Fonte:** [Flash — API de Benefícios](https://docs.api.flashapp.services/api/beneficios)

---

# 6. Mapeamento

| Sólides | Hub | Flash | Uso |
|---|---|---|---|
| `id` | `solides_employee_id` | `employeeId` | Identificação |
| `nome` | `name` | `employeeName` | Nome |
| `cpf` | `document` | `employeeDocument` | Documento |
| `matricula` | `registration` | referência externa | Reconciliação |
| benefício | `benefit_id` | `benefitId` | Benefício |
| valor | `amount_cents` | `amount` | Valor |

**Importante:** o ID da Sólides não precisa ser igual ao ID da Flash. Os dois devem ser armazenados.

---

# 7. Banco de integração

O banco não precisa replicar toda a base de RH. Ele deve manter o necessário para identificar e controlar a integração.

```sql
CREATE TABLE integration_identity (
    id BIGSERIAL PRIMARY KEY,
    solides_employee_id BIGINT NOT NULL,
    external_system VARCHAR(50) NOT NULL,
    external_employee_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (solides_employee_id, external_system)
);

CREATE TABLE integration_execution (
    id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(40) NOT NULL,
    event_id VARCHAR(120),
    correlation_id VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL,
    attempt INTEGER NOT NULL DEFAULT 1,
    error_code VARCHAR(80),
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Exemplo

| Sólides | Sistema | ID externo | Status |
|---:|---|---|---|
| 12543 | FLASH | FL-87321 | SINCRONIZADO |
| 12544 | FLASH | FL-87322 | ERRO |

---

# 8. API intermediária

```python
from fastapi import FastAPI, Request, HTTPException
import uuid

app = FastAPI()

@app.post("/webhooks/solides")
async def solides_webhook(request: Request):
    payload = await request.json()

    evento = payload.get("acao")
    dados = payload.get("dados", {})
    employee_id = dados.get("id")

    if not evento or not employee_id:
        raise HTTPException(400, "Evento ou colaborador ausente")

    correlation_id = str(uuid.uuid4())

    # Produção:
    # - verificar event_id já processado;
    # - salvar a execução;
    # - enviar para fila/worker;
    # - processar a Flash em background.

    return {
        "accepted": True,
        "correlationId": correlation_id
    }
```

A API intermediária deve separar **recepção do webhook** e **processamento da Flash**. Assim, um problema temporário na Flash não derruba o recebimento do evento.

---

# 9. Cliente da Flash

```python
import os
import requests

FLASH_API_KEY = os.environ["FLASH_API_KEY"]


def enviar_beneficio(payload):
    response = requests.post(
        "URL_DO_ENDPOINT_FLASH",
        headers={
            "x-flash-auth": FLASH_API_KEY,
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=30
    )

    response.raise_for_status()
    return response.json()
```

A URL exata deve ser a do recurso Flash contratado; não deve ser inventada a partir deste exemplo.

---

# 10. Idempotência

O mesmo webhook pode chegar novamente. O Hub deve reconhecer o evento e evitar duplicidade.

```text
Evento EVT-123
    |
    +--> primeira chegada -> processa
    |
    +--> segunda chegada -> reconhece como já processado
```

A tabela de execução pode impor uma chave única para o evento e o sistema de destino.

```text
UNIQUE(event_id, external_system)
```

---

# 11. Retry

Erros temporários não devem virar perda de dados.

```text
Falha Flash
     |
     v
retry 1
     |
  falhou
     |
     v
retry 2
     |
  falhou
     |
     v
retry 3
     |
     v
fila de exceção
```

Uma regra simples:

| Erro | Tratamento |
|---|---|
| `400` | corrigir payload/regra |
| `401/403` | validar credencial/permissão |
| `404` | validar recurso/ID |
| `409` | tratar conflito/idempotência |
| `429` | backoff e retry |
| `5xx` | retry |
| timeout | retry controlado |

---

# 12. Reconciliação

Webhook e reconciliação podem trabalhar juntos.

```text
          WEBHOOK
             |
             v
        sincronização
             |
             v
          Banco Hub
             ^
             |
       reconciliação
             |
             v
       API Sólides
```

Exemplo:

```text
Sólides = 100 colaboradores
Hub     = 100 eventos
Flash   = 99 registros
```

A reconciliação identifica a diferença e reprocessa o colaborador ausente.

---

# 13. Segurança

```text
Secret Manager / ENV
        |
        +-- SOLIDES_TOKEN
        +-- FLASH_API_KEY
```

Boas práticas:

- HTTPS;
- nunca colocar secrets no Git;
- menor privilégio;
- rotação de credenciais;
- mascarar tokens nos logs;
- registrar apenas os dados necessários;
- controlar acesso ao banco.

---

# 14. Fluxo para apresentação

```text
             SÓLIDES
                 |
       novo_colaborador
                 |
                 v
          Webhook HTTPS
                 |
                 v
        +------------------+
        | Integration API  |
        +--------+---------+
                 |
           valida / deduplica
                 |
                 v
             Banco/Fila
                 |
                 v
            Flash Adapter
                 |
              API Key
                 |
                 v
               FLASH
                 |
                 v
          ID + status + erro
                 |
                 v
             Banco Hub
```

### Ideia principal

**A Sólides gera o evento. O Hub transforma e controla. A Flash executa a operação. O banco guarda os vínculos e o resultado.**

---

# 15. O que precisa ser definido antes da produção

- endpoint Flash exato;
- catálogo/IDs dos benefícios;
- regras de inclusão, alteração e desligamento;
- limites de requisições;
- ambiente de homologação;
- schema definitivo dos Webhooks da Sólides;
- retenção dos dados;
- Secret Manager da empresa.

---

# 16. Fontes

- **Sólides API Docs:** https://gestaoapidocs.solides.com.br/
- **Flash API:** https://docs.api.flashapp.services/
- **Flash — Benefícios:** https://docs.api.flashapp.services/api/beneficios
