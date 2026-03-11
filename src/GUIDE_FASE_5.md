# Guia de Homologação - Fase 5

Este roteiro foi preparado para validar a entrega completa da Fase 5 do GCON: consolidação de contratos, gestão de TRP, prorrogações, realinhamentos e alertas da Gestora.

## Páginas

- Dashboard da Gestora: `/gestora`
- Gestão de Contratos: `/gestora/gestao-contratos`
- Contratos e TRP: `/gestora/contratos-trp`
- Processos / Kanban de Compras (Admin): `/admin`
- Processos / Kanban de Compras (Comprador): `/comprador`

## Massa de dados sugerida

Os registros UAT criados para esta fase usam os identificadores abaixo:

- Processos gatilho: `UAT-F5-PROC-001`, `UAT-F5-PROC-002`
- Contratos: `UAT-F5-CTR-001`, `UAT-F5-CTR-002`, `UAT-F5-CTR-003`

## Cenário 1: sair do Kanban e gerar um Contrato real

1. Acesse `/admin` com perfil Admin ou `/comprador` caso o processo esteja visível para o seu usuário.
2. Abra a aba de processos consolidados.
3. Localize um processo com status `Finalizado`, como `UAT-F5-PROC-001`.
4. Clique no ícone de visualizar para abrir `Detalhes do Processo`.
5. Confira a mensagem: `Este processo foi homologado. Clique abaixo para iniciar a gestão de vigência e aditivos.`
6. Clique em `Gerar Contrato/Consolidar`.
7. Valide o feedback de sucesso e feche o modal.

Resultado esperado:

- o contrato passa a existir na tabela `public.contratos` com vínculo ao processo original;
- o identificador principal exibido continua sendo o `numero_requisicao` ou o `numero_contrato`, nunca um número solto.

## Cenário 2: encontrar esse contrato na aba de Contratos vs TRP

1. Acesse `/gestora/contratos-trp`.
2. Na aba `Contratos`, pesquise pelo número `UAT-F5-PROC-001` ou pelo contrato gerado.
3. Verifique que a coluna principal mostra o identificador amigável do contrato.
4. Vá para a aba `TRP Ativos`.
5. Pesquise por `UAT-F5-PROC-002` caso o processo tenha sido consolidado como TRP.

Resultado esperado:

- contratos aparecem separados de TRPs conforme modalidade e metadados;
- a coluna de processo mostra `numero_requisicao` legível;
- não devem aparecer identificadores curtos ou enigmáticos como `2`.

## Cenário 3: aprovar um realinhamento e ver o percentual calculado pelo banco

1. Acesse a área de realinhamento pelo menu da Gestora.
2. Localize o item do contrato `UAT-F5-CTR-001`.
3. Confira a coluna `Variação`; ela deve mostrar o percentual calculado automaticamente pelo banco.
4. Passe o mouse sobre o botão `Aprovar` para visualizar o tooltip explicativo.
5. Clique em `Aprovar`.
6. Em outro item pendente, como o de `UAT-F5-CTR-002`, passe o mouse sobre `Rejeitar` e depois clique no botão.
7. Preencha a justificativa e confirme a rejeição.

Resultado esperado:

- a coluna `Ações` fica visível para Admin/Gestora;
- o status muda sem recarregar a página, via Realtime;
- a coluna `Variação` reflete o cálculo automático da coluna gerada `variacao_percentual`.

## Verificações rápidas adicionais

- Em `/gestora`, confirme que o card `Vencendo em 30 dias` considera `UAT-F5-CTR-002`.
- Em `/gestora/gestao-contratos`, valide badges `Ativo`, `Próximo ao Vencimento` e `Vencido`.
- Em `/gestora/gestao-contratos`, confirme que a edição de vigência continua exibindo `numero_contrato` como referência principal.
