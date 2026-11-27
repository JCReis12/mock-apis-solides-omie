# Padrão de Commits e Fluxo de Versionamento

## Índice

1. [Objetivo](#1-objetivo)
2. [Estrutura obrigatória do commit](#2-estrutura-obrigatória-do-commit)
3. [Tipos de commit permitidos](#3-tipos-de-commit-permitidos)
4. [Regras para a descrição](#4-regras-para-a-descrição)
5. [Uma alteração lógica por commit](#5-uma-alteração-lógica-por-commit)
6. [Identificação do desenvolvedor](#6-identificação-do-desenvolvedor)
7. [Cards do GLPI](#7-cards-do-glpi)
8. [Padrão de branches](#8-padrão-de-branches)
9. [Fluxo de desenvolvimento](#9-fluxo-de-desenvolvimento)
10. [Exemplos de commits corretos](#10-exemplos-de-commits-corretos)
11. [Exemplos de commits incorretos](#11-exemplos-de-commits-incorretos)
12. [Checklist antes de realizar um commit](#12-checklist-antes-de-realizar-um-commit)
13. [Checklist antes do Pull Request](#13-checklist-antes-do-pull-request)
14. [Regra geral](#14-regra-geral)

---

## 1. Objetivo

Este documento define o padrão obrigatório para criação de commits e o fluxo de versionamento utilizado pelo grupo.

O objetivo é manter o histórico do projeto organizado, padronizado, objetivo e fácil de compreender.

---

## 2. Estrutura obrigatória do commit

Todo commit deve seguir exatamente o formato:

```text
tipo: descrição
```

**Exemplo:**

```text
feat: adição de integração com omie
```

> **Atenção:** não deve ser utilizado escopo no commit.

❌ **Formato não permitido:**

```text
feat(omie): adição de integração
```

---

## 3. Tipos de commit permitidos

Somente os tipos abaixo podem ser utilizados.

| Tipo | Utilização | Exemplo |
|---|---|---|
| `feat` | Adição de uma nova funcionalidade | `feat: adição de filtro por período` |
| `fix` | Correção de um problema ou comportamento incorreto | `fix: correção do cálculo de saldo` |
| `docs` | Criação ou alteração de documentação | `docs: criação da documentação da api` |
| `refactor` | Alteração estrutural do código sem mudança de comportamento | `refactor: divisão do módulo financeiro` |
| `test` | Criação ou alteração de testes | `test: criação dos testes do serviço` |
| `chore` | Tarefas gerais de manutenção e configuração | `chore: atualização das configurações do projeto` |
| `build` | Alterações relacionadas a build, dependências ou sistema de compilação | `build: atualização das dependências` |
| `ci` | Alterações relacionadas à integração e entrega contínuas | `ci: configuração do pipeline de validação` |
| `perf` | Alterações destinadas à melhoria de desempenho | `perf: otimização da consulta financeira` |
| `style` | Alterações de formatação ou estilo sem mudança de comportamento | `style: padronização da formatação do código` |

> Não devem ser criados tipos personalizados.

---

## 4. Regras para a descrição

### 4.1 Idioma

Os commits devem ser escritos em português.

✅ **Correto:**

```text
feat: adição de integração com omie
```

❌ **Incorreto:**

```text
feat: add omie integration
```

### 4.2 Início da descrição

A descrição deve começar com a ação de forma nominalizada.

**Exemplos:**

```text
adição
criação
correção
divisão
remoção
atualização
configuração
implementação
otimização
padronização
```

✅ **Correto:**

```text
feat: adição de integração com omie
fix: correção do tratamento de erros
docs: criação da documentação da api
refactor: divisão do módulo financeiro
```

❌ **Incorreto:**

```text
feat: adicionar integração com omie
fix: corrigir tratamento de erros
docs: criar documentação da api
refactor: dividir módulo financeiro
```

### 4.3 Primeira letra

A descrição deve começar com letra minúscula.

✅ **Correto:**

```text
feat: adição de integração com omie
```

❌ **Incorreto:**

```text
feat: Adição de integração com omie
```

### 4.4 Objetividade

Não existe um limite rígido de caracteres, porém o commit não deve possuir uma descrição excessivamente longa.

✅ **Correto:**

```text
fix: correção do cálculo de despesas
```

❌ **Incorreto:**

```text
fix: correção de um problema que estava acontecendo em determinadas situações quando o sistema recebia alguns tipos específicos de dados e acabava realizando um cálculo incorreto
```

### 4.5 Pontuação final

Não é obrigatório utilizar ponto final na descrição.

**Preferencialmente:**

```text
feat: adição de filtro por período
```

### 4.6 Termos genéricos

Termos genéricos podem ser utilizados quando acompanhados da especificação da alteração.

Não devem ser utilizados sozinhos.

❌ **Incorretos:**

```text
fix: correção
chore: ajuste
chore: alterações
chore: mudanças
test: teste
```

✅ **Corretos:**

```text
fix: correção do cálculo de saldo
chore: ajuste das configurações do projeto
chore: alterações nas configurações do ambiente
test: criação dos testes de autenticação
```

---

## 5. Uma alteração lógica por commit

Cada commit deve representar uma única alteração lógica.

Alterações diferentes não devem ser agrupadas no mesmo commit.

✅ **Exemplo correto (dois commits separados):**

```text
fix: correção do cálculo de despesas
feat: adição do filtro por período
```

❌ **Não deve ser feito:**

```text
feat: adição do filtro e correção do cálculo de despesas
```

A separação permite identificar com clareza o que foi alterado em cada etapa.

---

## 6. Identificação do desenvolvedor

O nome do desenvolvedor não deve ser inserido manualmente na mensagem do commit.

❌ **Não fazer:**

```text
feat: adição de integração com omie - João
```

A autoria do commit deve ser registrada pelo próprio Git por meio da configuração de usuário do ambiente.

---

## 7. Cards do GLPI

O código do card do GLPI não deve ser inserido na mensagem do commit.

❌ **Não fazer:**

```text
feat: C3 adição de integração com omie
```

O código do card deve estar presente no nome da branch.

✅ **Exemplo:**

```text
feature/analise_dados[C3]
```

Dessa forma, a associação entre desenvolvimento e card é feita pela branch, mantendo a mensagem do commit limpa e padronizada.

---

## 8. Padrão de branches

As branches de desenvolvimento devem conter o código do card correspondente do GLPI.

**Exemplo:**

```text
feature/analise_dados[C3]
```

O nome da branch não precisa corresponder ao tipo utilizado nos commits.

Uma mesma branch pode conter commits de diferentes tipos, desde que cada commit siga as regras deste documento.

**Exemplo:**

```text
feature/analise_dados[C3]

feat: adição de consulta de dados
fix: correção do tratamento de erros
test: criação dos testes da consulta
docs: criação da documentação da consulta
```

---

## 9. Fluxo de desenvolvimento

O fluxo de trabalho deve seguir esta sequência:

```text
develop
   ↓
criação da branch com o código do card
   ↓
desenvolvimento
   ↓
criação dos commits padronizados
   ↓
validação da alteração
   ↓
aprovação por outro integrante
   ↓
abertura do Pull Request
   ↓
integração da alteração
```

### 9.1 Criação da branch

A branch deve ser criada a partir da `develop` e deve conter o código do card do GLPI.

**Exemplo:**

```text
feature/analise_dados[C3]
```

### 9.2 Desenvolvimento

Durante o desenvolvimento, cada alteração lógica deve ser registrada em um commit separado.

Os commits devem seguir integralmente o padrão definido neste documento.

### 9.3 Validação

Antes da abertura do Pull Request, a alteração deve passar por uma validação.

A validação deve verificar, no mínimo:

- funcionamento da alteração;
- ausência de alterações não relacionadas à tarefa;
- organização do código;
- cumprimento do padrão de commits;
- correspondência entre a alteração e o card do GLPI.

### 9.4 Aprovação

A alteração deve ser aprovada por outro integrante do grupo antes da abertura do Pull Request.

A aprovação não deve ser realizada pelo próprio desenvolvedor que executou a alteração.

### 9.5 Pull Request

Após a validação e aprovação, o Pull Request pode ser aberto para integração da alteração.

O Pull Request deve conter somente alterações relacionadas à tarefa desenvolvida na branch.

---

## 10. Exemplos de commits corretos

```text
feat: adição de integração com omie
feat: criação de consulta de funcionários
fix: correção do tratamento de erros
fix: correção do cálculo de despesas
docs: criação da documentação da api
docs: atualização da documentação da integração
refactor: divisão do módulo financeiro
refactor: reorganização do serviço de autenticação
test: criação dos testes da integração
test: atualização dos testes de autenticação
chore: atualização das configurações do projeto
build: atualização das dependências
ci: configuração do pipeline de validação
perf: otimização da consulta financeira
style: padronização da formatação do código
```

---

## 11. Exemplos de commits incorretos

### 11.1 Sem tipo

```text
adição de integração com omie
```

### 11.2 Com escopo

```text
feat(omie): adição de integração
```

### 11.3 Descrição iniciando com letra maiúscula

```text
feat: Adição de integração com omie
```

### 11.4 Descrição iniciando com verbo no infinitivo

```text
feat: adicionar integração com omie
```

### 11.5 Nome do desenvolvedor no commit

```text
feat: adição de integração com omie - João
```

### 11.6 Código do card no commit

```text
feat: C3 adição de integração com omie
```

### 11.7 Tipo não permitido

```text
update: atualização da integração
```

### 11.8 Descrição genérica

```text
fix: correção
```

### 11.9 Alterações lógicas diferentes no mesmo commit

```text
feat: adição do filtro e correção do cálculo de despesas
```

---

## 12. Checklist antes de realizar um commit

Antes de criar um commit, verificar:

- [ ] O commit possui um tipo permitido.
- [ ] O formato é `tipo: descrição`.
- [ ] Não existe escopo.
- [ ] A mensagem está em português.
- [ ] A descrição começa com letra minúscula.
- [ ] A descrição começa com uma ação nominalizada.
- [ ] A descrição é objetiva.
- [ ] O commit não possui apenas uma expressão genérica.
- [ ] O nome do desenvolvedor não foi colocado na mensagem.
- [ ] O código do card não foi colocado na mensagem.
- [ ] O commit representa apenas uma alteração lógica.
- [ ] O commit pertence ao card da branch atual.

---

## 13. Checklist antes do Pull Request

Antes de abrir o Pull Request, verificar:

- [ ] A branch foi criada a partir da `develop`.
- [ ] A branch possui o código do card do GLPI.
- [ ] Todos os commits seguem este padrão.
- [ ] As alterações estão relacionadas ao card.
- [ ] A alteração foi validada.
- [ ] Outro integrante realizou a aprovação.
- [ ] Não existem alterações não relacionadas à tarefa.

---

## 14. Regra geral

Todo integrante do grupo deve seguir este documento ao criar commits e participar do fluxo de versionamento.

O padrão deve ser aplicado de forma consistente em todas as branches e tarefas do projeto.

**Exemplo de fluxo completo:**

```text
develop
   ↓
feature/analise_dados[C3]
   ↓
feat: adição de consulta de dados
   ↓
fix: correção do tratamento de erros
   ↓
test: criação dos testes da consulta
   ↓
validação
   ↓
aprovação
   ↓
Pull Request
   ↓
integração
```
