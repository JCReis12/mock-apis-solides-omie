PESQUISA TÉCNICA

# Integrações da Sólides com o ecossistema de RH

Pesquisa técnica aprofundada para definição de conectores, dados, autenticação, trânsito e persistência

> **Sólides / HR Tech Platform (People) como conector central**

Data de referência: 30 de setembro de 2026

Escopo: Sólides / People + 15 ferramentas de benefícios, saúde, educação, logística, jurídico, assinatura e backup

Método: prioridade para documentação oficial e portais de desenvolvedor; limitações públicas explicitadas

Classificação: confirmado publicamente / confirmado com dependência contratual / não confirmado publicamente

# Sumário executivo

> **Resultado central**
>
> A Sólides possui os elementos necessários para funcionar como fonte central de identidade e eventos do colaborador: API REST, autenticação por token, Webhooks e mecanismos de vínculo com identificadores externos. O desenho mais robusto é uma camada Integration Hub que traduza autenticação e payloads de cada parceiro, mantenha correlação de IDs e execute sincronização orientada a eventos com reconciliação periódica.

A pesquisa identificou integrações com evidência técnica pública particularmente forte para Flash, Wellhub, Alura, Correios, Loggi, Porto Seguro, Vixting, Autentique e SharePoint. SulAmérica possui portal corporativo de APIs, porém o catálogo de Saúde depende de acesso/aprovação. Para Clude, SENAI e Edupulses existem mecanismos institucionais ou de plataforma que sustentam caminhos de integração, mas não foi encontrada documentação pública completa para todos os endpoints de RH. Para Jota (Legal), não foi encontrada documentação pública suficiente que permita afirmar uma API legal específica sem risco de confundir produtos homônimos.

## Decisões arquiteturais resultantes

- Sólides como fonte mestre: eventos de admissão, alteração e desligamento disparam fluxos para os demais sistemas.

- Integration Hub como camada de desacoplamento: cada parceiro possui um adapter independente para API, OAuth, API Key, SFTP, SSO ou arquivo.

- Banco de integração separado: persiste mapeamento de IDs, status, correlação, retries e evidências de processamento, mas não duplica indiscriminadamente o banco de RH.

- Secrets fora do banco operacional: API Keys, Client Secrets e refresh/access tokens ficam em Secret Manager/Vault.

- Webhook + reconciliação: eventos são o mecanismo rápido; consultas periódicas à API ou arquivos funcionam como reconciliação e detecção de divergências.

- Minimização de dados: especialmente para saúde, SST e saúde mental; o Hub deve transportar somente os atributos necessários à finalidade da integração.

# Arquitetura proposta

```text
SÓLIDES / PEOPLE
                              │
                 ┌────────────┴────────────┐
                 │                         │
              REST API                  Webhooks
                 │                         │
                 └────────────┬────────────┘
                              ▼
                    ┌─────────────────────┐
                    │    INTEGRATION HUB  │
                    │                     │
                    │ Adapters            │
                    │ Auth / Secrets      │
                    │ Mapping de IDs      │
                    │ Filas / Retry       │
                    │ Idempotência        │
                    │ Auditoria / Logs    │
                    └──────────┬──────────┘
                               │
      ┌────────────┬────────────┼─────────────┬─────────────┐
      ▼            ▼            ▼             ▼             ▼
   Flash       Wellhub       Alura        Autentique   SharePoint
   Benefits    Gym           Learning     Signer       Backup

             ... adapters para os demais fornecedores ...
```

O objetivo do Hub não é se tornar um “segundo RH”. Ele deve ser um plano de controle da integração: receber/consultar dados na Sólides, transformar o contrato interno em contratos externos, registrar IDs e estados, e garantir entrega confiável. Isso reduz acoplamento e permite substituir um fornecedor sem alterar o núcleo do sistema.

# Matriz executiva de integração

| Ferramenta | Meio técnico | Nativa Sólides? | Evidência pública | Dados principais | IDs a correlacionar |
| --- | --- | --- | --- | --- | --- |
| Flash | REST + API Key | Não comprovada publicamente | Alta | Colaborador, benefício, pedido, depósito | employeeId / benefitId / orderId / depositId |
| Wellhub | REST + OAuth 2.0; SFTP | Não comprovada publicamente | Alta | Elegibilidade, funcionário, departamento, centro de custo | employee_id / job_id / job_item_id |
| SulAmérica | Portal API + credenciais; contrato | Não comprovada publicamente | Média/alta | Beneficiário, plano, vigência | beneficiary_id / transaction_id |
| Clude | API/SSO/SFTP a confirmar | Não confirmada | A confirmar | Cadastro administrativo mínimo | clude_employee_id / status |
| Alura | REST + Bearer Token; SSO | Não comprovada publicamente | Muito alta | Usuário, matrícula, conclusão, progresso, engajamento | alura_user_id / matrícula |
| SENAI | SSO/Identidade; API/LMS a identificar | Não confirmada | Média | Aluno, curso, matrícula, progresso | student_id / enrollment_id |
| Edupulses | Exportação; API/webhook a confirmar | Não confirmada | Média | Usuário, atividade, respostas, resultados | user_id / activity_id / event_id |
| Correios | REST/API Token; serviços de logística | Não aplicável | Alta | Endereço, encomenda, preço, rastreio | tracking_code / shipment_id |
| Loggi | REST + token; Webhook | Não aplicável | Alta | Cotação, pacotes, rastreamento | package_id / tracking_code / event |
| Porto Seguro | Portal API + OAuth/credenciais | Não comprovada | Média/alta | Segurado, apólice, vigência | insured_id / policy_id |
| Vixting | REST documentada + Webhook | Não comprovada | Alta | Colaborador, onboarding, documentos/status | employee_id / onboarding_id |
| Vixting/Sosthys | API/webhook a validar por produto | Não comprovada | Média/alta | Trabalhador e processos de SST | worker_id / process_id |
| Autentique | GraphQL + Bearer Token + Webhook | Não comprovada | Muito alta | Documento, signatário, assinatura/eventos | document_id / signer_id / event_id |
| Jota (Legal) | API/integração contratual a identificar | Não confirmada | A confirmar | Demanda, processo, documento | process_id / external_reference |
| SharePoint | Microsoft Graph + OAuth/Entra ID | Não comprovada | Muito alta | Backup, arquivos, logs | site_id / drive_id / drive_item_id |

Nota: “Nativa Sólides?” significa integração direta específica entre o fornecedor e a Sólides que tenha sido comprovada em fonte pública durante esta pesquisa. A ausência de confirmação pública não prova inexistência de integração privada ou contratual.

# Padrão de dados e persistência

O conjunto de dados persistidos deve ser dividido em quatro camadas: identidade/correlação, execução técnica, credenciais e evidências. Essa separação evita armazenar em uma tabela de negócio aquilo que deveria estar em um cofre de segredos ou em uma trilha de auditoria.

| Camada | Exemplos | Onde armazenar | Finalidade |
| --- | --- | --- | --- |
| Identidade/correlação | solides_employee_id, external_employee_id, external_system | Banco de integração | Descobrir qual registro representa o mesmo colaborador em cada parceiro. |
| Execução | sync_status, operation, last_sync_at, retry_count, correlation_id | Banco de integração / fila | Controlar processamento, retries e reconciliação. |
| Credenciais | API Key, Client Secret, access token, refresh token | Secret Manager/Vault | Autenticação sem expor segredo em banco/log. |
| Evidências | event_id, request_id, response status, erro, hash de payload | Log/auditoria com retenção definida | Rastreabilidade e diagnóstico sem precisar repetir a chamada original. |

## Modelo mínimo sugerido

```text
integration_identity
-------------------
id
solides_employee_id
external_system
external_employee_id
external_reference
created_at
updated_at

integration_execution
--------------------
id
identity_id
operation
direction
event_id
correlation_id
request_id
status
attempt
last_attempt_at
last_success_at
error_code
error_message
created_at

secret_store (conceitual, nao guardar o segredo em texto)
--------------------------------------------------------
provider
credential_reference
rotation_policy
expires_at
```

# 3. Sólides / People — conector central

| CONFIRMADO | API REST + token + Webhooks + vínculo externo documentados |
| --- | --- |

## Como conectar ao conector central

- API REST: consultas e operações sobre colaboradores e outros recursos documentados.

- Token: autenticação da API usando token da plataforma.

- Webhooks: eventos de ciclo de vida do colaborador encaminhados para uma URL externa.

- Vínculos externos: a plataforma documenta relacionamento por sistema de destino e identificador externo.

## O que a documentação comprova

A documentação oficial expõe endpoints de colaboradores e recursos de apoio à gestão de pessoas.

Os Webhooks documentados incluem novo_colaborador, edicao_colaborador e demissao_colaborador, além de outros eventos.

Os payloads de colaborador podem transportar identificação, vínculo empregatício, departamento, cargo, contato, endereço e outros atributos.

A API de externos permite manter associações com identificadores de outros sistemas por meio de target-system/sistema e externo_id.

## Dados enviados para o conector central

- Identidade: id do colaborador, matrícula, nome, e-mail, CPF/documento, telefone.

- Organização: cargo, departamento, unidade, gestor e dados contratuais necessários ao processo.

- Ciclo de vida: data de admissão, data de desligamento, situação ativa/inativa.

- Evento: tipo do evento, horário de recebimento e referência do evento.

- Vínculos: identificadores externos já associados ao colaborador.

## Dados enviados pelo conector central

- Para parceiros: somente os atributos exigidos por cada finalidade, transformados pelo adapter.

- Para reconciliação: consultas periódicas à API para detectar mudanças ou eventos que não tenham sido processados.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; external_system; external_employee_id; external_reference.

- event_id/event_type; correlation_id; request_id; timestamps.

- sync_status; operation; direction; attempt/retry_count; error_code; error_message.

- Referência do token em Secret Manager, nunca o segredo em claro no banco operacional.

## Implicações operacionais

- O webhook deve ser tratado como evento potencialmente repetível; a operação precisa ser idempotente.

- Uma reconciliação periódica via API reduz o impacto de falhas de entrega e divergências.

- O mapping de identificadores deve ser uma entidade de primeira classe do Hub, não uma regra escondida em código.

## Segurança e proteção de dados

- Aplicar autenticação forte na URL de webhook e validação de origem/assinatura quando suportada pelo contrato.

- Não registrar tokens ou dados pessoais completos em logs de aplicação.

- Aplicar minimização de dados conforme finalidade e retenção definida.

### Fontes primárias

[S1] Sólides — Gestão API Docs — API de colaboradores, autenticação, webhooks e vínculos externos.

# 4. Flash — Benefits

| CONFIRMADO | API REST e API Key documentadas; benefícios e colaboradores possuem fluxos de API |
| --- | --- |

## Como conectar ao conector central

- API REST: conexão do Hub com a API Flash para gestão de colaboradores e benefícios.

- API Key: a documentação informa uso de chave e header x-flash-auth; a habilitação da integração é feita no ambiente da Flash.

- Sem dependência de SSO: o fluxo de negócio pode ser feito por API; SSO seria uma questão de acesso e não substitui provisionamento.

## O que a documentação comprova

A documentação da Flash separa autenticação, gestão de colaboradores e gestão de benefícios.

No fluxo de benefícios, a API documenta criação do pedido, adição de colaboradores/valores e confirmação/pagamento.

O endpoint de depósito documenta employeeId, employeeName, employeeDocument, benefitId, benefitName e amount; o valor é expresso em centavos.

As respostas incluem identificadores do pedido/depósito, dados do colaborador e benefício e status.

## Dados enviados para o conector central

- Retorno para o Hub: employeeId, employeeName, employeeDocument, benefitId, benefitName, amount, orderId/depositId, status, createdAt/creditDate quando disponibilizados.

- Eventos de execução: resultado da criação, validações, erros e estados do pedido/depósito.

## Dados enviados pelo conector central

- Cadastro/atualização: nome, e-mail e identificadores corporativos conforme endpoint de colaboradores autorizado na conta.

- Benefício: identificador do colaborador, benefício, valor e referência do pedido.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; flash_employee_id; flash_company_id se aplicável.

- flash_benefit_id; flash_order_id; flash_deposit_id.

- amount em unidade compatível com a API; data/status; request/correlation ID.

- FLASH_API_KEY em Secret Manager, não no código ou em tabela de negócio.

## Implicações operacionais

- Como benefícios têm efeito financeiro, deve existir reconciliação entre pedido, depósito e status final.

- Operações de criação devem possuir chave/idempotency de negócio no Hub para não duplicar créditos em caso de retry.

- Erros 4xx devem gerar análise funcional; erros 5xx/timeouts podem entrar em retry controlado.

## Segurança e proteção de dados

- CPF é dado pessoal e deve ser tratado com acesso mínimo necessário.

- Não registrar CPF completo ou API Key em logs de erro.

- Manter segregação entre dados de benefício e segredos de integração.

### Fontes primárias

[F1] Flash — API 2.0 / Introdução — Visão geral da API, gestão de colaboradores e benefícios.

[F2] Flash — API de benefícios — Depósitos, pedidos, valores, status e autenticação por x-flash-auth.

# 5. Wellhub — Gym

| CONFIRMADO | REST + OAuth 2.0 Client Credentials; SFTP como alternativa documentada |
| --- | --- |

## Como conectar ao conector central

- REST API: API de clientes/elegibilidade para inclusão, atualização e exclusão de funcionários.

- OAuth 2.0: Client ID + Client Secret geram access token de curta duração; o token é enviado como Bearer.

- SFTP: a documentação do Wellhub também contempla cargas por arquivos para cenários batch.

## O que a documentação comprova

A documentação atual descreve OAuth 2.0 Client Credentials com endpoint de token e access token de validade curta.

Em 2026 o Wellhub documentou a migração da API legada para a Clients API. A própria documentação orienta novas integrações para OAuth 2.0.

A API de elegibilidade documenta CREATE/UPDATE/DELETE e campos como employee_id, company_tax_id, full_name, email, national_id, department, cost_center e office_zip_code.

Jobs e itens possuem IDs e status para acompanhar o processamento e identificar erros.

## Dados enviados para o conector central

- Para o Hub: status da operação/job; employee_id; identificador da companhia; erros; resultado de elegibilidade.

- Em reconciliação: lista/estado de elegíveis e processamento do job.

## Dados enviados pelo conector central

- Inclusão/alteração: company_tax_id, employee_id, full_name, email, national_id e, conforme caso, department, cost_center, office_zip_code, payroll_id, employee_segment, mobile_number e custom_fields.

- Desligamento: identificador do funcionário e operação DELETE.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; wellhub_employee_id/employee_id; employee_identifier_type.

- job_id; job_item_id; operation; status; error_code/error_message.

- last_sync_at; retry_count; correlation_id.

- WELLHUB_CLIENT_ID e WELLHUB_CLIENT_SECRET em Secret Manager; access token temporário em cache seguro.

## Implicações operacionais

- A API possui modelo assíncrono de job; o Hub não deve assumir que HTTP 2xx significa conclusão do processamento de cada colaborador.

- Para UPDATE, seguir exatamente a semântica documentada do fornecedor; campos omitidos podem ser tratados como vazios, conforme documentação.

- SFTP pode ser preferido quando o processo contratado for batch e a empresa já tiver infraestrutura segura de arquivos.

## Segurança e proteção de dados

- Client Secret é credencial de alta sensibilidade e não deve aparecer em código, logs ou payloads persistidos.

- Aplicar rotação e expiração conforme o ambiente Wellhub.

- Usar HTTPS/TLS e controles de rede para o endpoint de integração.

### Fontes primárias

[W1] Wellhub — API Getting Started — OAuth 2.0 Client Credentials, token de acesso, sandbox/produção e credenciais.

[W2] Wellhub — Eligibility API — Operações de inclusão, atualização e exclusão e campos do colaborador.

[W3] Wellhub — Migration FAQ — Transição da API legada para Clients API/OAuth 2.0 em 2026.

# 6. SulAmérica — Saúde

| PARCIALMENTE CONFIRMADO | Portal corporativo de APIs confirmado; catálogo de Saúde requer acesso/aprovação |
| --- | --- |

## Como conectar ao conector central

- Portal de APIs: a SulAmérica possui portal de desenvolvedores baseado em plataforma de gerenciamento de APIs.

- Credenciais de aplicação: o modelo do portal prevê aplicação/cliente e credenciais para consumo conforme API autorizada.

- Contrato: o endpoint, schema e operações do produto de Saúde precisam ser validados no catálogo disponibilizado para a organização.

## O que a documentação comprova

Há um portal oficial para consumo de APIs da SulAmérica por parceiros/clientes autorizados.

A pesquisa pública não permitiu comprovar de forma suficiente um endpoint de movimentação de beneficiários do produto de Saúde específico sem acesso ao catálogo autorizado.

Logo, a arquitetura deve suportar REST/OAuth ou API gateway corporativo, mas a definição final do contrato externo depende da API efetivamente liberada.

## Dados enviados para o conector central

- Provável retorno: identificador do beneficiário, transação/movimentação, status, vigência e erros, conforme API autorizada.

- Conciliação: relatório ou consulta de beneficiários ativos/inativos, se exposta pelo contrato.

## Dados enviados pelo conector central

- CPF/número de identificação; nome; matrícula; empresa; plano/categoria; datas de inclusão/exclusão; dependentes quando aplicável.

- Enviar somente os atributos exigidos pelo schema da API de Saúde liberada.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; sulamerica_beneficiary_id; beneficiary_id; plan_id; transaction_id.

- operation; sync_status; last_sync_at; error_code; error_message; correlation_id.

- Client ID/Secret e tokens em Secret Manager.

## Implicações operacionais

- Antes de desenvolvimento, pedir OpenAPI/Swagger, catálogo de endpoints, sandbox, limites, SLA e matriz de erros do produto de Saúde.

- Validar se a movimentação é síncrona ou baseada em lote/arquivo; o adapter deve conseguir suportar ambos.

## Segurança e proteção de dados

- Dados de saúde e beneficiários exigem acesso restrito e minimização.

- Separar credenciais por ambiente (homologação/produção).

- Não usar CPF como chave primária de negócio do Hub; preferir ID interno e mapeamentos.

### Fontes primárias

[S1A] SulAmérica — Portal de APIs / Integrações — Portal de APIs corporativas; catálogo específico depende de aprovação e acesso.

# 7. Clude — Saúde Mental

| NÃO CONFIRMADO PUBLICAMENTE | Produto corporativo documentado, mas API pública de RH não localizada |
| --- | --- |

## Como conectar ao conector central

- API: deve ser solicitada ao fornecedor caso exista uma API corporativa não publicada.

- SSO: pode ser avaliado para autenticação/acesso caso o contrato do cliente disponibilize.

- SFTP/arquivo: alternativa a confirmar se o fornecedor não oferecer API pública.

## O que a documentação comprova

A documentação institucional do Clude confirma oferta corporativa de saúde mental e descreve funcionalidades do serviço.

Não foi localizada documentação pública equivalente a um portal OpenAPI/Swagger para provisionamento de colaboradores.

A pesquisa, portanto, não deve inventar endpoint, método de autenticação ou webhook; esses elementos precisam ser obtidos do contrato/fornecedor.

## Dados enviados para o conector central

- ID do usuário, status de acesso, ativação/desativação, erro de processamento e referência da empresa, caso uma interface administrativa esteja disponível.

## Dados enviados pelo conector central

- ID do colaborador; nome; e-mail; telefone; identificador exigido; empresa; admissão/desligamento; status.

- Nunca assumir que prontuário ou conteúdo clínico faz parte do fluxo administrativo.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; clude_employee_id; integration_reference; operation; sync_status; last_sync_at; error.

- Credenciais e tokens em Secret Manager; nenhum segredo em banco/log.

## Implicações operacionais

- A primeira entrega recomendada é um discovery técnico com o fornecedor e obtenção de documentação de integração.

- Pode ser necessário usar um fluxo batch durante a fase inicial, com reconciliação diária, se não houver webhook.

## Segurança e proteção de dados

- A ANPD considera dados referentes à saúde como dados pessoais sensíveis; o Hub deve evitar receber conteúdo clínico quando a finalidade é apenas administrativa.

- Restringir logs e retenção; utilizar pseudonimização/identificadores sempre que possível.

### Fontes primárias

[C1] Clude — Plataforma de Saúde Mental — Informações institucionais; não foi localizada documentação pública completa de API corporativa.

[C2] Clude — Privacidade e Termos — Tratamento de dados e contexto de saúde mental.

[LGPD1] ANPD — Direitos do titular / dados sensíveis — Saúde é dado pessoal sensível e recebe proteção específica na LGPD.

# 8. Alura — E-learning

| CONFIRMADO | API REST de usuários + APIs de conclusão/progresso/engajamento + SSO |
| --- | --- |

## Como conectar ao conector central

- REST + Bearer Token: API documentada para inclusão de usuários.

- APIs de aprendizagem: conclusão, progresso e engajamento permitem trazer indicadores ao Hub.

- SSO: SAML/LTI/TOKEN e outros mecanismos suportados para autenticação; SSO não substitui a API de provisionamento.

## O que a documentação comprova

A API de inclusão usa POST e o header Authorization: Bearer <token>. Os campos documentados incluem nome, email, time e matrícula.

A API de conclusão é GET/JSON e permite consulta por período; a documentação expõe matrícula, email, idAluno, curso, datas, percentual e URL de certificado entre os campos do retorno.

A API de progresso consulta cursos em andamento; a API de engajamento consulta atividade de estudantes por período e time.

A combinação de provisionamento + retorno de aprendizagem permite sincronização bidirecional no nível administrativo/educacional.

## Dados enviados para o conector central

- Ao Hub: conclusões, progresso, engajamento, IDs do aluno/curso, matrícula, datas, percentual e certificado quando disponibilizados.

- Status: HTTP status, erros de autenticação/autorização/validação e limites de requisição.

## Dados enviados pelo conector central

- Provisionamento: nome, email, time e matrícula.

- Desligamento/gestão: o comportamento deve ser mapeado com a operação do plano/endpoint contratado; não presumir endpoint de exclusão sem confirmar no catálogo atual.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; alura_user_id/idAluno; matricula; team/time.

- course_id/codigoCurso; enrollment/matricula de curso; last_access; completion/progress; certificate_url.

- last_sync_at; sync_status; correlation/request ID.

- ALURA_API_TOKEN em Secret Manager.

## Implicações operacionais

- A frequência de polling deve respeitar o rate limit documentado das APIs.

- Como algumas APIs são orientadas a períodos, usar janelas de consulta com overlap e deduplicação por identificador.

- Certificados e conteúdo de aprendizagem podem ser mantidos na Alura; o Hub armazena referência e metadados quando necessário.

## Segurança e proteção de dados

- Token deve ser secreto.

- Dados educacionais devem ser acessados apenas por serviços que precisem deles.

- Evitar copiar grandes quantidades de conteúdo educacional; transportar somente metadados/resultado necessário.

### Fontes primárias

[A1] Alura Empresas — API de inclusão de usuários — POST de cadastro; Bearer Token; nome, email, time e matrícula.

[A2] Alura Empresas — API de conclusão — Cursos concluídos, matrícula, curso, percentual, certificado e datas.

[A3] Alura Empresas — API de progresso — Cursos em progresso e consultas por período.

[A4] Alura Empresas — API de engajamento — Indicadores de engajamento por período e time.

[A5] Alura Empresas — SSO — SAML/LTI/TOKEN e outros mecanismos de autenticação suportados.

# 9. SENAI — Learning

| PARCIALMENTE CONFIRMADO | Identidade/SSO documentados; API do LMS específico precisa ser identificada |
| --- | --- |

## Como conectar ao conector central

- SSO/Identidade: o serviço de Identidade SENAI atua como provedor de identidade para aplicações integradas.

- API/LMS: para sincronização de matrícula e progresso, deve ser identificado o ambiente educacional específico utilizado pelo contrato.

- Arquivo/SFTP: pode funcionar como fallback caso o LMS contratado ofereça exportação/importação.

## O que a documentação comprova

A Identidade SENAI é descrita como serviço nacional de identidade, com conta única e integração com aplicações.

A documentação pública não representa uma API universal de “Learning SENAI” que sirva para todos os ambientes do Sistema SENAI; a escola/LMS específico precisa ser identificado.

Portanto, SSO é uma via confirmada de autenticação/identidade, mas não deve ser confundido com sincronização de cadastro/progresso.

## Dados enviados para o conector central

- Ao Hub: student_id, enrollment_id, course_id, turma, status, conclusão/progresso quando o LMS expuser esses dados.

- Autenticação: eventos de login/atributos de identidade somente se o fluxo exigir e o contrato permitir.

## Dados enviados pelo conector central

- Nome, e-mail, CPF/matrícula conforme exigência do LMS; curso, turma, unidade; data de matrícula; status.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; senai_student_id; enrollment_id; course_id; class_id; sync_status; last_sync_at.

- Referência de IdP/SSO e metadata somente quando necessária; não armazenar senha.

## Implicações operacionais

- Solicitar ao ambiente SENAI utilizado: documentação OpenAPI/LMS, SAML metadata, OIDC endpoints, LTI configuration e processo de provisionamento.

- Definir claramente se a integração é apenas login ou se inclui matrícula, conclusão e certificados.

## Segurança e proteção de dados

- Nunca armazenar senha do usuário SENAI.

- Aplicar segregação entre atributos de identidade e dados de aprendizagem.

- Mapear retenção de CPF caso o LMS o utilize.

### Fontes primárias

[N1] SENAI — Identidade SENAI — Identidade nacional e integração de aplicações; suporte a SSO.

# 10. Edupulses — Quizz

| PARCIALMENTE CONFIRMADO | Funcionalidades de quiz/resultados e exportação confirmadas; API corporativa não localizada publicamente |
| --- | --- |

## Como conectar ao conector central

- Exportação de resultados: a plataforma documenta/expõe exportação de resultados como funcionalidade operacional.

- API/Webhook: não foram localizados endpoints públicos suficientes para afirmar um contrato de API de RH.

- Arquivo: CSV/XLSX exportado/importado pode ser usado como primeiro adaptador caso o fornecedor não ofereça API.

## O que a documentação comprova

O produto oficial apresenta quizzes, múltipla escolha, respostas em tempo real, análise e exportação de resultados.

A pesquisa não encontrou um portal público de API que permita determinar autenticação, endpoints ou webhooks de forma verificável.

Assim, o caminho tecnicamente seguro para o relatório é tratar API/webhook como item de validação e arquivo como fallback.

## Dados enviados para o conector central

- Usuário; atividade/quiz; evento/resposta; resultado/pontuação; data e status, quando exportados ou retornados por uma integração.

## Dados enviados pelo conector central

- ID do colaborador; nome; e-mail; turma/equipe; atividade atribuída; período do quizz.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; edupulses_user_id; activity_id; event_id; result_id; sync_status; last_sync_at.

- hash/nome do arquivo e período quando a interface for batch; checksum para detectar reimportação do mesmo arquivo.

## Implicações operacionais

- Um adapter de arquivo deve registrar lote, nome do arquivo, checksum, período e número de registros processados.

- A importação deve ser idempotente para não duplicar respostas/resultados.

## Segurança e proteção de dados

- Limitar acesso aos resultados individuais; logs devem registrar IDs, não respostas completas, quando desnecessário.

- Credenciais de API, se houver, devem ficar em Secret Manager.

### Fontes primárias

[E1] Edupulses — Plataforma oficial — Quizzes, respostas em tempo real e exportação de resultados; API pública não localizada.

# 11. Correios — Carrier

| CONFIRMADO | API Token + serviços REST de logística documentados |
| --- | --- |

## Como conectar ao conector central

- API Token: token de autenticação usado por outras APIs dos Correios.

- REST/HTTPS/JSON: manual oficial descreve arquitetura e uso das APIs.

- Serviços: CEP, rastreamento, preço/prazo, pré-postagem, agência e outros serviços.

## O que a documentação comprova

O Manual de Uso de API Token explica que o token autentica chamadas às APIs dos Correios.

A documentação indica requisitos de acesso, inclusive vínculo a conta/PJ/contrato em determinados cenários.

Os manuais organizam microserviços de consulta de CEP, rastreio, preço/prazo e pré-postagem.

## Dados enviados para o conector central

- Ao Hub: tracking code, status, eventos de rastreamento, preço/prazo e códigos de erro.

- Reconciliação: consulta de status a partir do código de rastreamento.

## Dados enviados pelo conector central

- Destinatário; CEP; endereço; telefone; peso/dimensões; serviço postal; referência interna do colaborador/encomenda.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; shipment_id/order_reference; tracking_code; service_code; status; last_event_at.

- token/credenciais em Secret Manager; código do contrato/cartão apenas como referência segura.

## Implicações operacionais

- Para onboarding, o melhor vínculo é um shipment_id interno, sem transformar nome/CPF em chave técnica.

- Tracking pode ser reconsultado até o evento final; definir política de retenção conforme necessidade do processo.

## Segurança e proteção de dados

- Endereços são dados pessoais; restringir logs.

- Usar HTTPS e armazenar credenciais de contrato de forma segura.

### Fontes primárias

[C1C] Correios — Manual API Token — Token para APIs dos Correios; HTTPS/JSON; autenticação e requisitos contratuais.

[C2C] Correios — Manuais/API — Busca CEP, rastreamento, preço/prazo, pré-postagem e outros serviços.

# 12. Loggi — Carrier

| CONFIRMADO | APIs de cotação, pacotes, rastreamento e Webhook documentados |
| --- | --- |

## Como conectar ao conector central

- REST API: cotação, criação/atualização/cancelamento de pacotes, etiquetas e tracking.

- Token/OAuth: a documentação expõe autenticação e uso de Bearer conforme endpoint.

- Webhook: tracking em tempo real por endpoint HTTPS do cliente.

- EDI: a Loggi também documenta integração EDI para cenários corporativos.

## O que a documentação comprova

A API Reference oficial cobre autenticação, quotation, packages, labels, tracking e outras operações.

O fluxo de cotação utiliza company_id e dados de origem/destino/pacotes.

O webhook de tracking entrega eventos por HTTPS e inclui trackingCode, status, localização e histórico.

## Dados enviados para o conector central

- Ao Hub: trackingCode, status, location, promisedDate, requestTime, trackingHistory e identificadores de pacote.

- Erros: códigos/descrições retornados pelas operações de cotação ou criação de envio.

## Dados enviados pelo conector central

- shipFrom; shipTo; packages; externalServiceId; company reference; informações de cotação e entrega.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; loggi_package_id; loggi_order_id; tracking_code; external_reference; webhook_event_id.

- credential reference, token metadata, request_id, last_status, last_update_at.

## Implicações operacionais

- Webhooks devem ser aceitos idempotentemente porque eventos de tracking são inerentemente repetíveis.

- O adapter precisa diferenciar cotação de criação efetiva de remessa para evitar cobranças/duplicidade.

- O endpoint do cliente deve ser HTTPS e estar preparado para autenticação conforme configuração comercial.

## Segurança e proteção de dados

- Endereços e nomes são dados pessoais; registrar somente o necessário.

- Segredos de autenticação e credenciais de webhook ficam em cofre.

### Fontes primárias

[L1] Loggi — API Reference — Autenticação, cotação, pacotes, cancelamento, etiquetas e rastreamento.

[L2] Loggi — Webhook de rastreamento — Eventos de tracking em tempo real via HTTPS.

# 13. Porto Seguro — Seguro Vida

| CONFIRMADO COM DEPENDÊNCIA DE PRODUTO | Portal de APIs e sandbox documentados; contrato/produto define operações disponíveis |
| --- | --- |

## Como conectar ao conector central

- Portal do Desenvolvedor: criação/aprovação de aplicações e acesso a APIs de produtos.

- OAuth/credenciais: as APIs protegidas utilizam mecanismo de autorização definido no portal; o fluxo exato depende da API aprovada.

- Sandbox: o portal prevê ambiente de testes para desenvolvimento.

## O que a documentação comprova

A Porto Seguro mantém portal oficial para APIs e exige aprovação para acesso aos produtos.

O portal fornece sandbox e controle de aplicações.

A pesquisa não deve presumir que todos os produtos têm os mesmos endpoints ou o mesmo schema; Seguro Vida precisa ser validado no catálogo autorizado.

## Dados enviados para o conector central

- Ao Hub: insured_id, policy_id, status, vigência, erros e transações conforme API do produto.

## Dados enviados pelo conector central

- CPF/identificador; nome; matrícula; datas; empresa; produto/categoria e dados estritamente necessários à apólice.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; porto_insured_id; policy_id; product_id; transaction/reference; sync_status; last_sync_at.

- client_id/client_secret/token em Secret Manager.

## Implicações operacionais

- Começar em sandbox e registrar o contrato da API aprovada no adapter.

- Tratar a inclusão/exclusão como movimentação financeira/contratual com reconciliação e auditoria.

## Segurança e proteção de dados

- Seguros envolvem dados cadastrais; limitar acesso e logs.

- Não armazenar Client Secret ou tokens de acesso no banco de integração.

### Fontes primárias

[P1] Porto Seguro — Portal do Desenvolvedor — APIs de produtos; sandbox e aprovação de aplicações.

# 14. Vixting — Onboarding e integração

| CONFIRMADO | Fornecedor declara API REST documentada, Webhook em tempo real e integrações de onboarding/ATS/eSocial |
| --- | --- |

## Como conectar ao conector central

- API REST: a página institucional declara API REST documentada.

- Webhook: a página institucional declara webhook em tempo real.

- Integrações: a Vixting declara integração direta com ATS/eSocial e processos de admissão digital, assinatura e ERP.

## O que a documentação comprova

A documentação institucional da Vixting descreve API aberta para integração com ATS do mercado, API REST documentada e webhook em tempo real.

A plataforma de onboarding contempla admissão digital, documentos e assinatura, de acordo com a apresentação institucional.

Para o projeto, isso permite usar o evento novo_colaborador da Sólides como disparador do onboarding, caso o contrato exponha o endpoint de entrada correspondente.

## Dados enviados para o conector central

- Ao Hub: status de onboarding, etapa/tarefa, conclusão, erros, identificadores e eventos do processo, se disponíveis.

## Dados enviados pelo conector central

- nome, CPF/identificador, e-mail, telefone, cargo, departamento, unidade, admissão, gestor e dados necessários ao checklist/documentos.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; vixting_employee_id; onboarding_id; task/checklist id; status; event_id; last_sync_at.

- Token/API credentials em Secret Manager; referência do contrato/API version.

## Implicações operacionais

- O webhook de onboarding permite fechar o loop: Sólides gera admissão; Vixting executa o processo; Vixting retorna status/conclusão.

- Documentos devem permanecer em repositório documental apropriado quando possível; o Hub guarda referências e status.

## Segurança e proteção de dados

- Minimizar documentos e dados pessoais transportados.

- Assinaturas e dados de admissão exigem trilha de auditoria e controle de acesso.

### Fontes primárias

[V1] Vixting — Integrações — API REST documentada, webhooks em tempo real, integração com ATS e eSocial; onboarding e SST.

# 15. Vixting by Sosthys — SST

| PARCIALMENTE CONFIRMADO | Módulo SST e processos descritos; API específica de SST precisa de contrato/schema |
| --- | --- |

## Como conectar ao conector central

- API/integração: reutilizar a camada Vixting se o módulo SST estiver exposto pelo mesmo contrato/API.

- Webhook: usar eventos quando o produto disponibilizar notificações de processos/status.

- Arquivo: SFTP/CSV pode ser fallback para cargas de SST, se suportado pelo contrato.

## O que a documentação comprova

A Vixting apresenta funcionalidades de SST como gestão de riscos, PGR, treinamentos, laudos e registros auditáveis.

A existência do módulo não prova, por si só, um conjunto público de endpoints SST. O schema deve ser solicitado ao fornecedor.

## Dados enviados para o conector central

- Ao Hub: ID de trabalhador, status de processo, documentos/referências, eventos e pendências quando expostos.

## Dados enviados pelo conector central

- Identificação do trabalhador; cargo/função; unidade; data de admissão; atributos necessários a processos de SST.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; sosthys_worker_id; process_id; event_id; status; last_sync_at.

- Referências a documentos e exames, evitando copiar conteúdo clínico/ocupacional sem necessidade.

## Implicações operacionais

- Separar adapter de SST do adapter de onboarding, mesmo que compartilhem base de autenticação.

- Definir matriz de dados permitidos e finalidade antes de incluir atributos de saúde/ocupacionais.

## Segurança e proteção de dados

- SST pode envolver dados de saúde, sujeitos a maior proteção; o Hub deve adotar minimização e segregação de acesso.

- Evitar armazenar laudos/exames no banco operacional de integração se o sistema de SST já for repositório apropriado.

### Fontes primárias

[V1] Vixting — Integrações — API REST documentada, webhooks em tempo real, integração com ATS e eSocial; onboarding e SST.

[LGPD1] ANPD — Direitos do titular / dados sensíveis — Saúde é dado pessoal sensível e recebe proteção específica na LGPD.

# 16. Autentique — Signer

| CONFIRMADO | API GraphQL + Bearer Token + Webhooks documentados |
| --- | --- |

## Como conectar ao conector central

- GraphQL: endpoint oficial `/v2/graphql` para operações da API.

- Bearer Token: API token enviado como Authorization Bearer.

- Webhooks: eventos HTTP POST, JSON; documentação também descreve validação HMAC e possível duplicidade de eventos.

## O que a documentação comprova

A API da Autentique é GraphQL, portanto o adapter precisa montar queries/mutations e não REST convencional.

Os webhooks cobrem eventos de documentos, assinaturas e membros.

A documentação orienta que eventos não devem ser considerados necessariamente ordenados e podem ser duplicados; por isso event_id/idempotência são obrigatórios no desenho.

## Dados enviados para o conector central

- Ao Hub: document_id, signer/member_id, status de documento/assinatura, timestamps, tipo de evento, referência externa.

- Webhook: payload JSON e assinatura/HMAC conforme mecanismo da conta.

## Dados enviados pelo conector central

- nome, e-mail e dados do signatário; documento/template; ordem de assinatura; referência interna do colaborador.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id; autentique_document_id; signer_id/member_id; event_id; signature status; document status; hash; timestamps.

- API token em Secret Manager; segredo HMAC do webhook, se aplicável, também em Secret Manager.

## Implicações operacionais

- O Hub deve deduplicar por event_id e/ou chave composta de evento + documento + signer.

- Documento assinado não precisa ser copiado para o banco; pode permanecer na Autentique/SharePoint, mantendo referência/hash no Hub.

- A API possui limite de requisições; o adapter deve respeitar rate limit e aplicar backoff.

## Segurança e proteção de dados

- Documentos e assinaturas podem conter dados pessoais; controlar acesso e retenção.

- Validar assinatura/HMAC do webhook e não confiar apenas em IP/URL.

- Nunca registrar API token em logs.

### Fontes primárias

[AU1] Autentique — API — API GraphQL, token Bearer, documentos e assinaturas.

[AU2] Autentique — Webhooks — Webhooks, HTTPS POST, JSON, eventos de documentos/assinaturas, HMAC e eventos potencialmente duplicados.

# 17. Símbolo de Balança / Jota — Legal

| NÃO CONFIRMADO PUBLICAMENTE | Não foi localizada documentação pública suficiente para identificar com segurança a API do produto jurídico |
| --- | --- |

## Como conectar ao conector central

- API privada/contratual: principal hipótese de integração; pedir documentação oficial ao fornecedor/produto correto.

- Arquivo/SFTP: fallback possível se houver exportações/importações corporativas.

- Webhook: a confirmar caso exista mecanismo de eventos jurídicos.

## O que a documentação comprova

A pesquisa encontrou resultados públicos de JOTA em contextos diferentes e não encontrou documentação inequívoca para uma API de gestão jurídica correspondente ao produto citado no escopo.

Por segurança documental, não são afirmados endpoints, autenticação ou campos como fatos já comprovados.

## Dados enviados para o conector central

- Ao Hub: ID da demanda/processo, status, prazos, eventos e referências documentais, caso uma API seja disponibilizada.

## Dados enviados pelo conector central

- Identificador da empresa, colaborador quando necessário, referência da demanda, documentos e metadados jurídicos estritamente necessários.

## Dados que precisam ser armazenados para o trânsito

- solides_employee_id quando houver relação com pessoa; jota_reference_id; process_id; event_id; status; last_sync_at.

- Credential reference em Secret Manager.

## Implicações operacionais

- Antes de desenvolvimento, identificar exatamente o fornecedor/produto e pedir nome da API, base URL, OpenAPI, sandbox e escopos.

- Não usar resultados de busca de “JOTA API” de jornalismo ou produtos homônimos como evidência de uma API jurídica.

## Segurança e proteção de dados

- Documentos jurídicos podem conter dados pessoais ou estratégicos; aplicar acesso restrito.

- Evitar copiar conteúdo documental completo sem uma finalidade e repositório definido.

### Fontes primárias

# 18. SharePoint — Backup / Disaster Recovery

| CONFIRMADO | Microsoft Graph + OAuth/Entra ID; sites, drives e arquivos documentados |
| --- | --- |

## Como conectar ao conector central

- Microsoft Graph: API oficial para sites, lists, drives e driveItems do SharePoint.

- OAuth/Entra ID: aplicações corporativas usam tokens de acesso e permissões de aplicativo/delegadas.

- Permissões: a documentação permite trabalhar com níveis de privilégio; Sites.Selected/Files scopes devem ser avaliados conforme desenho.

## O que a documentação comprova

Microsoft Graph documenta leitura e gravação de lists, listItems e driveItems em SharePoint.

Arquivos podem ser referenciados por site/drive/item/path; o conteúdo pode ser recuperado via endpoints de driveItem.

A documentação de permissões recomenda escolher o menor privilégio compatível com a operação e diferencia permissões delegadas e de aplicação.

## Dados enviados para o conector central

- Ao Hub: file_id/drive_item_id, site_id, drive_id, caminho, tamanho, hash, modified_at, version e status de upload.

- Reconciliação: listar arquivos por pasta/ID e comparar checksum/version quando necessário.

## Dados enviados pelo conector central

- Backup JSON/CSV; relatórios; logs; documentos de integração; snapshots técnicos definidos pelo DR.

## Dados que precisam ser armazenados para o trânsito

- backup_id; sharepoint_site_id; drive_id; drive_item_id; file_path; file_name; file_hash; file_size; backup_timestamp; backup_status.

- tenant/client IDs e referência de certificado/secret em Secret Manager/Entra; nunca guardar segredo em metadata de arquivo.

## Implicações operacionais

- Definir RPO/RTO e retenção antes de escolher frequência de backup.

- Usar checksum para verificar integridade e detectar duplicidade.

- O SharePoint deve funcionar como repositório; o Hub não precisa manter segunda cópia integral indefinidamente.

## Segurança e proteção de dados

- Preferir permissões de menor privilégio; avaliar Sites.Selected quando compatível com o desenho.

- Separar containers/bibliotecas por ambiente e sensibilidade.

- Backups podem conter dados pessoais; proteger acesso e retenção.

### Fontes primárias

[M1] Microsoft Learn — SharePoint no Microsoft Graph — Sites, lists, drives e driveItems com leitura/escrita por Graph.

[M2] Microsoft Learn — driveItem — Acesso a arquivos por site/drive/item/path.

[M3] Microsoft Learn — Permissões — Permissões delegadas/aplicação e princípio de menor privilégio.

# 19. Síntese por padrão de integração

Quando as evidências são agrupadas pelo mecanismo técnico, o ecossistema mostra quatro padrões principais. A escolha do padrão deve seguir o processo de negócio e as capacidades documentadas do fornecedor, não preferência por uma tecnologia específica.

| Padrão | Ferramentas com evidência | Quando usar | Dados que ficam no Hub |
| --- | --- | --- | --- |
| REST + Token/API Key | Sólides, Flash, Alura, Correios, Loggi (conforme endpoint) | Operações síncronas/administrativas | IDs, status, request/response metadata |
| OAuth 2.0 | Wellhub, SharePoint/Microsoft Graph, Porto/SulAmérica conforme API autorizada | Integração máquina-a-máquina e APIs corporativas | client reference, token metadata, expiration; segredo no Vault |
| Webhook | Sólides, Loggi, Autentique, Vixting | Eventos rápidos e near-real-time | event_id, received_at, correlation_id, processing state |
| Arquivo/SFTP | Wellhub, possíveis cenários de SENAI/Edupulses/Saúde conforme contrato | Batch, legado ou ausência de API | batch_id, checksum, filename, period, counts |
| SSO | Alura, SENAI e possivelmente outros por contrato | Autenticação do usuário | metadata mínima de identidade; não substitui provisionamento |

# 20. Fluxos de negócio recomendados

## 20.1 Admissão

```text
Sólides -> webhook novo_colaborador
      -> Integration Hub valida evento
      -> resolve/creates external IDs
      -> Flash: benefícios
      -> Wellhub: eligibility CREATE
      -> Alura: cadastro de usuário
      -> Vixting: inicia onboarding
      -> Porto/SulAmérica/Clude/SENAI/Edupulses: conforme contrato
      -> grava status individual por adapter
```

## 20.2 Alteração cadastral

```text
Sólides -> webhook edicao_colaborador
      -> Hub determina quais atributos mudaram
      -> envia somente aos adapters afetados
      -> grava versão/status de cada operação
      -> reconciliação confirma convergência
```

## 20.3 Desligamento

```text
Sólides -> webhook demissao_colaborador
      -> Hub inicia workflow de saída
      -> Flash: tratar benefício
      -> Wellhub: DELETE eligibility
      -> Alura: tratar desativação conforme API/plano
      -> Vixting: encerra onboarding/processo
      -> Saúde/Seguro: exclusão conforme contrato
      -> SharePoint: garantir arquivamento/retention se aplicável
```

# 21. Confiabilidade: idempotência, retries e reconciliação

Integração por webhook não deve assumir exatamente-uma-vez. A prática segura é considerar que eventos podem ser reenviados, chegar fora de ordem ou falhar no processamento. A documentação do Autentique, por exemplo, explicita que eventos podem ser duplicados e não devem ser tratados como estritamente ordenados. O mesmo princípio é útil como padrão geral do Hub.

| Mecanismo | Regra | Exemplo |
| --- | --- | --- |
| Idempotência | Toda operação recebe uma chave única de negócio/evento. | Sólides event_id + employee_id + operation. |
| Deduplicação | Eventos já concluídos não executam novamente a ação. | Autentique event_id já processado -> ACK sem duplicar. |
| Retry | Somente falhas transitórias entram em retry; usar backoff. | HTTP 503 -> 1m, 5m, 15m, 1h. |
| Dead letter | Após limite, mandar para fila de exceção. | Falha permanente de validação -> DLQ. |
| Reconciliação | Consulta periódica compara estado central x parceiro. | Job diário de elegíveis Wellhub. |
| Observabilidade | Guardar correlation_id, adapter, duration, status, error_code. | REQ-20260930-001 / FLASH / 201. |

# 22. Segurança e LGPD

A camada de integração concentra identidade, benefícios, educação, documentos e potencialmente dados de saúde. Por isso, deve ser tratada como componente de segurança elevada. O OWASP API Security Top 10 destaca riscos como Broken Object Level Authorization, Broken Authentication, Broken Object Property Level Authorization, consumo irrestrito de recursos e exposição de dados. [O1]

- Segredos: armazenar API Keys, Client Secrets e tokens em Secret Manager/Vault; não no Git, banco de negócio ou logs.

- Menor privilégio: solicitar somente scopes/permissões necessários; no Microsoft Graph, avaliar Sites.Selected ou equivalente quando possível.

- Dados sensíveis: a ANPD trata dados de saúde como dados pessoais sensíveis; Clude/SST/Saúde exigem minimização e segregação.

- Logs: não registrar tokens, senhas, CPF completo ou conteúdo clínico/documental sem necessidade.

- Criptografia: TLS em trânsito e criptografia em repouso para dados armazenados.

- Auditoria: registrar quem/integration adapter/processou qual evento, quando e com qual resultado.

- Rotação: definir rotação de credenciais e expiração de tokens; nenhum token de curta duração deve ser tratado como segredo permanente.

# 23. Roadmap de implementação

1. Definir a Sólides como fonte de identidade e eventos e formalizar quais atributos são mestres.

2. Construir o Integration Hub com modelo de identidade externa, execução e auditoria.

3. Implementar primeiro adapters com API pública e forte documentação: Flash, Wellhub e Alura.

4. Implementar Autentique e Vixting para fechar ciclos de documento/onboarding com Webhooks.

5. Implementar logística (Correios/Loggi) e SharePoint conforme os processos reais de onboarding/DR.

6. Solicitar acesso formal aos catálogos de SulAmérica e Porto Seguro e documentação específica de produto.

7. Realizar discovery com Clude, SENAI, Edupulses, Sosthys e Jota para obter OpenAPI/SFTP/SSO/webhooks e sandbox.

8. Criar testes de contrato, carga, falhas de rede, duplicidade de evento e reconciliação.

9. Homologar LGPD, segurança, retenção e matriz de acesso antes da produção.

# 24. Checklist para solicitar aos fornecedores sem documentação pública completa

| Item solicitado | Por que importa | Obrigatório para |
| --- | --- | --- |
| OpenAPI/Swagger / GraphQL schema | Permite desenvolver adapter sem adivinhação. | Clude, SENAI, Edupulses, Sosthys, Jota e APIs contratadas de Saúde/Seguro. |
| Sandbox/homologação | Permite testar sem afetar produção. | Todos os fornecedores com API. |
| Método de autenticação | Define API Key, OAuth2, SAML, Basic, certificado etc. | Todos. |
| Eventos/Webhooks | Permite fluxo orientado a evento. | Admissão, desligamento, assinatura, tracking e status. |
| Rate limits e SLA | Evita bloqueio e ajuda a dimensionar retry/polling. | APIs de alto volume. |
| Modelo de IDs | Permite correlação e reconciliação. | Todos. |
| Política de erro | Permite diferenciar retry de erro funcional. | Todos. |
| Processo de rotação de credencial | Evita indisponibilidade e vazamento. | Todos os conectores autenticados. |
| Formato batch/SFTP | Fallback quando não houver API ou quando o processo for batch. | Wellhub e possíveis fornecedores sem API pública. |

# Fontes e documentação consultada

As referências abaixo priorizam documentação primária e páginas oficiais. O acesso foi considerado até 30 de setembro de 2026. Quando a documentação pública não expõe o contrato ou schema completo, isso é indicado explicitamente no relatório.

[S1] Sólides — Gestão API Docs — API de colaboradores, autenticação, webhooks e vínculos externos.

[F1] Flash — API 2.0 / Introdução — Visão geral da API, gestão de colaboradores e benefícios.

[F2] Flash — API de benefícios — Depósitos, pedidos, valores, status e autenticação por x-flash-auth.

[W1] Wellhub — API Getting Started — OAuth 2.0 Client Credentials, token de acesso, sandbox/produção e credenciais.

[W2] Wellhub — Eligibility API — Operações de inclusão, atualização e exclusão e campos do colaborador.

[W3] Wellhub — Migration FAQ — Transição da API legada para Clients API/OAuth 2.0 em 2026.

[S1A] SulAmérica — Portal de APIs / Integrações — Portal de APIs corporativas; catálogo específico depende de aprovação e acesso.

[C1] Clude — Plataforma de Saúde Mental — Informações institucionais; não foi localizada documentação pública completa de API corporativa.

[C2] Clude — Privacidade e Termos — Tratamento de dados e contexto de saúde mental.

[A1] Alura Empresas — API de inclusão de usuários — POST de cadastro; Bearer Token; nome, email, time e matrícula.

[A2] Alura Empresas — API de conclusão — Cursos concluídos, matrícula, curso, percentual, certificado e datas.

[A3] Alura Empresas — API de progresso — Cursos em progresso e consultas por período.

[A4] Alura Empresas — API de engajamento — Indicadores de engajamento por período e time.

[A5] Alura Empresas — SSO — SAML/LTI/TOKEN e outros mecanismos de autenticação suportados.

[N1] SENAI — Identidade SENAI — Identidade nacional e integração de aplicações; suporte a SSO.

[E1] Edupulses — Plataforma oficial — Quizzes, respostas em tempo real e exportação de resultados; API pública não localizada.

[C1C] Correios — Manual API Token — Token para APIs dos Correios; HTTPS/JSON; autenticação e requisitos contratuais.

[C2C] Correios — Manuais/API — Busca CEP, rastreamento, preço/prazo, pré-postagem e outros serviços.

[L1] Loggi — API Reference — Autenticação, cotação, pacotes, cancelamento, etiquetas e rastreamento.

[L2] Loggi — Webhook de rastreamento — Eventos de tracking em tempo real via HTTPS.

[P1] Porto Seguro — Portal do Desenvolvedor — APIs de produtos; sandbox e aprovação de aplicações.

[V1] Vixting — Integrações — API REST documentada, webhooks em tempo real, integração com ATS e eSocial; onboarding e SST.

[AU1] Autentique — API — API GraphQL, token Bearer, documentos e assinaturas.

[AU2] Autentique — Webhooks — Webhooks, HTTPS POST, JSON, eventos de documentos/assinaturas, HMAC e eventos potencialmente duplicados.

[M1] Microsoft Learn — SharePoint no Microsoft Graph — Sites, lists, drives e driveItems com leitura/escrita por Graph.

[M2] Microsoft Learn — driveItem — Acesso a arquivos por site/drive/item/path.

[M3] Microsoft Learn — Permissões — Permissões delegadas/aplicação e princípio de menor privilégio.

[O1] OWASP — API Security Top 10 (2023) — Riscos de autorização, autenticação, consumo de recursos e exposição de dados.

[LGPD1] ANPD — Direitos do titular / dados sensíveis — Saúde é dado pessoal sensível e recebe proteção específica na LGPD.

> **Limites da evidência**
>
> Onde o fornecedor não disponibilizou publicamente o contrato completo de integração, o relatório não inventa endpoints ou campos. Essas integrações são classificadas como parciais ou não confirmadas e recebem uma lista objetiva do que deve ser solicitado ao fornecedor. Isso torna o relatório utilizável como base de engenharia e também como checklist de discovery.
