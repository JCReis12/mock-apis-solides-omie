# Chatbot do projeto

## Objetivo

O projeto tem como objetivo a automação interna de backoffice, conectando ferramentas e reduzindo tarefas manuais em RH, Financeiro, benefícios, documentos e comunicação. O chatbot é desenvolvido externamente e será integrado como canal de consulta da equipe sobre esses processos. A gestão de custos é um dos casos de uso.

O nome do projeto permanece **Gestão de custos**, conforme a orientação do responsável. O destaque e a demonstração apresentam o objetivo de automação interna de backoffice e a integração prevista ao chatbot externo.

## Situação atual

Em **25/11/2026**, o responsável forneceu o [endereço do ambiente do chatbot da equipe](https://vertexaisearch.cloud.google.com/home/cid/cae0cdf7-035a-4e16-b30d-e41fd77960ae/r/agent-flow-builder/13380483809853947665?hl=en_US). O front-end agora oferece **Acessar chatbot**, abrindo exatamente esse endereço em uma nova aba. O link fica centralizado em `src/data/chatbot.ts` e é compartilhado pela home, pela demonstração e pelas chamadas das páginas institucionais.

O endereço fornecido usa a rota **`agent-flow-builder`** no Google Cloud. Ele é o destino de navegação indicado pela equipe; não foi confirmado como URL pública de conversa ou como endpoint de API. A abertura efetiva depende da conta Google e das permissões no ambiente. A pesquisa sem autenticação não conseguiu acessar a página. Nenhuma conversa, alteração no agente ou execução foi realizada para validar o link.

O componente `src/components/ui/ChatbotButton.tsx` é um link com aparência de botão, habilitado, com `target="_blank"` e `rel="noopener noreferrer"`. O rótulo acessível informa a abertura em nova aba. Os testes verificam a URL, a navegação por teclado e a preservação da página original, interceptando o destino externo sem autenticar ou executar o agente real.

O agente externo, descrito pela equipe no Gemini Enterprise, utiliza duas APIs mock baseadas na documentação das plataformas reais. Sua publicação para usuários finais, histórico e exportação de eventos ainda precisam de confirmação; a existência do link não comprova telemetria configurada. Consulte o [guia de integração e verificação dos mocks](INTEGRACAO_APIS_MOCK.md).

A rota `/demonstracao` apresenta a proposta, o vídeo ainda pendente e o caso de custos por seletores. Não há implementação de chatbot, histórico, campo de pergunta, respostas simuladas, serviço de mensagens ou adaptador de agente neste repositório.

Os valores fictícios do dashboard, do catálogo e da consulta por seletores continuam usando a mesma regra de consolidação.

## Fluxo informado do agente externo

```text
Manual Trigger
  → Consulta RH (Sólides)
  → Consulta Financeiro (Omie)
  → Consolidação
```

As consultas a Sólides e Omie fazem **requisições separadas**. A Consolidação é um **nó próprio, após a consulta à Omie**, conforme a confirmação mais recente do responsável. Essa confirmação atualiza a estrutura anterior do documento de contexto, que agrupava a consulta financeira e a consolidação no mesmo nó.

Segundo a equipe, as respostas são elaboradas com base na **documentação oficial de Sólides e Omie**. As referências específicas dos documentos não foram fornecidas; seu uso no agente externo não foi verificado neste repositório. A informação não define mecanismo de busca documental, consulta em tempo real aos documentos ou contrato de API específico.

O fluxo é apresentado na rota `/demonstracao`. Sua execução pertence ao agente externo; esta interface não dispara essas requisições enquanto sua integração não estiver configurada.

## Acesso configurado e dependências externas

O desenvolvimento do chatbot pertence à equipe externa. O direcionamento solicitado está configurado pelo link fornecido; o front-end não incorpora a conversa nem recria o agente. A validação autenticada das permissões e das consultas cabe à equipe responsável pelo ambiente.

Uma integração futura por API, a leitura de execuções e uma eventual URL publicada para usuários finais dependem de contratos e acessos próprios. Nenhuma dessas capacidades é presumida a partir do endereço do Flow Builder. A [issue #92](https://github.com/Jukamargo/frontend-pi-gestao-de-custos/issues/92) acompanha o aceite do direcionamento; as dependências de credenciais e telemetria continuam em #124 e #123.

A automação dos processos e a consulta pelo chatbot são partes relacionadas da solução. A execução real de cadastros, e-mails e backups pertence às integrações a implementar.
