PESQUISA TÉCNICA

# Exemplo prático de integração Sólides ↔ Flash

API intermediária com FastAPI, Webhook, API REST, persistência, idempotência e reconciliação

> **Sólides / HR Tech Platform (People) como conector central**

Objetivo: mostrar uma integração implementável, e não apenas conceitual

Fonte central: Sólides / People

Destino: Flash Benefits

Stack do exemplo: Python + FastAPI + requests/httpx + PostgreSQL (esqueleto) + Secret Manager

# 1. O que este exemplo demonstra

O exemplo cria uma API intermediária chamada Integration API. Ela recebe eventos da Sólides, identifica o colaborador, consulta/resolve o vínculo externo com a Flash, transforma o payload e chama a API da Flash. O banco não guarda segredos; guarda IDs, status, tentativas e correlação. Para eventos críticos, existe reconciliação periódica para recuperar divergências.

> **Importante**
>
> A documentação da Sólides e da Flash confirma os mecanismos gerais usados neste exemplo. O código abaixo é uma implementação de referência criada para demonstrar arquitetura e boas práticas; as URLs/fields exatos do endpoint de cadastro de colaborador da conta Flash devem ser validados na documentação/contrato atual antes de produção.

# 2. Arquitetura

```text
+------------------+
                         |      SÓLIDES      |
                         |   HR / PEOPLE     |
                         +---------+----------+
                                   |
                           POST webhook
                                   |
                                   v
                    +--------------+---------------+
                    |       INTEGRATION API        |
                    |                               |
                    | FastAPI                      |
                    | - valida evento              |
                    | - deduplica                  |
                    | - resolve external IDs       |
                    | - transforma payload         |
                    | - grava status               |
                    | - chama Flash                |
                    +---------------+---------------+
                                    |
                           x-flash-auth
                                    |
                                    v
                         +----------+---------+
                         |       FLASH        |
                         | Benefits API      |
                         +--------------------+

Reconciliation (cron)
Sólides API -> Integration API -> comparar estado -> corrigir divergências
```

# 3. Fluxo detalhado de admissão

1. Um colaborador é criado na Sólides.

2. A Sólides publica o evento novo_colaborador para a URL cadastrada.

3. A Integration API recebe o JSON via HTTPS.

4. O serviço valida o evento e gera/usa um correlation_id.

5. O serviço consulta o mapping de IDs. Se o colaborador já estiver vinculado à Flash, usa o flash_employee_id existente; se não estiver, executa o fluxo de provisionamento previsto no contrato da Flash.

6. O adapter Flash monta a requisição no formato esperado pela API.

7. Se houver um benefício a creditar, o adapter usa a API de pedidos/depósitos documentada pela Flash.

8. O Hub persiste o resultado, sem salvar a API Key.

9. A resposta HTTP para a Sólides é rápida; o processamento pesado pode ocorrer por fila assíncrona.

## 4. Payload de exemplo do evento Sólides

Exemplo simplificado. O payload real deve seguir o schema entregue pela Sólides ao configurar o webhook.

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

# 5. Estrutura de banco

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
    identity_id BIGINT,
    operation VARCHAR(40) NOT NULL,
    direction VARCHAR(40) NOT NULL,
    event_id VARCHAR(120),
    correlation_id VARCHAR(120) NOT NULL,
    request_id VARCHAR(120),
    status VARCHAR(30) NOT NULL,
    attempt INTEGER NOT NULL DEFAULT 1,
    last_attempt_at TIMESTAMP NOT NULL DEFAULT NOW(),
    error_code VARCHAR(80),
    error_message TEXT
);

CREATE INDEX ix_exec_event
  ON integration_execution(event_id);
```

A constraint UNIQUE em (solides_employee_id, external_system) é uma proteção adicional contra duplicação de vínculo. Em produção, também pode ser criada uma chave única para eventos processados ou uma tabela de inbox/outbox.

# 6. Configuração de segredos

```bash
# .env apenas para desenvolvimento local; não versionar
SOLIDES_TOKEN=***
FLASH_API_KEY=***

# Em produção:
# Secret Manager / Vault / AWS Secrets Manager / Azure Key Vault
```

O aplicativo lê uma referência segura, não imprime o segredo.

A Sólides usa autenticação por token na API documentada; a Flash usa chave no header `x-flash-auth`. As credenciais são independentes e devem ser tratadas como secrets diferentes.

# 7. Cliente HTTP para Sólides

Cliente de referência para reconciliação. Validar a forma exata do token/endpoint no tenant e documentação vigente da Sólides antes de produção.

```python
import httpx

class SolidesClient:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://app.solides.com/pt-BR/api/v1"

    async def list_collaborators(self, page: int = 1, page_size: int = 100):
        headers = {
            "Authorization": f"Token token={self.token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        params = {"page": page, "page_size": page_size}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self.base_url}/colaboradores",
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            return response.json()
```

# 8. Cliente HTTP para Flash

Endpoint e campos do depósito são documentados pela Flash; order_id e IDs de negócio precisam existir no fluxo da conta.

```python
import httpx

class FlashClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.flashapp.services"

    async def add_benefit_deposit(
        self, order_id: str, employee_id: str, employee_name: str,
        employee_document: str, benefit_id: str,
        benefit_name: str, amount_cents: int
    ):
        headers = {
            "x-flash-auth": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "employeeId": employee_id,
            "employeeName": employee_name,
            "employeeDocument": employee_document,
            "benefitId": benefit_id,
            "benefitName": benefit_name,
            "amount": amount_cents,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/benefits/v1/orders/{order_id}/deposits",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()
```

# 9. Endpoint FastAPI para receber o webhook

Padrão recomendado: o endpoint de webhook valida e enfileira; o worker executa chamadas externas.

```json
from fastapi import FastAPI, Request, HTTPException
import uuid

app = FastAPI(title="Integration API")

@app.post("/webhooks/solides")
async def solides_webhook(request: Request):
    payload = await request.json()

    evento = payload.get("acao")
    dados = payload.get("dados", {})
    employee_id = dados.get("id")

    if not evento or not employee_id:
        raise HTTPException(status_code=400, detail="Evento ou colaborador ausente")

    correlation_id = str(uuid.uuid4())

    # 1) deduplica o evento
    # 2) salva inbox/execution
    # 3) coloca mensagem na fila
    # 4) responde rapidamente ao webhook

    return {
        "accepted": True,
        "correlationId": correlation_id,
        "event": evento,
        "employeeId": employee_id,
    }
```

# 10. Worker de processamento

```python
async def process_event(event):
    # Idempotencia: se event.id ja foi concluido, encerra sem repetir.
    if await inbox_repository.already_processed(event.event_id):
        return

    employee = await map_employee(event.data["id"])

    if event.type == "novo_colaborador":
        flash_employee_id = employee.flash_employee_id

        # Se nao existir ID externo, executar o provisionamento
        # conforme o endpoint habilitado na conta Flash.
        if not flash_employee_id:
            flash_employee_id = await flash_adapter.provision_employee(
                employee
            )
            await identity_repository.link(
                solides_id=employee.solides_id,
                system="FLASH",
                external_id=flash_employee_id,
            )

        # Exemplo de beneficio: o order_id vem do processo financeiro.
        result = await flash_adapter.add_benefit_deposit(
            order_id=employee.current_order_id,
            employee_id=flash_employee_id,
            employee_name=employee.name,
            employee_document=employee.cpf_digits,
            benefit_id=employee.benefit_id,
            benefit_name=employee.benefit_name,
            amount_cents=employee.benefit_amount_cents,
        )

        await execution_repository.mark_success(
            event.event_id, result
        )
```

# 11. Como ocorre o trânsito dos dados

| Etapa | Origem | Destino | Dados | Persistência |
| --- | --- | --- | --- | --- |
| 1. Evento | Sólides | Integration API | employee_id, evento, atributos do colaborador | event_id + raw metadata mínima |
| 2. Correlação | Integration API | Banco | Sólides ID | external_system + external_employee_id |
| 3. Transformação | Banco/Hub | Flash Adapter | campos mapeados | request/correlation ID |
| 4. Chamada | Hub | Flash | employeeId, document, benefit, amount | status + response metadata |
| 5. Reconcile | Sólides API | Hub | estado atual | last_sync_at + diff |

# 12. Mapeamento de campos

| Sólides | Campo interno | Flash | Observação |
| --- | --- | --- | --- |
| id | solides_employee_id | employeeId | O ID externo da Flash deve ser persistido no mapping; não usar o ID Sólides como se fosse ID Flash. |
| nome | name | employeeName | Normalizar espaços sem alterar valor de negócio. |
| cpf/documento | cpf_digits | employeeDocument | Flash documenta CPF sem máscara no depósito. |
| e-mail | email | e-mail de cadastro | Usar conforme endpoint da conta Flash. |
| matrícula | registration | external/reference | Útil como correlação empresarial, mas não substituir IDs externos. |
| benefício | benefit_id | benefitId | Mapeamento por catálogo de benefícios. |
| valor | benefit_amount_cents | amount | Flash documenta valores em centavos. |

# 13. Tratamento de erro

| Situação | Ação | Persistir |
| --- | --- | --- |
| 400/422 validação | Não retry automático; marcar erro funcional. | error_code, mensagem sanitizada, payload hash. |
| 401/403 | Interromper chamadas do adapter e alertar credencial/permissão. | provider, endpoint, request_id; nunca segredo. |
| 429 | Backoff e retry respeitando limite. | retry_after quando informado, attempt. |
| 500/502/503/timeouts | Retry exponencial com jitter. | attempt, next_retry_at, error_code. |
| Duplicidade | Consultar mapping/inbox e retornar sucesso lógico se já processado. | event_id, external_id. |

# 14. Reconciliação periódica

Webhooks reduzem latência, mas não devem ser a única fonte de garantia. Um job diário ou a cada poucas horas pode consultar a Sólides e comparar o estado dos colaboradores que deveriam existir na Flash. O objetivo é detectar: evento perdido, erro permanente, credencial expirada, registro criado manualmente no parceiro ou diferença de status.

```python
async def reconcile():
    solides_rows = await solides.list_all_active_and_recently_dismissed()

    for employee in solides_rows:
        mapping = await identity_repository.get(
            employee.solides_id, "FLASH"
        )

        if not mapping:
            await queue.publish("provision_employee", employee.solides_id)
            continue

        # Buscar estado do parceiro e comparar com o estado esperado.
        partner = await flash_adapter.get_employee(mapping.external_id)

        diff = compare_employee(employee, partner)
        if diff:
            await queue.publish("repair_employee", diff)
```

# 15. Segurança do exemplo

- Webhook: usar HTTPS e validação adicional de origem/segredo/assinatura quando disponibilizada pela Sólides.

- Secrets: SOLIDES_TOKEN e FLASH_API_KEY em cofre; nunca em Git ou banco de negócio.

- CPF: tratar apenas onde necessário; não escrever em logs.

- Logs: correlation_id, status, tempo e códigos de erro; payload integral somente se houver justificativa e retenção definida.

- Acesso: service account do Hub deve ter somente permissões das APIs que realmente utiliza.

- LGPD: documentar finalidade, retenção, base legal e perfis de acesso para os dados processados.

# 16. O que ainda falta para transformar o exemplo em produção

1. Obter o token/API access da Sólides para o ambiente autorizado.

2. Cadastrar e proteger o webhook da Sólides com URL HTTPS acessível pelo ambiente de produção.

3. Habilitar a API da Flash no ambiente da organização e obter a API Key por mecanismo seguro.

4. Confirmar o endpoint de provisionamento de colaborador habilitado na conta Flash e seu schema vigente.

5. Definir catálogo de benefícios, order_id, regras de valor e processo financeiro.

6. Implementar inbox/outbox ou fila para garantia de processamento e idempotência.

7. Criar dashboard de falhas, retries, taxa de sucesso e reconciliação.

8. Homologar casos de admissão, alteração, desligamento, duplicidade, timeout, 401, 429 e indisponibilidade.

# 17. Fontes oficiais do exemplo

# Fontes primárias utilizadas

As referências abaixo priorizam documentação primária e páginas oficiais. O acesso foi considerado até 30 de setembro de 2026. Quando a documentação pública não expõe o contrato ou schema completo, isso é indicado explicitamente no relatório.

[S1] Sólides — Gestão API Docs — API de colaboradores, autenticação, webhooks e vínculos externos.

[F1] Flash — API 2.0 / Introdução — Visão geral da API, gestão de colaboradores e benefícios.

[F2] Flash — API de benefícios — Depósitos, pedidos, valores, status e autenticação por x-flash-auth.

Resumo técnico
A prova de conceito é viável porque a Sólides fornece o lado “fonte de RH” (API + evento) e a Flash fornece o lado “destino de benefício” (API + API Key). O Integration Hub fecha a lacuna entre os dois contratos, mantendo IDs, estado e confiabilidade. O exemplo não depende de uma integração nativa entre as plataformas.
