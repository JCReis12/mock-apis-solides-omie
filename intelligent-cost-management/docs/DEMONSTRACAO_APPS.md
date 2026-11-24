# Dados demonstrativos dos aplicativos da 2RPnet

O arquivo [connected-apps.json](../src/data/mocks/connected-apps.json) contém o cenário demonstrativo dos **16 alvos mapeados** no contexto 2RPnet / Inovanet. A existência de um alvo no inventário não comprova conexão ou contratação em produção.

Abra `/monitoramento`: sem API agregada configurada, o cenário aparece automaticamente com o aviso **Dados fictícios**. O botão **Baixar dados JSON** exporta o mesmo arquivo usado pelos cards. Em cada card, **Origem e alvo observado** apresenta as referências oficiais e os limites do exemplo.

## Origem e interpretação

A pesquisa em fontes oficiais em **24/11/2026** orienta os recursos e os indicadores possíveis. **Todos os números, estados, incidentes e execuções são fictícios**. Documentação pública não fornece a telemetria privada da 2RPnet. Os nomes de indicadores administrativos são definidos pelo projeto, não campos de resposta ou endpoints oficiais.

| Alvo                 | Referência oficial                                                                                                                                                                                                               | Indicadores do exemplo                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Sólides              | [API de Gestão](https://gestaoapidocs.solides.com.br/)                                                                                                                                                                           | Colaboradores, departamentos e pendências cadastrais                             |
| Omie                 | [Catálogo de APIs](https://developer.omie.com.br/service-list/)                                                                                                                                                                  | Lançamentos financeiros e conciliação                                            |
| Onfly                | [Guia de integração](https://lp.onfly.com.br/ajuda/como-integrar-a-api-da-onfly)                                                                                                                                                 | Despesas de viagem e hospedagem                                                  |
| Flash                | [Manual de integração](https://docs.api.flashapp.services/)                                                                                                                                                                      | Cadastros e convites; erro de autorização ilustrativo                            |
| Vixting              | [Saúde ocupacional](https://www.vixting.com.br/gestao-de-saude-ocupacional/)                                                                                                                                                     | Admissões, atestados e documentos pendentes                                      |
| Clude                | [Plataforma corporativa](https://clude.com.br/clude/)                                                                                                                                                                            | Cadastros administrativos e pendências                                           |
| SulAmérica / Wellhub | [Movimentação cadastral](https://www.sulamerica.com.br/saude/0073_0001_0297_cond_gerais_fit.pdf), [gestão e elegibilidade](https://wellhub.com/pt-br/blog/beneficios-e-programas-de-bem-estar/portais-de-bem-estar-corporativo/) | Beneficiários de saúde e elegíveis/cadastrados no bem-estar, separados por fonte |
| Porto Seguro         | [Seguro de vida empresarial](https://venda.portoseguro.com.br/seguro-de-vida-para-empresas)                                                                                                                                      | Vidas na relação administrativa e movimentações pendentes                        |
| Alura                | [Relatório de licenças](https://suporte-empresas.alura.com.br/relat%C3%B3rio-de-licen%C3%A7as)                                                                                                                                   | Licenças atribuídas/disponíveis e solicitações à administração                   |
| SENAI                | [Orientações de matrícula](https://www.sp.senai.br/unidade/bauru/duvidas-e-orientacoes)                                                                                                                                          | Formulários, matrículas e pendências; processo varia por unidade                 |
| SharePoint           | [Arquivos/bibliotecas](https://learn.microsoft.com/en-us/graph/api/resources/driveitem), [throttling](https://learn.microsoft.com/graph/throttling)                                                                              | Documentos previstos, backups concluídos e pendências                            |
| Sindpd               | [Atendimento oficial](https://sindpd.org.br/atendimento/)                                                                                                                                                                        | Fila de e-mails proposta pelo projeto, sem envio real                            |
| E-mail → Sólides     | [Mensagens no Graph](https://learn.microsoft.com/en-us/graph/api/resources/message), [Sólides](https://gestaoapidocs.solides.com.br/)                                                                                            | Recebimentos e mapeamentos propostos; provedor de e-mail não confirmado          |
| Autentique           | [Webhooks atuais](https://docs.autentique.com.br/api/integration-basics/webhooks)                                                                                                                                                | Documentos concluídos e assinaturas pendentes                                    |
| Agente externo       | [Gemini Enterprise](https://docs.cloud.google.com/gemini/enterprise/docs)                                                                                                                                                        | Contadores e quatro etapas definidos pelo projeto                                |
| Portal interno       | [Web Vitals](https://web.dev/articles/vitals)                                                                                                                                                                                    | LCP/INP/CLS simulados em p75, separados da duração p95 da verificação            |

O acesso real depende de credenciais, contratos e, quando aplicável, do plano contratado. O exemplo preserva Alura por solicitação à administração, SENAI em análise e Jurídico fora das automações. Não contém dados pessoais, prontuários, diagnósticos, tokens ou respostas privadas dos fornecedores. O agrupamento SulAmérica / Wellhub mantém o inventário existente e não mistura os denominadores de seus indicadores.

## Estrutura do JSON

- `mode: "demo"` e `provenance.synthetic: true` identificam a origem fictícia.
- `generatedAt` é a referência fixa `2026-11-24T15:00:00Z` (12h em Brasília). O relógio do cenário fica nessa referência para permitir demonstrações futuras sem renovar artificialmente a observação.
- `observations[]` guarda um registro por `systemId`, incluindo saúde e estado da integração simulados, fonte, janela, validade e métricas técnicas.
- `demo.officialReferences[]` registra URL, título, data da pesquisa e exatamente o que a fonte fundamenta.
- `demo.businessMetrics[]` guarda identificador, rótulo, valor, unidade, competência `2026-10` e `basis: "project_demo"`.
- `demo.checks` contém 60 verificações fictícias por adaptador, totais de sucesso/falha, histograma de duração e período `14:00–15:00 UTC`. Nas rotinas sem coleta técnica, é `null`.
- `execution` ilustra falha na consulta financeira e Consolidação não executada; não representa execução real do chatbot.

Disponibilidade = `100 × sucessos / total`. Taxa de erro = `100 × falhas / total`. P95 usa nearest-rank: durações ordenadas, posição `ceil(0.95 × total)`, incluindo falhas. A latência descreve o adaptador fictício, não o SLA nem a velocidade real do fornecedor. Erro de autorização e manutenção deixam taxas e p95 sem valor.

Os contadores de colaboradores, departamentos e despesas reconciliam com a base financeira existente: **120 pessoas, 4 departamentos, 360 despesas em outubro, sendo 240 Onfly**. Os outros contadores representam cenários administrativos independentes, sem alterar valores financeiros. No caso da Flash, os números pertencem à última base fictícia do arquivo; não são resultado da consulta com token recusado.

## Manutenção e validação

Na pasta da aplicação:

```powershell
npm.cmd run demo:generate
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
npx.cmd playwright test tests/monitoring-ui.spec.ts --project=desktop --project=tablet --project=mobile
```

Edite os cenários e referências em `scripts/generate-connected-apps-demo.mjs` e regenere o JSON. A geração é determinística e não faz chamadas de rede. O navegador importa o arquivo local; o download do build aponta para um ativo JSON versionado pelo Vite. A API agregada continua aceitando exclusivamente `mode: "live"`; não aponte `VITE_MONITORING_API_URL` para o JSON demonstrativo. O coletor pontual `monitor:collect` e seu arquivo `public/mock-monitoring.json` permanecem independentes.
