# Guidelines de Badges - Sistema SGCS

## Visão Geral
Este documento define as regras e padrões para uso de badges (chips/etiquetas de status) no Sistema de Gestão de Contratos e Suprimentos (SGCS), garantindo consistência visual e semântica em todo o protótipo.

---

## Princípios de UX

1. **Clareza Visual**: Badges devem comunicar o status de forma imediata e inequívoca
2. **Hierarquia de Importância**: Cores mais vibrantes indicam estados que requerem atenção
3. **Consistência**: O mesmo status deve sempre usar a mesma cor e estilo em todo o sistema
4. **Acessibilidade**: Contraste adequado entre texto e fundo (WCAG AA no mínimo)
5. **Scanability**: Fácil identificação visual durante a leitura rápida de tabelas

---

## Tipos de Badges

### 1. Badges Sólidas (Background colorido + Texto branco)
**Quando usar**: Para status críticos, definitivos ou que requerem atenção imediata.

#### Status Disponíveis:

**Ativo** - `bg-green-600 text-white border-transparent`
- Uso: Entidades operacionais e em pleno funcionamento
- Contexto: Fornecedores, usuários, processos, contratos
- Significado: Operacional, disponível, válido

**Inativo** - `bg-gray-500 text-white border-transparent`
- Uso: Entidades temporariamente desabilitadas
- Contexto: Fornecedores, usuários, processos pausados
- Significado: Não operacional, mas não excluído

**Arquivado** - `bg-blue-600 text-white border-transparent`
- Uso: Entidades preservadas mas fora do fluxo ativo
- Contexto: Fornecedores antigos, processos concluídos, documentos históricos
- Significado: Preservado, consultável, não aparece em listagens padrão

**Bloqueado por exceção** - `bg-red-600 text-white border-transparent`
- Uso: Entidades impedidas de operar por questões regulatórias/legais
- Contexto: Fornecedores com penalidades, processos suspensos
- Significado: Crítico, requer resolução antes de reativação

**Em Andamento** - `bg-blue-600 text-white border-transparent`
- Uso: Processos ou atividades em execução
- Contexto: Processos licitatórios, migrações, envios
- Significado: Ativo, em progresso

**Concluído** - `bg-green-600 text-white border-transparent`
- Uso: Processos finalizados com sucesso
- Contexto: Processos, migrações, envios, tarefas
- Significado: Finalizado com êxito

**Cancelado** - `bg-gray-500 text-white border-transparent`
- Uso: Processos ou atividades interrompidos
- Contexto: Processos cancelados, solicitações negadas
- Significado: Interrompido sem conclusão

**Pendente** - `bg-yellow-600 text-white border-transparent`
- Uso: Aguardando ação ou aprovação
- Contexto: Processos, documentos, aprovações
- Significado: Requer ação, em espera

---

### 2. Badges Suaves (Background claro + Texto escuro)
**Quando usar**: Para status informativos ou menos críticos.

#### Status Disponíveis:

**Válido** - `bg-green-100 text-green-800 border-green-200`
- Uso: Documentos, atestados, certificados em vigência
- Contexto: Atestados técnicos, licenças, certificações
- Significado: Dentro do prazo de validade

**Vencido** - `bg-red-100 text-red-800 border-red-200`
- Uso: Documentos, atestados, prazos expirados
- Contexto: Atestados vencidos, licenças expiradas
- Significado: Fora do prazo, requer renovação

**Em Análise** - `bg-blue-100 text-blue-800 border-blue-200`
- Uso: Itens sob revisão ou avaliação
- Contexto: Documentos, solicitações, recursos
- Significado: Sendo analisado, aguardando parecer

**Aprovado** - `bg-green-100 text-green-800 border-green-200`
- Uso: Itens que receberam aprovação
- Contexto: Documentos, solicitações, recursos
- Significado: Autorizado, pode prosseguir

**Rejeitado** - `bg-red-100 text-red-800 border-red-200`
- Uso: Itens que não foram aprovados
- Contexto: Documentos, solicitações, recursos
- Significado: Negado, não autorizado

**Aguardando** - `bg-yellow-100 text-yellow-800 border-yellow-200`
- Uso: Itens em fila de espera
- Contexto: Documentos, processos, ações
- Significado: Em espera, não urgente

**Rascunho** - `bg-gray-100 text-gray-800 border-gray-200`
- Uso: Itens em edição, não finalizados
- Contexto: Documentos, relatórios, processos
- Significado: Em elaboração, não oficial

---

## Regras de Aplicação

### Regra 1: Hierarquia de Criticidade
Use badges **sólidas** (fundo colorido + texto branco) quando:
- O status requer atenção imediata
- Representa um estado definitivo/crítico
- Tem impacto direto em operações do sistema
- Exemplos: Bloqueado, Ativo, Arquivado, Concluído

Use badges **suaves** (fundo claro + texto escuro) quando:
- O status é informativo
- Representa um estado temporário/transitório
- Não bloqueia operações
- Exemplos: Válido, Vencido, Em Análise, Aguardando

### Regra 2: Consistência de Cores

#### Verde
- **Sólido**: Estados positivos, operacionais, ativos
- **Suave**: Aprovações, validações, conformidade
- Significado: Sucesso, ok, positivo

#### Vermelho
- **Sólido**: Bloqueios críticos, exceções graves
- **Suave**: Vencimentos, rejeições, não conformidade
- Significado: Erro, crítico, atenção urgente

#### Azul
- **Sólido**: Arquivamento, processamento ativo
- **Suave**: Análise, revisão, informação
- Significado: Neutro informativo, processual

#### Amarelo/Laranja
- **Sólido**: Pendências que requerem ação
- **Suave**: Aguardando, em espera não urgente
- Significado: Alerta, atenção moderada

#### Cinza
- **Sólido**: Inativo, desabilitado, cancelado
- **Suave**: Rascunho, não definido
- Significado: Neutro, sem status definido

### Regra 3: Contexto de Uso

#### Em Tabelas
- Sempre use badges na coluna "Status"
- Alinhe à esquerda dentro da célula
- Uma badge por linha (não empilhe)
- Mantenha consistência vertical

#### Em Cards/Headers
- Use badges para destacar estado geral
- Posicione próximo ao título quando relevante
- Pode usar tamanho ligeiramente maior se necessário

#### Em Filtros
- O texto do filtro deve corresponder exatamente ao texto da badge
- Mantenha a mesma capitalização
- Exemplo: Se a badge é "Ativo", o filtro é "Ativo" (não "ATIVO" ou "ativo")

### Regra 4: Texto das Badges
- Use capitalização adequada (primeira letra maiúscula)
- Seja conciso (1-3 palavras no máximo)
- Evite abreviações a menos que universalmente conhecidas
- Exemplos corretos: "Ativo", "Em Análise", "Bloqueado por exceção"
- Exemplos incorretos: "ATIVO", "Analisando...", "Bloq. Exc."

### Regra 5: Combinação com Ícones
- Badges geralmente não precisam de ícones internos
- Se necessário, use ícone pequeno (12-14px) antes do texto
- Use apenas para reforçar significado crítico (ex: AlertCircle para "Bloqueado")
- Mantenha espaçamento de 4-6px entre ícone e texto

---

## Componente StatusBadge

### Implementação Padrão

```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    // Badges Sólidas
    'Ativo': { className: 'bg-green-600 text-white border-transparent' },
    'Inativo': { className: 'bg-gray-500 text-white border-transparent' },
    'Arquivado': { className: 'bg-blue-600 text-white border-transparent' },
    'Bloqueado por exceção': { className: 'bg-red-600 text-white border-transparent' },
    'Em Andamento': { className: 'bg-blue-600 text-white border-transparent' },
    'Concluído': { className: 'bg-green-600 text-white border-transparent' },
    'Cancelado': { className: 'bg-gray-500 text-white border-transparent' },
    'Pendente': { className: 'bg-yellow-600 text-white border-transparent' },
    
    // Badges Suaves
    'Válido': { className: 'bg-green-100 text-green-800 border-green-200' },
    'Vencido': { className: 'bg-red-100 text-red-800 border-red-200' },
    'Em Análise': { className: 'bg-blue-100 text-blue-800 border-blue-200' },
    'Aprovado': { className: 'bg-green-100 text-green-800 border-green-200' },
    'Rejeitado': { className: 'bg-red-100 text-red-800 border-red-200' },
    'Aguardando': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'Rascunho': { className: 'bg-gray-100 text-gray-800 border-gray-200' }
  };

  const variant = variants[status] || { className: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <Badge className={variant.className}>
      {status}
    </Badge>
  );
};
```

### Uso Recomendado

```tsx
// Em tabelas
<TableCell>
  <StatusBadge status={item.status} />
</TableCell>

// Em cards
<div className="flex items-center gap-2">
  <h3>Processo XYZ</h3>
  <StatusBadge status="Em Andamento" />
</div>

// Em filtros
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectContent>
    <SelectItem value="todos">Todos os Status</SelectItem>
    <SelectItem value="ativo">Ativo</SelectItem>
    <SelectItem value="inativo">Inativo</SelectItem>
    <SelectItem value="bloqueado por exceção">Bloqueado por exceção</SelectItem>
  </SelectContent>
</Select>
```

---

## Mapeamento por Tela

### Dashboard
- Processos: Ativo, Em Andamento, Concluído, Cancelado
- Alertas: (usar Alert component, não badges)

### Processos / Gerenciamento
- Status: Em Andamento, Concluído, Cancelado, Pendente
- Aprovações: Aprovado, Rejeitado, Em Análise, Aguardando

### Contratos e Fornecedores
- Fornecedores: Ativo, Inativo, Arquivado, Bloqueado por exceção
- Atestados: Válido, Vencido
- Contratos: Ativo, Vencido, Cancelado

### Histórico de Desistências
- Status: Registrado, Em Análise, Aprovado, Rejeitado

### Penalidades
- Status: Ativa, Suspensa, Cancelada, Cumprida
- Usar badges sólidas para todas (criticidade alta)

### Prorrogações de Processos
- Solicitações: Pendente, Aprovado, Rejeitado, Em Análise
- Contratos: Ativo, Vencido

### Usuários
- Usuários: Ativo, Inativo, Bloqueado
- Não usar "Arquivado" para usuários (usar apenas Ativo/Inativo)

### Documentos
- Status: Válido, Vencido, Em Análise, Aprovado, Rejeitado, Rascunho

### Integrações (Envio Automático)
- Envio: Pendente, Em Andamento, Concluído, Erro
- Envio: Aguardando, Enviado, Confirmado, Erro

### Relatórios
- Geração: Rascunho, Processando, Concluído, Erro

---

## Casos Especiais

### Status de Erro
Use badge sólida vermelha:
```tsx
<Badge className="bg-red-600 text-white border-transparent">
  Erro
</Badge>
```

### Status Personalizados
Se precisar criar um status novo:
1. Verifique se não existe equivalente na lista atual
2. Escolha o tipo (sólida ou suave) baseado na criticidade
3. Siga a paleta de cores estabelecida
4. Adicione ao componente StatusBadge
5. Documente neste arquivo

### Múltiplos Status
Evite mostrar múltiplas badges na mesma célula. Se necessário:
- Priorize o status mais crítico
- Use tooltip para mostrar informações adicionais
- Considere criar uma coluna separada

---

## Checklist de Implementação

Ao adicionar badges em uma nova tela, verifique:

- [ ] O status escolhido existe neste guideline?
- [ ] Está usando o tipo correto (sólida vs suave)?
- [ ] A cor reflete adequadamente a criticidade?
- [ ] O texto está capitalizado corretamente?
- [ ] Os filtros correspondem exatamente aos textos das badges?
- [ ] Está usando o componente StatusBadge ou equivalente?
- [ ] A badge tem contraste adequado (acessibilidade)?
- [ ] É consistente com outras telas similares?

---

## Exemplos de Implementação Completa

### Exemplo 1: Tabela de Fornecedores
```tsx
<TableCell>
  <StatusBadge status={fornecedor.status} />
</TableCell>

// Onde fornecedor.status pode ser:
// "Ativo" | "Inativo" | "Arquivado" | "Bloqueado por exceção"
```

### Exemplo 2: Tabela de Processos
```tsx
<TableCell>
  <StatusBadge status={processo.status} />
</TableCell>

// Onde processo.status pode ser:
// "Em Andamento" | "Concluído" | "Cancelado" | "Pendente"
```

### Exemplo 3: Filtro com Badge Matching
```tsx
// Select de filtro
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectContent>
    <SelectItem value="todos">Todos os Status</SelectItem>
    <SelectItem value="ativo">Ativo</SelectItem>
    <SelectItem value="inativo">Inativo</SelectItem>
  </SelectContent>
</Select>

// Lógica de filtro
const matchesStatus = statusFilter === 'todos' || 
  fornecedor.status.toLowerCase() === statusFilter;

// Badge na tabela
<StatusBadge status={fornecedor.status} />
// Renderiza com status original capitalizado: "Ativo"
```

---

## Atualizações e Versionamento

**Versão**: 1.0  
**Data**: 05/11/2024  
**Última Atualização**: 05/11/2024

### Histórico de Mudanças
- **v1.0** (05/11/2024): Versão inicial das guidelines de badges

---

## Referências

- Material Design 3 - Chips & Badges
- iOS Human Interface Guidelines - Indicators
- WCAG 2.1 - Color Contrast Guidelines
- Nielsen Norman Group - Status Indicators Best Practices