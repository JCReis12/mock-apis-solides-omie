# Mapeamento de Integrações com a OMIE

## Objetivo

Mapear, para cada ferramenta analisada, se existe uma forma documentada ou tecnicamente possível de conexão com a plataforma OMIE e, principalmente, **qual mecanismo de integração pode ser utilizado**: API, token, Client ID/Secret, usuário e senha, WebService, webhook, arquivo ou middleware.

> **Legenda**
> - 🟢 **Integração direta/nativa:** existe mecanismo de integração específico com a OMIE.
> - 🟡 **Integração técnica/customizada:** a ferramenta possui API ou outro mecanismo que permite construir uma integração com a OMIE, normalmente usando middleware.
> - 🟠 **Integração dependente de configuração:** existe caminho técnico, mas é necessário validar município, produto, versão ou configuração.
> - 🔴 **A validar:** não foi encontrada documentação pública suficiente para confirmar uma API ou mecanismo de integração utilizável.

---

## Resumo geral

| Ferramenta | Conecta com OMIE? | Mecanismo | Conexão |
|---|---|---|---|
| Santander | 🟢 Sim | API + Client ID + Client Secret | Direta |
| Safra | 🟢 Sim | Integração bancária automática + usuário/senha | Direta |
| Bradesco | 🟢 Sim | API + Client ID + Client Secret | Direta |
| Flash | 🟢 Sim | API + App Key + App Secret | Direta |
| Excel / FDC | 🟡 Sim | API OMIE via Power Query, VBA, Office Scripts, código etc. | Customizada |
| Onfly | 🟢 Sim | Integração nativa + API / Client ID + Client Secret | Direta |
| Prefeitura de Sorocaba | 🟠 Depende | NFS-e / WebService / padrão fiscal | Via OMIE |
| Prefeitura de Santana de Parnaíba | 🟠 Depende | WebService / NFS-e Nacional | Via OMIE |
| Contábil Plus 10 | 🟠 Depende | API ou arquivos/layout contábil, conforme produto | Indireta |
| Outlook | 🟡 Sim | Microsoft Graph + OAuth 2.0 | Customizada |
| SAP Ariba | 🟡 Sim | APIs / Web Services | Middleware |
| Coupa | 🟡 Sim | REST API + OAuth 2.0 | Middleware |
| Autentique | 🟡 Sim | API GraphQL + Bearer Token + Webhooks | Middleware |
| Símbolo de Balança / JOTA | 🔴 A validar | API privada, exportação ou integração contratada | A confirmar |
| Padizzi | 🔴 A validar | API, arquivo ou outro mecanismo a confirmar | A confirmar |
| SharePoint | 🟡 Sim | Microsoft Graph + OAuth 2.0 | Customizada |

---

# 1. OMIE — ponto central

A OMIE disponibiliza APIs para integração com sistemas externos.

Entre os recursos disponíveis estão operações relacionadas a:

- Contas Correntes;
- Lançamentos;
- Contas a Pagar;
- Contas a Receber;
- Extrato;
- Movimentos Financeiros;
- outros recursos do ERP.

A autenticação da API do OMIE utiliza credenciais de aplicativo, principalmente:

```text
App Key
App Secret
```

Assim, quando uma ferramenta não possui integração nativa com o OMIE, uma arquitetura possível é:

```text
Ferramenta
    |
    | API / WebService / Arquivo / Webhook
    v
Middleware / Integração
    |
    | App Key + App Secret
    v
OMIE API
```

---

# 2. Santander

## Conexão com OMIE

**🟢 Integração direta e documentada.**

O OMIE possui integração específica com o Santander para operações bancárias.

## Mecanismo

```text
API
+
Client ID
+
Client Secret
```

## Possíveis dados/operações

- Extrato bancário;
- Boletos;
- Pix;
- baixa automática;
- informações de cobrança;
- conciliação financeira.

## Fluxo

```text
Santander
    |
    | API
    | Client ID
    | Client Secret
    v
OMIE
```

## Classificação

**Integração nativa/direta.**

Não é necessário criar um middleware próprio para o fluxo padrão suportado pelo OMIE.

---

# 3. Safra

## Conexão com OMIE

**🟢 Integração direta e documentada.**

O OMIE possui integração bancária automática com o Safra.

## Mecanismo

A documentação do OMIE utiliza:

```text
Usuário
+
Senha
```

Normalmente é recomendado utilizar um usuário com perfil limitado criado especificamente para a integração.

## Possíveis dados/operações

- Extrato;
- retorno de cobrança;
- retorno de pagamentos;
- baixas;
- conciliação.

## Fluxo

```text
Safra
    |
    | Usuário + Senha
    v
OMIE
```

## Classificação

**Integração bancária nativa/direta.**

É diferente de uma API REST com Client ID/Secret como ocorre em algumas outras instituições.

---

# 4. Bradesco

## Conexão com OMIE

**🟢 Integração direta via API.**

## Mecanismo

```text
API
+
Client ID
+
Client Secret
```

## Possíveis dados/operações

- Extrato;
- boleto;
- boleto + QR Code;
- Pix;
- baixa automática.

## Fluxo

```text
Bradesco
    |
    | API
    | Client ID
    | Client Secret
    v
OMIE
```

## Classificação

**Integração nativa/direta.**

---

# 5. Flash

## Conexão com OMIE

**🟢 Integração nativa documentada.**

A Flash possui integração específica com o OMIE.

## Mecanismo

A integração utiliza credenciais de aplicativo:

```text
App Key
+
App Secret
```

## Dados que podem ser enviados ao OMIE

- Reembolsos;
- prestações de contas;
- despesas;
- despesas de cartão corporativo;
- informações financeiras relacionadas às despesas.

## Fluxo

```text
Flash
    |
    | API
    | App Key
    | App Secret
    v
OMIE
```

## Classificação

**Integração nativa/direta.**

---

# 6. Excel / FDC

## Conexão com OMIE

**🟡 Tecnicamente possível, mas customizada.**

O Excel pode consumir a API do OMIE e enviar dados para o ERP.

## Mecanismos possíveis

- Power Query;
- VBA;
- Office Scripts;
- Power Automate;
- Python;
- Java;
- Node.js;
- outra aplicação capaz de realizar requisições HTTP.

## Autenticação no OMIE

```text
App Key
+
App Secret
```

## Fluxo

```text
Excel / FDC
     |
     | HTTP / JSON
     v
API OMIE
     |
     | App Key + App Secret
     v
OMIE
```

## Alternativa recomendada

Para uso corporativo, pode ser interessante utilizar um middleware:

```text
Excel
  |
  v
Middleware
  |
  | validação
  | transformação
  | logs
  | controle de duplicidade
  v
OMIE API
```

## Classificação

**Integração customizada.**

---

# 7. Onfly

## Conexão com OMIE

**🟢 Integração nativa com OMIE.**

A Onfly possui integração específica com o OMIE.

## Mecanismos

A integração pode utilizar:

```text
Integração nativa
```

e a Onfly também disponibiliza mecanismos de API para integrações customizadas, utilizando credenciais como:

```text
Client ID
+
Client Secret
```

## Dados que podem ser integrados

- Reembolsos;
- adiantamentos;
- prestações de contas;
- despesas;
- faturas;
- rateios;
- departamentos;
- projetos.

## Fluxo

```text
Onfly
   |
   | Integração / API
   v
OMIE
   |
   v
Contas a Pagar / Financeiro
```

## Classificação

**Integração nativa + possibilidade de integração customizada.**

---

# 8. Prefeitura de Sorocaba

## Conexão com OMIE

**🟠 Depende da configuração fiscal vigente.**

A relação é principalmente relacionada à emissão e processamento de NFS-e.

## Mecanismo

Pode envolver:

```text
NFS-e
+
WebService municipal
```

Além disso, o município está sujeito às mudanças de adoção do padrão nacional de NFS-e.

## Fluxo conceitual

```text
OMIE
   |
   | XML / WebService / padrão fiscal
   v
Prefeitura
   |
   v
NFS-e
```

## Observação

É necessário validar no próprio ambiente OMIE se o município está atualmente habilitado para emissão/integracão para o CNPJ utilizado.

## Classificação

**Integração fiscal via OMIE, dependente da configuração vigente.**

---

# 9. Prefeitura de Santana de Parnaíba

## Conexão com OMIE

**🟠 Existe caminho técnico, mas deve ser validado conforme o ambiente fiscal atual.**

A integração pode envolver:

```text
WebService
```

e o processo de migração/adequação ao:

```text
Padrão Nacional da NFS-e
```

## Fluxo

```text
OMIE
   |
   | WebService / NFS-e
   v
Prefeitura
```

## Classificação

**Integração fiscal via OMIE, dependente da configuração vigente.**

---

# 10. Contábil Plus 10

## Conexão com OMIE

**🟠 Depende da identificação exata do produto/versão.**

O caminho de integração contábil pode ocorrer através de:

- API;
- arquivos;
- layouts contábeis;
- exportação/importação;
- integração específica do sistema contábil.

## Fluxo possível

```text
OMIE
   |
   +--> API
   |
   +--> Arquivo / Layout
             |
             v
       Sistema Contábil
```

## Importante

Não é recomendado registrar como "API confirmada" sem identificar exatamente qual produto é o **Contábil Plus 10** utilizado pela empresa.

## Classificação

**Integração contábil a validar.**

---

# 11. Outlook

## Conexão com OMIE

**🟡 Tecnicamente possível via Microsoft Graph.**

Não foi identificada uma integração nativa específica Outlook ↔ OMIE.

## Mecanismo

```text
Microsoft Graph API
+
Microsoft Entra ID
+
OAuth 2.0
+
Access Token
```

## Fluxo

```text
Outlook
   |
   | Microsoft Graph
   | OAuth 2.0
   v
Middleware
   |
   | OMIE API
   v
OMIE
```

## Exemplo de utilização

Uma caixa de e-mail financeira poderia receber:

- notas fiscais;
- boletos;
- comprovantes;
- documentos;
- solicitações financeiras.

O middleware poderia interpretar/processar essas informações e posteriormente enviar dados ao OMIE.

## Classificação

**Integração customizada via API.**

---

# 12. SAP Ariba

## Conexão com OMIE

**🟡 Tecnicamente possível.**

O SAP Ariba possui APIs e Web Services para integração com sistemas externos.

## Mecanismos

- APIs;
- Web Services;
- integrações empresariais;
- formatos estruturados de dados.

## Fluxo

```text
SAP Ariba
    |
    | API / Web Service
    v
Middleware
    |
    | API OMIE
    v
OMIE
```

## Possível cenário

Como o Ariba está sendo considerado no contexto de RFPs:

```text
RFP
 |
 v
SAP Ariba
 |
 | API
 v
Middleware
 |
 | transformação
 v
OMIE
```

## Classificação

**Integração customizada via middleware.**

Não foi identificada uma integração nativa Ariba ↔ OMIE.

---

# 13. Coupa

## Conexão com OMIE

**🟡 Tecnicamente possível via API.**

O Coupa possui API REST para integração com sistemas externos.

## Mecanismo

```text
REST API
+
OAuth 2.0 / OpenID Connect
```

## Fluxo

```text
Coupa
   |
   | REST API
   | OAuth 2.0
   v
Middleware
   |
   | OMIE API
   v
OMIE
```

## Dados possíveis

Dependendo dos recursos utilizados no Coupa:

- solicitações;
- compras;
- fornecedores;
- documentos;
- informações financeiras;
- dados relacionados a processos de procurement.

## Classificação

**Integração customizada via middleware.**

---

# 14. Autentique

## Conexão com OMIE

**🟡 Tecnicamente possível via API e Webhooks.**

O Autentique possui API pública.

## Mecanismo

A API utiliza:

```text
API GraphQL
+
Bearer Token
```

Endpoint documentado:

```text
https://api.autentique.com.br/v2/graphql
```

Também existem:

```text
Webhooks
```

para receber eventos relacionados aos documentos.

## Fluxo

```text
Autentique
    |
    | Webhook
    v
Middleware
    |
    | API
    v
OMIE
```

## Exemplo

```text
Documento criado
      |
      v
Autentique
      |
      v
Documento assinado
      |
      v
Webhook
      |
      v
Middleware
      |
      v
OMIE
```

## Classificação

**Integração customizada via API + Webhook.**

---

# 15. Símbolo de Balança / JOTA

## Conexão com OMIE

**🔴 Não confirmada publicamente.**

Não foi encontrada documentação pública suficiente para confirmar:

- API pública;
- API REST;
- GraphQL;
- OAuth;
- token;
- webhook;
- integração direta com OMIE.

## Possibilidades que devem ser investigadas com o fornecedor

```text
API
Webhook
Exportação CSV
Exportação Excel
XML / JSON
Integração privada
Integração via parceiro
```

## Fluxo caso exista API

```text
JOTA
  |
  | API / Webhook
  v
Middleware
  |
  | OMIE API
  v
OMIE
```

## Classificação

**Integração a validar com o fornecedor.**

---

# 16. Padizzi

## Conexão com OMIE

**🔴 Não confirmada publicamente.**

Não foi encontrada documentação pública suficiente para confirmar uma API específica da ferramenta que permita estabelecer uma conexão direta com o OMIE.

## Possibilidades a investigar

- API;
- Webhook;
- CSV;
- Excel;
- XML;
- JSON;
- integração privada;
- integração disponibilizada mediante contratação.

## Fluxo possível

```text
Padizzi
   |
   | API / Arquivo / outro mecanismo
   v
Middleware
   |
   | OMIE API
   v
OMIE
```

## Classificação

**Integração a validar com o fornecedor.**

---

# 17. SharePoint

## Conexão com OMIE

**🟡 Tecnicamente possível via Microsoft Graph.**

O SharePoint pode ser integrado através do Microsoft Graph.

## Mecanismo

```text
Microsoft Graph
+
Microsoft Entra ID
+
OAuth 2.0
+
Access Token
```

## Fluxo

```text
SharePoint
    |
    | Microsoft Graph
    v
Middleware
    |
    | OMIE API
    v
OMIE
```

## Para o cenário de Backup / Disaster Recovery

Uma utilização mais coerente seria:

```text
OMIE
 |
 +-- XML
 +-- PDF
 +-- comprovantes
 +-- relatórios
 +-- documentos fiscais
 |
 v
Middleware
 |
 v
SharePoint
```

Nesse cenário, o SharePoint seria principalmente o **destino de armazenamento/backup**, e não uma fonte de dados financeiros do OMIE.

## Classificação

**Integração customizada via Microsoft Graph.**

---

# 18. Comparação dos mecanismos de autenticação

| Ferramenta | Autenticação / mecanismo principal |
|---|---|
| Santander | Client ID + Client Secret |
| Safra | Usuário + Senha |
| Bradesco | Client ID + Client Secret |
| Flash | App Key + App Secret |
| Excel/FDC | Credenciais da API OMIE: App Key + App Secret |
| Onfly | Integração nativa / Client ID + Client Secret para API |
| Prefeitura de Sorocaba | WebService / NFS-e |
| Prefeitura de Santana de Parnaíba | WebService / NFS-e Nacional |
| Contábil Plus 10 | API ou arquivo/layout, a validar |
| Outlook | OAuth 2.0 + Microsoft Graph |
| SAP Ariba | API / Web Services |
| Coupa | OAuth 2.0 / OpenID Connect + REST API |
| Autentique | Bearer Token + GraphQL + Webhooks |
| JOTA | A validar |
| Padizzi | A validar |
| SharePoint | OAuth 2.0 + Microsoft Graph |

---

# 19. Classificação final por tipo de conexão

## API + credenciais

```text
Santander
Bradesco
Flash
Onfly
Excel/FDC
Outlook
SAP Ariba
Coupa
Autentique
SharePoint
```

## Usuário + senha

```text
Safra
```

## WebService / integração fiscal

```text
Prefeitura de Sorocaba
Prefeitura de Santana de Parnaíba
```

## Arquivo / layout contábil ou API a validar

```text
Contábil Plus 10
```

## API / mecanismo ainda não confirmado

```text
Símbolo de Balança / JOTA
Padizzi
```

---

# 20. Visão de arquitetura

Uma arquitetura geral para o ecossistema seria:

```text
                         ┌─────────────────────┐
                         │        OMIE         │
                         │                     │
                         │    API / ERP        │
                         └─────────┬───────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
       Integrações             Integrações           Fiscal /
         nativas                customizadas         Contábil
             │                     │                     │
   ┌─────────┼─────────┐     ┌─────┼──────────┐    ┌─────┼─────────┐
   │         │         │     │     │          │    │     │         │
Santander  Safra   Bradesco Outlook Coupa  SharePoint NFS-e Contábil
   │         │         │       │      │          │      │     │
 Flash      Onfly      │      Ariba  Autentique   │      │     │
                       │                         │
                       └───────────┬─────────────┘
                                   │
                              Middleware
                                   │
                            API / Webhook /
                          Arquivo / Integração
```

---

# 21. Pontos que ainda precisam de validação

Antes de considerar o mapa como definitivo, os seguintes pontos devem ser confirmados:

### JOTA / Símbolo de Balança

Solicitar ao fornecedor:

- Existe API?
- Qual protocolo?
- Existe documentação?
- Utiliza API Key, Bearer Token ou OAuth?
- Existem Webhooks?
- Existe exportação estruturada?
- Existe integração com ERP?

### Padizzi

Solicitar ao fornecedor:

- Existe API?
- Existe integração com OMIE?
- Existe exportação CSV/Excel/XML/JSON?
- Existe webhook?
- Qual mecanismo é utilizado para fornecer os dados financeiros?

### Contábil Plus 10

Confirmar:

- fabricante;
- versão;
- produto exato;
- existência de API;
- layouts de importação/exportação;
- integração contábil já disponível no ambiente OMIE.

### Prefeituras

Confirmar no OMIE:

- disponibilidade atual do município;
- WebService utilizado;
- padrão NFS-e atual;
- necessidade de certificado;
- credenciais fiscais;
- configuração específica por CNPJ.

---

# 22. Conclusão

A maior parte das ferramentas pode ser relacionada ao OMIE por algum mecanismo técnico, mas existem diferenças importantes.

### Conexões nativas/diretas

```text
Santander
Safra
Bradesco
Flash
Onfly
```

### Conexões customizadas por API

```text
Excel/FDC
Outlook
SAP Ariba
Coupa
Autentique
SharePoint
```

### Conexões fiscais/contábeis

```text
Prefeitura de Sorocaba
Prefeitura de Santana de Parnaíba
Contábil Plus 10
```

### Conexões ainda dependentes de fornecedor

```text
Símbolo de Balança / JOTA
Padizzi
```

O padrão mais comum para uma integração customizada é:

```text
[Ferramenta]
      |
      | API / WebService / Webhook / Arquivo
      v
[Middleware]
      |
      | transformação + validação + logs
      |
      | App Key + App Secret
      v
[OMIE API]
```

Já nas integrações nativas, o middleware pode ser dispensado:

```text
[Ferramenta]
      |
      | API / credenciais
      v
[OMIE]
```

---

## Referências principais

- OMIE Developer: https://developer.omie.com.br/
- OMIE — Lista de serviços/API: https://developer.omie.com.br/service-list/
- OMIE — Características das APIs: https://ajuda.omie.com.br/pt-BR/articles/5412721-caracteristicas-e-recomendacoes-das-apis-do-omie
- OMIE — Santander: https://ajuda.omie.com.br/pt-BR/articles/9942526-configurando-a-integracao-com-o-banco-santander-extrato-via-api
- OMIE — Bradesco: https://ajuda.omie.com.br/pt-BR/articles/10127532-configurando-a-integracao-api-com-o-bradesco
- OMIE — Safra: https://ajuda.omie.com.br/pt-BR/articles/3943249-configurando-a-integracao-com-o-banco-safra
- Flash — Integração com OMIE: https://faq.flashapp.com.br/kb/guide/pt-BR/como-configurar-a-integracao-do-flash-com-o-erp-omie-MW9ijZALPl/Steps/5774452
- Onfly — Integração com OMIE: https://www.onfly.com.br/blog/onfly-modulo-de-integracao-com-o-erp-omie/
- Microsoft Graph — Outlook: https://learn.microsoft.com/pt-br/graph/api/resources/mail-api-overview
- Microsoft Graph — SharePoint: https://learn.microsoft.com/pt-br/graph/api/resources/sharepoint
- Coupa Core API: https://docs.coupa.com/en/developer-documentation/the-coupa-core-api/coupa-core-api-overview
- Autentique API: https://docs.autentique.com.br/api/2/
