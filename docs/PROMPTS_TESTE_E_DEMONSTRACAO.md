# Prompts de Teste e Demonstração — Agente de Gestão de Custos & Pessoas (Inovanet)

Este documento reúne os prompts ideais para homologar o agente no **Gemini Enterprise (Vertex AI Agent Builder)**, explorando os novos nós de decisão, busca por nome, detalhamento de benefícios e observabilidade de integrações.

---

## 1. Descoberta e Fechamento Buscando Apenas pelo Primeiro Nome
**O que testa:** O agente não sabe o ID nem o CPF. Ele primeiro invoca `listar_colaboradores_solides` com o filtro de nome, descobre que é a Mariana Costa (ID 103, CPF `456.789.012-34`) e em seguida consulta o Omie para apurar os gastos do mês.

```text
Qual foi o custo total da Mariana no mês de outubro de 2026 (2026-10)? Busque os dados dela de folha e benefícios na Sólides e depois verifique se ela teve despesas ou reembolsos registrados no Omie.
```

---

## 2. Consolidação Financeira Completa com Reembolsos Comerciais
**O que testa:** Colaborador de vendas (Rodrigo Silva, ID 104) que viajou para atender clientes via Onfly (passagem e hospedagem) e lançou jantares com clientes via Flash.

```text
Apresente o demonstrativo de custos do colaborador Rodrigo Silva Santos (ID 104) referente a 2026-10. Separe o que é salário e benefícios fixos na Sólides do que foram despesas de viagem corporativa (Onfly) e reembolsos de alimentação (Flash) no Omie.
```

---

## 3. Investigação Detalhada de Benefícios People (SulAmérica, Wellhub e Capacitação)
**O que testa:** O agente invoca o novo nó `consultar_beneficios_detalhados_people` para apurar a cobertura de plano de saúde, seguro de vida Porto Seguro, uso de academia Wellhub e cursos Alura/Senai da colaboradora.

```text
Quais são os benefícios corporativos ativos da colaboradora Ana Beatriz Souza (ID 101)? Ela possui dependentes no plano de saúde SulAmérica e está utilizando a licença da Alura ou o Wellhub?
```

---

## 4. Fechamento Consolidado por Canal (Onfly vs Flash vs Direto Omie)
**O que testa:** O agente utiliza o novo endpoint `consultar_fechamento_consolidado_omie` para totalizar e categorizar os gastos variáveis sem precisar somar item a item manualmente.

```text
Gere um resumo financeiro das despesas variáveis de outubro de 2026 da colaboradora com CPF 456.789.012-34 (Mariana). Quanto do valor foi investido em infraestrutura direta e quanto foi reembolso via Flash?
```

---

## 5. Auditoria de Saúde das Integrações e Conectores do Ecossistema
**O que testa:** O agente utiliza o endpoint de telemetria `consultar_status_integracoes_people` para auditar quais sistemas do ecossistema estão disponíveis, quais estão degradados (como o Omie e o SharePoint) e quais estão em manutenção ou aguardando configuração.

```text
Como está a saúde e a disponibilidade dos conectores e sistemas integrados do ecossistema Inovanet? Houve alguma instabilidade ou erro recente reportado no Omie, na Flash ou no SharePoint?
```

---

## 6. Comparativo entre Departamentos (Tecnologia vs Comercial)
**O que testa:** Múltiplas etapas lógicas: o agente lista os colaboradores das áreas de Tecnologia e Comercial, extrai salários, benefícios e gastos de viagem, gerando uma visão executiva consolidada.

```text
Faça uma comparação do custo da Mariana Ribeiro Costa (Tecnologia/Infra) com o Rodrigo Silva Santos (Comercial) em 2026-10. Quem teve o maior gasto com despesas variáveis e qual foi o motivo principal dessa diferença?
```

---

## 7. Colaborador sem Despesas Variáveis (Validação de R$ 0,00)
**O que testa:** Garantir que o agente não inventa dados quando um colaborador não possui despesas no Omie.

```text
Consulte o custo mensal do Carlos Eduardo Lima (ID 102) em 2026-10. Ele gerou alguma despesa variável ou reembolso no Omie nesse mês?
```
