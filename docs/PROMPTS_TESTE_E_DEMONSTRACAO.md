# Prompts de Teste e Demonstração — Agente de Gestão de Custos

---

## 1. Custo Consolidado Completo por ID (Cruzamento Sólides + Omie + Onfly/Flash)
**Situação de uso:** Quando o gestor deseja consultar o custo total mensal de um colaborador informando apenas o ID da Sólides (`101`) e o período (`2026-10`), fazendo o agente buscar o salário/benefícios na Sólides, descobrir o CPF e somar todas as despesas variáveis (viagens, hospedagens e reembolsos) lançadas no Omie.

```text
Qual foi o custo total consolidado da colaboradora de ID 101 no período 2026-10? Apresente um demonstrativo separando os custos fixos de RH (Sólides), o detalhamento das despesas variáveis financeiras (Omie, indicando se vieram da Onfly ou Flash) e o valor total mensal.
```

---

## 2. Fechamento Mensal Buscando Apenas pelo Nome do Colaborador
**Situação de uso:** Quando o gestor não sabe o ID nem o CPF do colaborador e solicita o fechamento de custos de um mês específico (`2026-09`) informando apenas o nome completo (`Ana Beatriz Souza`).

```text
Preciso do fechamento de custos da colaboradora Ana Beatriz Souza referente ao mês de setembro de 2026 (2026-09). Quanto ela custou no total para a empresa nesse mês?
```

---

## 3. Colaborador sem Despesas Variáveis ou Reembolsos no Período
**Situação de uso:** Quando o colaborador possui apenas custos fixos de folha e benefícios na Sólides e não teve nenhum gasto variável ou reembolso registrado no Omie naquele mês (`ID 102` em `2026-10`), validando que o agente retorna `R$ 0,00` de custo variável sem inventar lançamentos.

```text
Consulte o custo mensal consolidado do colaborador Carlos Eduardo Lima (ID 102) na competência 2026-10. Ele teve algum reembolso ou despesa variável lançada no Omie nesse período?
```

---

## 4. Análise Comparativa de Variação de Custos entre Dois Meses
**Situação de uso:** Quando a liderança precisa entender por que o custo de um mesmo colaborador aumentou de um mês para o outro (`2026-09` vs. `2026-10`) e quais lançamentos específicos no Omie causaram essa diferença.

```text
Compare o custo total da colaboradora Ana Beatriz Souza (ID 101) entre os períodos 2026-09 e 2026-10. Qual foi a diferença em reais (R$) entre os dois meses e quais lançamentos no Omie explicam essa variação?
```

---

## 5. Consolidação Executiva de Custos da Equipe (Múltiplos Colaboradores)
**Situação de uso:** Quando a diretoria solicita um panorama comparativo entre colaboradores de diferentes áreas (`ID 101` de Tecnologia e Dados e `ID 102` do Financeiro) e o custo total somado da equipe na competência (`2026-10`).

```text
Gere um resumo executivo para a diretoria comparando os custos totais dos colaboradores 101 (Ana Beatriz Souza) e 102 (Carlos Eduardo Lima) no período 2026-10, informando também a soma geral de custo dos dois colaboradores juntos para a Inovanet.
```

---

## 6. Auditoria de Gastos Variáveis por Plataforma Integrada (Onfly vs. Flash)
**Situação de uso:** Quando o setor financeiro deseja auditar as despesas variáveis de um colaborador no Omie separando quanto veio de viagens/hospedagem (`Onfly - Refund`) e quanto veio de reembolsos gerais (`Flash - Gestão de Despesas`).

```text
Considerando as despesas variáveis da colaboradora ID 101 em outubro de 2026 (2026-10) no Omie, quanto foi gasto especificamente via "Onfly - Refund" (viagens e hospedagem) e quanto foi gasto via "Flash - Gestão de Despesas"?
```

---

## 7. Auditoria Comparativa de Benefícios Fixos de RH (Sólides)
**Situação de uso:** Quando o RH ou gestor deseja comparar apenas a estrutura de remuneração fixa e benefícios (VR/VA, Plano de Saúde SulAmérica, Wellhub e Auxílio Home Office) entre colaboradores na Sólides.

```text
Detalhe e compare a composição dos benefícios fixos mensais na Sólides dos colaboradores 101 (Ana Beatriz Souza) e 102 (Carlos Eduardo Lima). Qual é a diferença de valor em benefícios entre eles e o que explica essa diferença?
```
