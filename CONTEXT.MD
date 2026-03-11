1. Visão Geral do Projeto

O GCON é uma plataforma institucional para gerir o ciclo de vida completo de compras, desde a Requisição de Compra (RC) até a gestão de Contratos, Aditivos e Realinhamentos de Preços.

Tech Stack:

Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS.

UI: Shadcn/UI, Lucide React (Ícones).

Backend/Banco: Supabase (PostgreSQL, Auth, Storage, Realtime).

Gerenciamento de Estado: React Hooks (useEffect, useMemo, useState) + Supabase Realtime.

🏛️ 2. Arquitetura de Dados (Fase 7 - Atual)

Tabelas Principais:

public.processos: Fluxo de compras (Kanban).

public.processo_timeline: Histórico de auditoria de cada processo.

public.documentos: Repositório central de arquivos (Contratos, Manuais, RCs).

public.contratos: (Nova) Dados definitivos de contratos após a fase de compra.

public.prorrogacoes: (Nova) Solicitações de aumento de vigência/prazo.

public.historico_prorrogacoes: (Nova) Registro imutável de aditivos aprovados.

public.realinhamentos: (Nova) Pedidos de reequilíbrio econômico-financeiro por item.

public.penalidades: (Nova) Registro operacional de penalidades aplicadas a fornecedores.

public.desistencias: (Nova) Registro de desistências formais vinculadas ao processo de compra.

public.auditoria_logs: (Nova) Trilha automática de auditoria para mudanças sensíveis do sistema.

public.notificacoes: (Nova) Caixa de notificações por usuário com suporte a Realtime.

public.faq: (Nova) Base de conhecimento institucional para FAQ e assistente virtual.

Regra de Ouro Técnica:

Coluna Gerada: Na tabela realinhamentos, a coluna variacao_percentual é calculada automaticamente pelo PostgreSQL (GENERATED ALWAYS AS ... STORED). O frontend NUNCA deve tentar enviar este campo.

IDs Humanos: Sempre preferir exibir numero_contrato ou numero_requisicao na UI, usando o id (UUID) apenas para chaves lógicas.

⚖️ 3. Regras de Negócio e Perfis

Admin: Visão total, Dashboards globais, gestão de usuários.

Comprador: Gere seus processos, solicita prorrogações e realinhamentos.

Gestora de Contratos: Foco exclusivo nos processos que já viraram Contratos/TRPs. Aprova/Rejeita aditivos e realinhamentos.

Requisitante: Acompanha o status das suas RCs e consulta documentos públicos.

Fluxo GCON: Processo Finalizado (Compras) ➔ Cadastro de Contrato (Gestão) ➔ Ciclo de Aditivos/Realinhamentos.

🚩 4. Status de Implementação (Roadmap)

Fase 4 (Concluída - 100%):

[x] Dashboards (Admin, Comprador, Gestora) integrados ao Supabase com Realtime.

[x] Central de Documentos funcional com Upload para Bucket Privado e Signed URLs.

[x] RLS de documentos (Requisitante vê apenas documentos marcados como 'Público').

Fase 5 (Concluída - 100%):

[x] Infraestrutura SQL das 4 tabelas novas e RLS.

[x] contratosService.ts implementado com todas as funções CRUD e Joins.

[x] ProrrogacoesModule.tsx integrado ao banco real (respeitando RN PRD005).

[x] RealinhamentoPrecosModule.tsx integrado com fluxo decisório de aprovação/rejeição.

[x] Módulos de listagem de Contratos e TRP refatorados para `getContratos()`, com alertas de vencimento e Realtime.
[x] Ponte de consolidação implementada entre `public.processos` e `public.contratos`.
[x] Dashboard da Gestora migrado para a tabela `public.contratos`.

🛠️ 5. Próximos Passos Imediatos (Etapa 1 da Fase 5)

O objetivo atual é eliminar os últimos mocks estruturais das telas da Gestora.

Tarefas Prioritárias:

Refatorar gestao-contratos/page.tsx: Substituir arrays mockados pelo getContratos() do service.

Refatorar contratos-trp/page.tsx: Conectar à tabela real e separar logicamente Contratos de TRPs.

Cálculo de Alertas: Implementar lógica no front para identificar contratos a menos de 30 dias do vencimento (baseado em data_fim_atual).

Zerar Realinhamento: Finalizar os botões de Aprovar/Rejeitar no módulo de Realinhamento ligando-os ao service.

Atualização da sessão (11/03/2026):

- `src/app/(dashboard)/gestora/gestao-contratos/page.tsx` agora consome `getContratos()`, exibe `numero_contrato`, deriva o status de vencimento com base em `data_fim_atual ?? data_fim_original`, persiste vigência com `updateContrato()` e escuta alterações da tabela `public.contratos` via Realtime.
- `src/app/(dashboard)/gestora/contratos-trp/page.tsx` deixou de usar mocks, passou a separar Contratos e TRPs com `useMemo` a partir da tabela `public.contratos`, usando `numero_contrato`, metadados do processo e modalidade para classificação, além de Realtime na mesma tabela.
- `src/components/features/processos/ProcessosModule.tsx` e `src/components/features/processos/DetalhesProcessoModal.tsx` agora permitem gerar o contrato oficial a partir de processos consolidados elegíveis, chamando `createContrato()` com vínculo em `processo_id` e promovendo a rastreabilidade entre Compras e Gestão.
- `src/components/features/processos/RealinhamentoPrecosModule.tsx` passou a permitir decisão de Gestora/Admin com botões de Aprovar/Rejeitar integrados a `updateRealinhamentoStatus()`, mantendo atualização automática por Realtime.
- `src/app/(dashboard)/gestora/page.tsx` foi migrado para `getContratos()` e agora calcula métricas e alertas com base em `data_fim_atual ?? data_fim_original`, sincronizando o dashboard com a fonte oficial da Fase 5.
- Polimento de entrega (11/03/2026): identificadores da Gestora foram revisados para priorizar `numero_contrato` e `numero_requisicao`, o CTA de consolidação ficou autoexplicativo no modal de detalhes, a coluna de ações do realinhamento recebeu tooltips e foi criado o roteiro `src/GUIDE_FASE_5.md` para homologação UAT.
- Operacionalização final (11/03/2026): a tabela `public.realinhamentos` recebeu a coluna `parecer_gestao`, o service passou a persistir o parecer nas decisões de aprovação/rejeição e o primeiro identificador exibido nas listas de Contratos, TRPs e Realinhamentos foi padronizado para códigos humanos. Fase 5 validada como 100% operacional.

Fase 6 (Iniciada):

- [x] Tabelas `public.penalidades` e `public.desistencias` criadas no Supabase.
- [x] Políticas RLS aplicadas para leitura por Admin/Comprador/Gestora e escrita restrita a Admin/Comprador.
- [x] Regra LGPD contemplada por arquivamento manual via status `Arquivada`.
- [x] `src/services/penalidadesService.ts` criado com joins em fornecedores/processos, criação e atualização de status.
- [x] `GerenciadorPenalidades.tsx` refatorado para dados reais, separação entre ativas/arquivadas e Realtime em `public.penalidades`.
- [x] Documentos de penalidades sincronizados com `documentosService.ts`, incluindo upload real para `documentos-processos` e downloads assinados.
- [x] `DesistenciasModule.tsx` implementado com listagem real, registro de desistências, upload opcional de documento e Realtime em `public.desistencias`.
- [x] Fornecedores passaram a exibir aba de `Histórico de Riscos` com penalidades e desistências por fornecedor.

Fase 7 (Concluída - 100%):

- [x] Tabela `public.auditoria_logs` criada com função `processar_auditoria()` e triggers em `processos`, `contratos`, `penalidades`, `fornecedores` e `profiles`.
- [x] Tabela `public.notificacoes` criada com RLS por `auth.uid()` e Realtime habilitado na publicação `supabase_realtime`.
- [x] Serviços `src/services/auditoriaService.ts` e `src/services/notificacoesService.ts` criados para leitura de logs e operação da caixa de notificações.
- [x] Tabela `public.faq` criada com RLS para leitura autenticada de itens ativos e gestão exclusiva do perfil admin, incluindo massa inicial de conhecimento.
- [x] `src/services/faqService.ts` criado e integrado à Central de Ajuda e ao `chatbot-widget` sem uso de mocks.
- [x] Notificações automáticas de negócio adicionadas em `contratosService.ts`, `penalidadesService.ts` e `processosService.ts` para eventos de prorrogação, penalidade e consolidação.
- [x] Rotina `processarAlertasVencimento()` criada em `src/services/notificacoesService.ts` para gerar alertas automáticos de vencimento em 30, 15 e 5 dias para contratos e certificados de fornecedores.
- [x] Central de Ajuda passou a listar apenas `Downloads Institucionais` reais da tabela `documentos`, filtrando categoria `Institucional` ou arquivos públicos.
- [x] QA final da Fase 7 executado com `node ./node_modules/typescript/bin/tsc --noEmit` sem erros.
- [x] Função SQL `public.verificar_vencimentos_diarios()` criada para notificar vencimentos de contratos e certificados diretamente no banco.
- [x] Contestação de penalidade passou a gerar alerta automático para o perfil admin com o título `Nova Defesa Registrada`.
- [x] Correções de compliance aplicadas: auditoria passou a capturar IP a partir dos headers da requisição, busca de FAQ passou a consultar o banco com filtro textual e a Central de Ajuda restringe documentos não públicos para o perfil requisitante.

📝 6. Guia para o Agente

Ao receber instruções, sempre verifique:

Service Pattern: Use as funções existentes em @/services/....

Design Pattern: Siga os padrões Shadcn/UI e os componentes de BadgeStatus para cores e estados.

Realtime: Garanta que cada tela refatorada tenha uma subscrição ativa para refletir mudanças instantaneamente.
