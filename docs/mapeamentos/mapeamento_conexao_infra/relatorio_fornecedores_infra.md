# Relatório de conexões: Financeiro (Omie) e RH (Sólides)

**Projeto:** Centralização de dados (RH + Financeiro)
**Data:** 1º de outubro de 2026

## Status deste relatório: standby

As ferramentas, empresas e fornecedores listados aqui ficaram em **standby**. O foco do projeto é primeiro as **ferramentas reais**, ou seja, os sistemas com integração estruturada disponível (API, CNAB, XML de NF-e, portal), e não fornecedores ou contatos que se comunicam apenas por e-mail.

Mesmo assim, para cada item deste relatório foi **estipulada uma possível conexão**, servindo de mapa de referência para quando esses fornecedores entrarem no escopo de integração. Nada aqui deve ser tratado como decisão de implementação, apenas como planejamento futuro.

## Contexto e regras aplicadas

O documento do projeto define: **Omie** é o central financeiro, **Sólides** é o central de RH e **BigQuery** é a base de centralização e histórico. A regra de decisão (seção 5.3) se aplica: dado de uso imediato vai ao central, dado de análise e histórico vai ao BigQuery.

**Avisos importantes:**

- O documento diz, na seção 5.1, que informações que chegam por e-mail estão fora do escopo atual do projeto. Isso é exatamente o motivo do standby dos itens deste relatório. As propostas para conectar notificações por e-mail foram tratadas como [SUGESTÃO], e não como decisão do projeto.
- BRFour, Padizzi, Ourho, VT Privado, Techsocial e Hit Communications não puderam ser confirmadas em fontes públicas confiáveis. Para essas, tudo está marcado como [A CONFIRMAR] e foi trabalhado apenas com a categoria informada.
- "Perícia Forense" e "G Group" são nomes genéricos, sem empresa específica identificável, marcados como [GENÉRICO].

**Mecanismos confirmados em fontes públicas:**

- Omie: API pública v1 para contas a pagar, contas a receber e contas correntes; importação de XML de NF-e; integração bancária via CNAB de pagamento, cobrança e extrato.
- Sólides: API REST documentada com token de integração para o software de DP; Integrador de Aplicações para conectar folha de pagamento ao ecossistema de RH.

## Tabela resumo das 21 conexões

| Item | Sessão | Destino | Mecanismo | Status | Prioridade |
|---|---|---|---|---|---|
| BRFour | 1. DP/People | Sólides + Omie | Dados de folha via API Sólides, fatura mensal no Omie | A confirmar | Média |
| Padizzi | 1. DP/People | Sólides + Omie | Mesmo padrão do BRFour, verificar formato de entrega | A confirmar | Média |
| G Group | 1. Limpeza | Omie + BigQuery | Fatura mensal como conta a pagar com centro de custo de facility | Genérico | Baixa |
| Arquida | 1. Seguros | Omie + BigQuery | Faturas de apólices no Omie, cobertura e sinistros no BigQuery | A confirmar | Baixa |
| Ourho | 1. Temp | BigQuery + Omie | Headcount temporário analítico e fatura mensal no Omie | A confirmar | Média |
| VT Privado | 1. Benefício | Sólides + Omie | Concessões por CPF no RH, recarga como conta a pagar | A confirmar | Média |
| SindPD | 1. Sindicato | Sólides + Omie | Convenção coletiva no RH, guias e contribuições no Omie | Confirmado | Média |
| eSocial | 1. Obrigação legal | Sólides + BigQuery | Transmissão pela Sólides, eventos extraídos para o histórico | Confirmado | Alta |
| TecBan | 2. Cliente | Omie | Contas a receber recorrentes com conciliação bancária | Confirmado | Média |
| Nimbi | 2. Cliente | Omie | Pedidos e faturamento integrados ao ERP | Confirmado | Média |
| Bradesco | 2. Banco | Omie | CNAB de cobrança e conciliação bancária via integração automática | Confirmado | Alta |
| Techsocial | 2. Cliente | Omie | Contas a receber recorrentes por contrato | A confirmar | Média |
| Claro Empresas | 3. Telco | Omie | Boleto por e-mail convertido em conta a pagar | Confirmado | Média |
| Vivo Empresas | 3. Telco | Omie | Boleto por e-mail convertido em conta a pagar | Confirmado | Média |
| Hit Communications | 3. Distribuidor telco | Omie | Boleto por e-mail convertido em conta a pagar | A confirmar | Média |
| VNO | 3. Distribuidor internet | Omie | Boleto por e-mail convertido em conta a pagar | A confirmar | Média |
| Ingram Micro | 3. Licenças | Omie + BigQuery | Conta a pagar do pedido e custo por cliente no BigQuery | Confirmado | Média |
| TD SYNNEX | 3. Cloud | Omie + BigQuery | Conta a pagar recorrente e custo por cliente no BigQuery | Confirmado | Média |
| Lenovo | 3. Hardware | Omie + BigQuery | XML de NF-e como conta a pagar e controle de ativo por time | Confirmado | Média |
| Parque Tecnológico de Sorocaba | 3. Facility | Omie | Boleto fixo recorrente de aluguel | Confirmado | Baixa |
| Perícia Forense | 3. Serviço | Omie | NF-e ou boleto importado pontualmente | Genérico | Baixa |

**Legenda de status:**

- **Confirmado:** identidade ou função verificada em fonte pública.
- **A confirmar:** empresa não pôde ser confirmada, categoria veio do usuário.
- **Genérico:** nome genérico sem empresa específica identificável.

---

## Sessão 1, Entradas e fornecedores externos de DP / People

Lógica da sessão: dado de pessoa vai para a Sólides ou BigQuery, dinheiro vai para o Omie, e o CPF ou matrícula é o identificador que amarra tudo.

### BRFour (DP) [A CONFIRMAR]

- Terceirização de departamento pessoal. Produz folha processada, proventos e admissões e demissões de terceirizados.
- A pergunta que decide tudo: qual formato de entrega, arquivo estruturado, API ou só PDF por e-mail.
- Fluxo estipulado: dados de proventos e movimentações entram na Sólides via API ou Integrador de Aplicações, usando CPF como identificador comum (seção 7.5 do documento). Fatura mensal vira conta a pagar no Omie. Histórico vai ao BigQuery.

### Padizzi (DP) [A CONFIRMAR]

- Mesmo padrão do BRFour.
- Ponto crítico: descobrir com o fornecedor se ele entrega arquivo estruturado, API ou só PDF e e-mail, porque isso muda o esforço de integração.

### G Group (Limpeza) [GENÉRICO]

- Terceirizados de limpeza não entram na folha própria, isso é erro comum.
- Fluxo estipulado: fatura mensal como conta a pagar no Omie com centro de custo de facility, custo alimenta o motor de custos no BigQuery.
- Frequência: mensal fixa.

### Arquida (Seguros) [A CONFIRMAR]

- Apólices, endossos e faturas de seguro, possivelmente de vida e outros benefícios.
- Fluxo estipulado: fatura de apólice como conta a pagar no Omie; detalhe de cobertura e sinistro por colaborador no BigQuery, vinculado por CPF.
- Atenção a LGPD: dado de saúde e benefício é sensível, com controle de acesso por área.

### Ourho (Temp) [A CONFIRMAR]

- Trabalho temporário. Produz headcount temporário, rotatividade e faturamento mensal.
- Headcount temporário é dado analítico, não cadastral. Se a Sólides não comportar não empregados, fica no BigQuery como métrica de workforce externo.
- Fatura mensal no Omie.

### VT Privado (Benefício) [A CONFIRMAR]

- Concessão e recarga por CPF ou matrícula no RH, pagamento da recarga como conta a pagar no Omie.
- O dado por colaborador é o que alimenta o motor de custos.

### SindPD (Sindicato) [CONFIRMADO]

- Sindicato dos Trabalhadores em TI do Estado de São Paulo, maior da categoria, com convenção coletiva anual que define reajustes e contribuição assistencial.
- Fluxo estipulado: percentuais e pisos da convenção alimentam a Sólides para reajuste salarial e datas base; guias e boletos de contribuição vão ao Omie como contas a pagar.
- Risco: erro aqui vira passivo trabalhista, então conferência manual vale a pena mesmo com automação.

### eSocial (Obrigação legal) [CONFIRMADO]

- A Sólides, como software de DP, transmite os eventos nativamente. Integração nova aqui é desnecessária e errada.
- Trabalho real: extrair os eventos enviados (folha, encargos, FGTS, INSS) para o BigQuery como fonte oficial e histórica.
- Guias apuradas viram contas a pagar no Omie, alimentando provisões.
- Integração direta Omie e eSocial não faz sentido, são contextos diferentes.

---

## Sessão 2, Conexões de clientes / customer

Toda a sessão é receita, todo fluxo é contas a receber no Omie. Sólides não entra salvo contratos ligados a horas de equipe interna.

### Bradesco (Banco) [CONFIRMADO]

- Prioridade máxima da sessão e provavelmente do projeto inteiro, porque é integração nativa do Omie.
- Fluxo: CNAB de cobrança para emissão e baixa de boletos; extrato para conciliação automática.
- Pré-requisito: confirmar que o Bradesco está entre os bancos suportados pela integração automática do Omie e habilitar no gerenciador do banco.

### TecBan (Cliente) [CONFIRMADO / PARCIALMENTE A CONFIRMAR]

- Confirmado: TecBan é a dona da rede Banco24Horas, maior rede de autoatendimento multibancário do Brasil, e hoje também opera APIs de serviços bancários.
- A confirmar: qual serviço a empresa presta a ela, se aluguel de espaço para caixas ou outro contrato. Não assumir a natureza antes de confirmar.
- Fluxo estipulado: contas a receber recorrentes mensais no Omie com conciliação bancária para baixa automática.

### Nimbi (Cliente) [CONFIRMADO / LEITURA A CONFIRMAR]

- Confirmado: plataforma brasileira de e-procurement e marketplace B2B com integração a ERP.
- A confirmar: qual das duas leituras vale. Se a empresa vende via marketplace, integrar pedidos de venda ao Omie. Se a empresa compra via Nimbi, é fluxo de pedidos de compra, e o item deveria migrar de sessão.

### Techsocial (Cliente) [A CONFIRMAR]

- Contrato ou licenças recorrentes, faturamento a confirmar.
- Fluxo estipulado: contas a receber recorrentes no Omie com vencimento fixo; histórico de faturamento por cliente no BigQuery para análise de receita.

---

## Sessão 3, Fornecedores recorrentes

Nove fornecedores com o mesmo comportamento: boleto e notificação por e-mail. Não faz sentido construir integração por fornecedor, faz sentido construir o duto uma vez e apontar os nove para ele. Como todos dependem de e-mail, esta sessão inteira permanece em standby por enquanto.

### Claro Empresas, Vivo Empresas, Hit Communications e VNO (Telco e distribuidores)

- Fatura mensal com variação de consumo.
- Fluxo estipulado: boleto lido da caixa de entrada financeira, código de barras, vencimento e valor extraídos, conta a pagar criada no Omie, documento guardado no histórico.
- Regra: casos ambíguos ou duplicados vão para fila de revisão humana, nunca lançam direto.

### Ingram Micro (Licenças) e TD SYNNEX (Cloud)

- Ingram: pedidos de licenças de software, valor maior, ligados a clientes finais.
- TD SYNNEX: assinaturas de cloud com cobrança recorrente por usuário ou licença.
- Fluxo estipulado: conta a pagar no Omie e detalhamento da fatura no BigQuery amarrado ao cliente final, porque é insumo direto de margem.
- Vale investigar portal ou API antes de depender só de e-mail, distribuidores desse porte quase sempre têm canal eletrônico.

### Lenovo (Hardware)

- Compra pontual ou em lote.
- Fluxo estipulado: XML de NF-e importado nativamente no Omie como conta a pagar; bem registrado como ativo vinculado ao time que recebeu, para o motor de custos.

### Parque Tecnológico de Sorocaba (Facility)

- Aluguel e condomínio, boleto fixo mensal com valor estável.
- Caso mais fácil de todos: lançamento recorrente pré-definido no Omie, com conferência só de variação.

### Perícia Forense [GENÉRICO]

- Serviço pontual ou sob demanda, NF-e avulsa.
- Automatizar aqui é desperdício: importar o XML no Omie e classificar a despesa.

---

## Notificações por e-mail, três níveis

> As notificações por e-mail estão fora do escopo atual do projeto (seção 5.1 do documento). O que segue é sugestão para quando os itens saírem do standby.

**Nível 1, mínimo, sem desenvolvimento**

- Criar caixas de entrada dedicadas, uma financeira e uma de DP, com regra de encaminhamento de todo boleto e XML recebido.
- Importação nativa de XML de NF-e no Omie e lançamento assistido.
- Organiza a origem dos dados, não automatiza, mas é pré-requisito do resto.

**Nível 2, intermediário**

- Serviço de ingestão que monitora a caixa financeira, extrai dados do boleto (código de barras, vencimento, valor, CNPJ do emissor), cruza com o cadastro de fornecedores do Omie e cria a conta a pagar via API.
- Casos ambíguos vão para fila de revisão humana.
- Atinge os nove fornecedores da sessão 3 de uma vez.

**Nível 3, alto, por fornecedor**

- Buscar API ou portal onde existir. Três casos concretos hoje:
  1. CNAB com o Bradesco.
  2. API da Sólides para dados de DP.
  3. Canal eletrônico dos distribuidores grandes (Ingram, TD SYNNEX).