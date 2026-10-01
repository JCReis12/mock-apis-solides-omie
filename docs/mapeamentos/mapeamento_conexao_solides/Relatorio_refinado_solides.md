# Pesquisa de Integrações — Sólides / HR Tech Platform

**Versão refinada para apresentação**  
**Data:** 01/10/2026  
**Conector central:** Sólides / People

## 1. Objetivo

Identificar como as ferramentas do ecossistema podem trocar dados com a **Sólides**, quais mecanismos técnicos podem ser utilizados e quais informações precisam ser mantidas para que o trânsito seja seguro, rastreável e reprocessável.

A proposta é usar a Sólides como referência do **ciclo de vida do colaborador** e um **Integration Hub** para conectar os diferentes fornecedores.

---

## 2. Arquitetura proposta

```text
                         SÓLIDES / PEOPLE
                         API + WEBHOOKS
                                |
                                v
                  +---------------------------+
                  |      INTEGRATION HUB      |
                  |---------------------------|
                  | Autenticação / Secrets    |
                  | Mapeamento de IDs         |
                  | Transformação de dados   |
                  | Fila / Retry              |
                  | Idempotência              |
                  | Logs / Auditoria          |
                  +-------------+-------------+
                                |
      +-----------+-------------+-------------+-------------+
      |           |             |             |             |
    Flash      Wellhub        Alura       Autentique    SharePoint
   Benefits      Gym        Learning       Signer         Backup
      |           |             |             |             |
      +-----------+-------------+-------------+-------------+
                         demais fornecedores
```

O Hub evita integrações ponto a ponto e concentra as regras comuns. Cada fornecedor possui um **adapter** próprio para seu formato e autenticação.

---

# 3. Sólides — Conector Central

A Sólides disponibiliza **API REST autenticada por token** e **Webhooks**. A documentação apresenta eventos como:

- `novo_colaborador`
- `edicao_colaborador`
- `demissao_colaborador`
- `nova_ocorrencia`
- `novo_curriculo`

A plataforma também trabalha com **vínculos/identificadores externos**, importantes para relacionar o colaborador da Sólides aos IDs dos outros sistemas.

### Dados que podem sair da Sólides

- ID, nome, e-mail, telefone e documento;
- matrícula, cargo, departamento e unidade;
- admissão, desligamento e situação;
- dados necessários ao processo específico;
- identificadores externos.

### Dados que o Hub deve manter

```text
solides_employee_id
external_system
external_employee_id
event_id
correlation_id
sync_status
last_sync_at
error_code
```

**Fonte:** [Sólides — Gestão API Docs](https://gestaoapidocs.solides.com.br/)

---

# 4. Matriz de integrações

| Ferramenta | Conexão | Dados principais | Persistência do trânsito |
|---|---|---|---|
| **Flash** | REST + API Key | Colaborador, benefício, valor, pedido | IDs Flash, benefício, pedido, depósito, status |
| **Wellhub** | REST + OAuth 2.0; SFTP | Funcionário e elegibilidade | employee ID, job ID, status |
| **SulAmérica** | Portal de APIs + credenciais | Beneficiário, plano, movimentação | beneficiary ID, transaction ID |
| **Clude** | API/SSO/SFTP a validar | Cadastro e acesso | ID externo, status |
| **Alura** | REST + Bearer Token; SSO | Usuário, matrícula, progresso | user ID, curso, status |
| **SENAI** | API/SSO conforme ambiente | Aluno, curso, matrícula | student/enrollment ID |
| **Edupulses** | API/Webhook/arquivo a validar | Usuário, atividade, resultado | user/activity/event ID |
| **Correios** | API + token | Endereço, encomenda, rastreio | shipment/tracking ID |
| **Loggi** | REST + autenticação | Pacote, cotação, entrega | package/tracking/event ID |
| **Porto Seguro** | API + OAuth/credenciais | Segurado, apólice, vigência | insured/policy ID |
| **Vixting** | REST + Webhooks | Colaborador e onboarding | employee/onboarding ID |
| **Vixting/Sosthys** | API/arquivo conforme produto | Trabalhador e SST | worker/process ID |
| **Autentique** | GraphQL + Bearer Token + Webhook | Documento, signatário, assinatura | document/signer/event ID |
| **Jota / Legal** | API/arquivo a confirmar | Demanda, processo | process/reference ID |
| **SharePoint** | Microsoft Graph + OAuth | Backup, arquivos, logs | site/drive/item ID |

---

# 5. Integrações detalhadas

## 5.1 Flash — Benefits

**Conexão:** REST + API Key (`x-flash-auth`).  
**Fluxo:** Sólides → Webhook → Hub → Flash API.

**Enviar:** ID do colaborador, nome, documento, benefício, valor e referências do pedido.  
**Receber:** `employeeId`, `benefitId`, `orderId`, `depositId`, valor, status e datas.  
**Armazenar:** IDs Sólides/Flash, benefício, pedido, depósito, status e correlação.

**Fontes:** [Flash API](https://docs.api.flashapp.services/), [Benefícios](https://docs.api.flashapp.services/api/beneficios)

---

## 5.2 Wellhub — Gym

**Conexão:** REST + OAuth 2.0 Client Credentials; também existe SFTP para cargas em lote.

**Enviar:** `employee_id`, empresa, nome, e-mail, documento, departamento, centro de custo e campos contratados.  
**Receber:** `job_id`, `job_item_id`, status e erros.  
**Armazenar:** IDs do colaborador, job, operação, status e erro.

O processamento é orientado a jobs, portanto o retorno HTTP inicial não deve ser tratado sozinho como conclusão da sincronização.

**Fontes:** [Getting Started](https://developer-hub.wellhub.com/docs/integrations/api/getting-started), [Eligibility](https://developer-hub.wellhub.com/docs/integrations/api/eligibility/), [SFTP](https://developer-hub.wellhub.com/docs/integrations/sftp/)

---

## 5.3 SulAmérica — Saúde

**Conexão:** portal corporativo de APIs e credenciais; o endpoint do produto Saúde depende do acesso autorizado.

**Enviar:** identificação do beneficiário, empresa, plano, categoria, vigência e movimentação.  
**Receber:** identificador do beneficiário, transação, status e pendências.  
**Armazenar:** `solides_employee_id`, `beneficiary_id`, `plan_id`, `transaction_id`, status e data.

**Fonte:** [SulAmérica — Portal de APIs](https://devsulamerica.sensedia.com/api-portal/)

---

## 5.4 Clude — Saúde Mental

O mecanismo corporativo de integração precisa ser confirmado com o fornecedor.

**Enviar:** somente dados administrativos necessários ao acesso: ID, nome, e-mail, empresa e situação.  
**Receber:** ID do usuário e status, quando disponibilizados.  
**Armazenar:** IDs e status de sincronização.

Dados clínicos não fazem parte do fluxo administrativo proposto. Informações de saúde são dados pessoais sensíveis na LGPD.

**Fonte:** [ANPD — LGPD](https://www.gov.br/anpd/pt-br/assuntos/lgpd)

---

## 5.5 Alura — E-learning

**Conexão:** REST + Bearer Token; SSO também é disponibilizado.

**Enviar:** nome, e-mail, matrícula e informações de equipe necessárias ao cadastro.  
**Receber:** ID do aluno, matrícula, curso, carga horária, matrícula no curso, conclusão, último acesso, percentual, certificado, progresso e indicadores de engajamento, conforme API contratada.  
**Armazenar:** `alura_user_id`, matrícula, IDs de curso, status e datas.

**Fontes:** [Cadastro](https://www.alura.com.br/empresas/docs/doc-api-cadastro-usuarios), [Conclusão](https://www.alura.com.br/empresas/docs/doc-api-conclusao), [Progresso](https://www.alura.com.br/empresas/docs/doc-api-progresso), [SSO](https://suporte-empresas.alura.com.br/acesso-via-sso-single-sign-on)

---

## 5.6 SENAI — Learning

A interface depende do ambiente educacional contratado.

**Conexão possível:** API, SSO/SAML, LTI, SFTP ou arquivo.  
**Enviar:** aluno, e-mail, matrícula, empresa, curso/turma e situação.  
**Receber:** ID do aluno, matrícula, curso, progresso e conclusão, quando disponibilizados.  
**Armazenar:** `student_id`, `enrollment_id`, curso e status.

---

## 5.7 Edupulses — Quizz

A API corporativa específica deve ser confirmada.

**Enviar:** colaborador, e-mail, equipe/grupo e atividade.  
**Receber:** usuário, atividade, participação, resultado e data, quando disponibilizados.  
**Armazenar:** `user_id`, `activity_id`, `event_id` e status.

---

## 5.8 Correios — Carrier

**Conexão:** APIs para endereço, preço, prazo e rastreamento, com autenticação por token conforme serviço.

**Enviar:** destinatário, endereço, CEP, telefone, serviço e dados da encomenda.  
**Receber:** preço, prazo, código de rastreio e eventos de entrega.  
**Armazenar:** `shipment_id`, `tracking_code`, serviço, status e data.

**Fonte:** [Correios — Developers](https://www.correios.com.br/atendimento/developers)

---

## 5.9 Loggi — Carrier

**Conexão:** API REST para cotação e operações de pacotes, com recursos de etiqueta e rastreamento.

**Enviar:** remetente, destinatário, endereço, pacote, peso/dimensões e referência interna.  
**Receber:** ID do pacote, pedido, etiqueta, rastreio, status, preço/prazo e eventos.  
**Armazenar:** `package_id`, `order_id`, `tracking_code`, status e data.

**Fonte:** [Loggi API Docs](https://docs.api.loggi.com/)

---

## 5.10 Porto Seguro — Seguro de Vida

**Conexão:** Portal do Desenvolvedor + OAuth/credenciais; a API disponível depende do produto autorizado.

**Enviar:** segurado, documento/identificador, empresa, matrícula, produto e vigência.  
**Receber:** ID do segurado, apólice, status, vigência e movimentações.  
**Armazenar:** `porto_employee_id`, `policy_id`, produto, status e datas.

`Client Secret` e tokens devem ficar em Secret Manager/Vault.

**Fonte:** [Porto Seguro — Developer Portal](https://dev.portoseguro.com.br/)

---

## 5.11 Vixting — Onboarding

**Conexão:** REST + Webhooks.

**Enviar:** identificação, nome, e-mail, cargo, departamento, unidade, admissão e gestor.  
**Receber:** ID do processo, status, tarefas e conclusão.  
**Armazenar:** `vixting_employee_id`, `onboarding_id`, status e datas.

---

## 5.12 Vixting by Sosthys — SST

A interface deve ser definida conforme o produto contratado.

**Enviar:** trabalhador, matrícula, cargo, departamento, unidade e informações necessárias ao processo.  
**Receber:** ID do trabalhador, processo, status e pendências.  
**Armazenar:** `worker_id`, `process_id`, `event_id` e status.

Dados médicos/ocupacionais exigem controles específicos de segurança e acesso.

---

## 5.13 Autentique — Signer

**Conexão:** GraphQL + Bearer Token + Webhooks.

**Fluxo:**

```text
Sólides -> Hub -> Autentique
                  |
             assinatura
                  |
               webhook
                  |
                  v
                 Hub
```

**Enviar:** signatário, e-mail, documento e participantes.  
**Receber:** ID do documento, signatário, status, data e eventos de assinatura.  
**Armazenar:** `document_id`, `signer_id`, `event_id`, status e datas.

**Fonte:** [Autentique — API](https://docs.autentique.com.br/)

---

## 5.14 Jota — Legal

A API ou formato de integração do produto jurídico utilizado deve ser obtido com o fornecedor.

**Enviar:** referências da empresa/colaborador, demanda e documentos necessários.  
**Receber:** ID da demanda/processo, status, prazos e eventos, conforme interface.  
**Armazenar:** IDs externos, processo, evento, status e data.

---

## 5.15 SharePoint — Backup / Disaster Recovery

**Conexão:** Microsoft Graph + OAuth/Entra ID.

```text
Sólides -> Hub -> Microsoft Graph -> SharePoint
```

**Enviar:** backups, arquivos, JSONs, logs, relatórios e metadados.  
**Receber:** `site_id`, `drive_id`, `drive_item_id`, caminho, nome, tamanho e datas.  
**Armazenar:** IDs do SharePoint, caminho, nome, hash, timestamp e status.

**Fontes:** [Microsoft Graph — SharePoint](https://learn.microsoft.com/pt-br/graph/api/resources/sharepoint?view=graph-rest-1.0), [DriveItem](https://learn.microsoft.com/pt-br/graph/api/resources/driveitem?view=graph-rest-1.0)

---

# 6. O que o Integration Hub precisa armazenar

O banco do Hub deve guardar o necessário para **identificar, sincronizar, auditar e reprocessar**.

### Identidade

```text
solides_employee_id
external_system
external_employee_id
```

### Execução

```text
event_id
correlation_id
operation
direction
sync_status
attempt
created_at
processed_at
error_code
error_message
```

### Exemplo

| Sólides | Sistema | ID externo | Status |
|---:|---|---|---|
| 12543 | FLASH | FL-87321 | SINCRONIZADO |
| 12543 | WELLHUB | WH-55281 | SINCRONIZADO |
| 12543 | ALURA | AL-19342 | ERRO |

---

# 7. Segurança

API Keys, Client Secrets e tokens não devem ficar no Git ou em tabelas comuns do banco.

```text
Secret Manager / Vault
   +-- SOLIDES_TOKEN
   +-- FLASH_API_KEY
   +-- WELLHUB_CLIENT_SECRET
   +-- ALURA_API_TOKEN
   +-- PORTO_CLIENT_SECRET
   +-- MICROSOFT_CLIENT_SECRET
```

Aplicar HTTPS, menor privilégio, rotação de credenciais, mascaramento de secrets nos logs e retenção mínima necessária.

Dados de saúde devem receber proteção adicional por sua classificação na LGPD.

---

# 8. Retry, idempotência e reconciliação

O webhook dispara a integração, mas não deve ser a única garantia de sincronização.

```text
Webhook
   |
   v
Registrar evento
   |
   v
Verificar duplicidade
   |
   v
Fila / Worker
   |
   v
Adapter do fornecedor
   |
   +--> sucesso
   +--> retry
   +--> erro permanente -> exceção
```

O `event_id` evita processamento duplicado. O `correlation_id` permite rastrear uma operação ponta a ponta. Uma consulta periódica à API de origem pode funcionar como reconciliação.

---

# 9. Conclusão

A Sólides possui os elementos necessários para ser o **conector central** do ecossistema: API REST, Webhooks e vínculos com identificadores externos.

O modelo recomendado é:

```text
SÓLIDES
   |
   | API + Webhooks
   v
INTEGRATION HUB
   |
   +-- Flash
   +-- Wellhub
   +-- Alura
   +-- Vixting
   +-- Autentique
   +-- Porto Seguro
   +-- Correios
   +-- Loggi
   +-- SharePoint
   +-- demais fornecedores
```

O Hub funciona como **tradutor e controlador do trânsito**. O principal dado persistido não é uma cópia completa do RH, mas sim o conjunto de **IDs externos, eventos, status, correlação, erros e informações de execução**.

---

# 10. Fontes principais

- **Sólides:** https://gestaoapidocs.solides.com.br/
- **Flash:** https://docs.api.flashapp.services/
- **Wellhub:** https://developer-hub.wellhub.com/
- **SulAmérica:** https://devsulamerica.sensedia.com/api-portal/
- **Alura:** https://www.alura.com.br/empresas/docs/
- **Correios:** https://www.correios.com.br/atendimento/developers
- **Loggi:** https://docs.api.loggi.com/
- **Porto Seguro:** https://dev.portoseguro.com.br/
- **Autentique:** https://docs.autentique.com.br/
- **Microsoft Graph:** https://learn.microsoft.com/pt-br/graph/
- **ANPD / LGPD:** https://www.gov.br/anpd/pt-br/assuntos/lgpd
