# Empresas e Parcerias: Tipos de Dados Recebidos

> **Data:** 3 de novembro de 2026  
> **Autor:** @henrique  

---

## Visão Geral

Das empresas e parcerias da arquitetura, só **OMIE**, **Sólides**, **Autentique** e os serviços **Microsoft** e **Google** entregam dado estruturado por API; as demais entregam planilha, XML ou PDF.  
Itens com **(validar)** foram identificados apenas pelo logotipo.

---

## Mapeamento de Tipos de Dados

| Empresa / Parceria | Área | Tipos de Dado que Vêm Dela |
| :--- | :--- | :--- |
| **OMIE** | Financeiro | Contas a pagar e a receber, lançamentos, notas, clientes e fornecedores (API, JSON) |
| **Santander** | Financeiro | Extrato (OFX), retorno de boleto e pagamento (CNAB), comprovantes (PDF) |
| **Safra** | Financeiro | Extrato (OFX), retorno de boleto e pagamento (CNAB), comprovantes (PDF) |
| **Bradesco** | Financeiro e Clientes | Extrato (OFX), CNAB, comprovantes (PDF); como cliente, contrato e medição (PDF, planilha) |
| **Flash** | Financeiro e People | Despesas de cartão, faturas e recibos (planilha, PDF); benefícios, saldos e recargas por colaborador (planilha, PDF) |
| **Onfly** | Financeiro | Reembolsos e viagens, comprovantes (planilha, PDF, imagem) |
| **Excel (FDC)** | Financeiro | Fluxo de caixa previsto e realizado (planilha XLSX, preenchida à mão) |
| **Prefeitura de Sorocaba** | Financeiro | Notas fiscais de serviço (XML, PDF) |
| **Prefeitura de Santana de Parnaíba** | Financeiro | Notas fiscais de serviço (XML, PDF) |
| **Contabil Plus 10** *(validar)* | Financeiro | Balancete, razão, DRE (PDF, planilha); arquivos SPED (TXT) |
| **Outlook** | Financeiro | E-mails com anexos: boletos, notas, contratos (mensagem, PDF, XML, planilha) |
| **SAP Ariba** | Comercial | Editais e propostas de concorrência (PDF, DOCX, planilha) |
| **Coupa** | Comercial | Editais e propostas de concorrência (PDF, DOCX, planilha) |
| **Autentique** | Jurídico | Contratos assinados (PDF); signatários, datas e status (API, JSON) |
| **Legal (símbolo de balança)** *(validar)* | Jurídico | Contratos e instrumentos (PDF, DOCX) e dados do contrato |
| **Padizzi** *(validar)* | Financeiro e DP | Relatórios, guias e documentos contábeis e de pessoal (PDF, planilha, XML) |
| **SharePoint** | Todas | Arquivos de qualquer tipo (backup); lista de arquivos (API) |
| **Sólides** | People | Colaboradores, ponto, férias, afastamentos, folha, seleção, desempenho (API, JSON; relatórios em planilha; holerite em PDF) |
| **Wellhub** | People | Lista de elegíveis e uso mensal (CSV), fatura (PDF) |
| **SulAmérica** | People | Movimentação de beneficiários (planilha), fatura (PDF); dado de saúde |
| **Clude** | People | Uso agregado do benefício de saúde mental (relatório) *(validar)* |
| **Porto Seguro** | People | Apólice e fatura (PDF), movimentação de vidas (planilha) |
| **Alura** | People | Matrículas, progresso e certificados (relatório CSV) |
| **SENAI** | People | Turmas, presença e certificados (PDF, planilha) |
| **Edupulses** | People | Respostas e notas de quiz (CSV) *(validar)* |
| **Vixting (Onboarding)** | People | Documentos de admissão: RG, CPF, comprovantes (PDF, imagem); status (API) |
| **Vixting (SST)** | People | ASO, exames, riscos e acidentes (PDF); eventos do eSocial (XML) |
| **Correios** | People e Infra | Rastreio de envios (API, JSON); fatura (PDF, XML) |
| **Loggi** | People e Infra | Rastreio de envios (API, JSON); fatura (PDF, XML) |
| **BRFour** *(validar)* | DP | Guias, holerites e movimentação de pessoal (PDF, planilha) |
| **G Group** | DP | Contrato, medição e nota fiscal do serviço de limpeza (PDF, planilha, XML) |
| **Arquida** *(validar)* | DP | Apólices e boletos de seguros (PDF) |
| **Ourho** | DP | Horas de mão de obra temporária (planilha), fatura e nota (PDF, XML) |
| **VT Privado** | DP | Pedido e retorno de recarga de vale-transporte (planilha), boleto (PDF) |
| **SindPD** | DP | Convenção coletiva e guias sindicais (PDF); dado de filiação |
| **eSocial** | DP | Eventos do trabalhador, recibos e retornos (XML, PDF) |
| **Tecban** *(validar)* | Clientes | Contratos, medições e notas (PDF, planilha, portal) |
| **Nimbi** *(validar)* | Clientes | Status de notas, pedidos e pagamento (portal, upload de XML e PDF) |
| **Techsocial** *(validar)* | Clientes | A definir |
| **Claro Empresas** | Infra | Fatura detalhada de telefonia e internet (PDF, CSV), nota de telecom (XML) |
| **Vivo Empresas** | Infra | Fatura detalhada de telefonia (PDF, CSV), nota de telecom (XML) |
| **Hit Communications** | Infra | Fatura de telefonia (PDF, CSV), nota de telecom (XML) |
| **VNO** | Infra | Fatura de internet (PDF), nota (XML) |
| **Ingram Micro** | Infra | Pedidos e faturas de licenças de software (PDF, XML, CSV) |
| **TD SYNNEX** | Infra | Consumo e fatura de cloud (CSV, PDF, XML) |
| **Lenovo** | Infra | Notas e propostas de hardware (PDF, XML), números de série (planilha) |
| **Parque Tecnológico de Sorocaba** | Infra | Boletos e contratos de espaço físico (PDF) |
| **Perícia Forense** | Infra | Laudos (PDF) e notas de serviço (PDF, XML); conteúdo restrito |
| **Google Cloud (GCP)** | Infra | Custo de uso (exportação nativa para o BigQuery) |
| **Google Workspace** | Infra | Usuários, licenças e logs de auditoria (API, JSON) |
| **Microsoft Azure** | Infra | Custos (CSV, JSON de exportação agendada) |
| **Microsoft Teams** | Infra | Relatórios de uso (API, CSV) |
| **Copilot** | Infra | Uso por usuário (relatório) *(validar)* |
| **Microsoft Entra ID** | Infra | Lista de usuários e grupos, datas de criação e desativação (API, JSON) |
| **Microsoft AD** | Infra | Computadores e políticas do domínio (texto, LDAP) |
| **Azure DevOps** | Infra | Tarefas, quadros e sprints (API, JSON) |
| **Bitbucket** *(validar)* | Infra | Repositórios, commits e pull requests (API, JSON) |
| **Builderall** | Infra | Recibos de assinatura do site (PDF, e-mail) |
| **Porkbun** | Infra | Recibos de domínio (PDF, e-mail) |
| **OpenVPN** | Infra | Usuários e logs de acesso (texto, JSON) |
| **Qwiklabs** | Infra e People | Progresso de trilhas técnicas por usuário (relatório CSV) *(validar)* |
| **GLPI** | Infra | Chamados de TI (banco MySQL ou API, JSON) |
| **Grafana / Prometheus** | Infra | Métricas e painéis (séries temporais, JSON) |
| **OCS Inventory** | Infra | Inventário de máquinas e software (banco MySQL, CSV) |
| **TrueNAS** | Infra | Uso de armazenamento (arquivos, API) |
| **Wazuh** | Infra | Alertas de segurança (JSON) |
| **Vault** | Infra | Sem dado de negócio; guarda chaves e senhas dos conectores |
| **Code CI** | Infra | Execuções de build e deploy (logs, JSON) |

