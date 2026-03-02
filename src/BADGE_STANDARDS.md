# Padrão de Badges do Sistema SGCS

## Objetivo
Garantir identificação visual rápida através de cores e pesos consistentes, permitindo que o usuário **"bata o olho e saiba do que se trata"**.

---

## Hierarquia de Pesos

### 🔴 Heavy (Destaque Máximo)
**Uso:** Decisões finais e estados críticos que exigem atenção imediata

**Status:**
- ✅ **Aprovado/Aprovada** - `success + heavy` - Verde forte (decisão positiva final)
- ❌ **Rejeitado/Rejeitada** - `danger + heavy` - Vermelho forte (decisão negativa final)
- ⚠️ **Vencendo/Próximo ao Vencimento** - `warning + heavy` - Amarelo forte (alerta crítico)
- 🔥 **Urgente** - `danger + heavy` - Vermelho forte (prioridade máxima)
- 🚫 **Bloqueado por Exceção** - `danger + heavy` - Vermelho forte (bloqueio crítico)

### 🟠 Medium (Atenção Moderada)
**Uso:** Estados operacionais, penalidades e trabalho em progresso

**Status:**
- 🔵 **Em Análise** - `info + medium` - Azul médio (análise técnica)
- 🟣 **Em Cotação/Em Cotação com Fornecedores** - `purple + medium` - Roxo (cotação - destaque especial)
- 🟡 **Em Andamento** - `warning + medium` - Amarelo médio (trabalho ativo)
- 🔵 **Em Contestação** - `info + medium` - Azul médio (penalidade em disputa)
- 🟠 **Devolvido ao Requisitante** - `orange + medium` - Laranja (necessita ação)
- 🟠 **Registrada** - `orange + medium` - Laranja (desistência registrada)
- 🔴 **Aplicada** - `danger + medium` - Vermelho médio (penalidade ativa)
- ✅ **Quitada** - `success + medium` - Verde médio (penalidade resolvida)

### ⚪ Light (Informativo Discreto)
**Uso:** Estados simples, prioridades de chamados e informações secundárias

**Status:**
- ✅ **Ativo** - `success + light` - Verde claro (estado ativo normal)
- ⚫ **Inativo** - `neutral + light` - Cinza claro (estado desabilitado)
- ✅ **Válido** - `success + light` - Verde claro (documento válido)
- 🔴 **Vencido** - `danger + light` - Vermelho claro (vencido mas discreto)

**Prioridades (sempre light):**
- 🔴 **Alta/Urgente** - `danger + light` - Vermelho claro
- 🟠 **Média** - `orange + light` - Laranja claro
- ⚫ **Baixa** - `neutral + light` - Cinza claro

---

## Mapeamento de Cores por Intenção

### 🟢 Success (Verde)
- Ações positivas, aprovações e estados ativos
- Heavy: Aprovações finais
- Medium: Conclusões intermediárias  
- Light: Estados ativos normais

### 🔵 Info (Azul)
- Processos em análise e contestações
- Sempre medium ou light

### 🟣 Purple (Roxo)
- Cotações com fornecedores (destaque especial)
- Perfis especiais (Administrador) e documentos contratuais
- Sempre medium

### 🟡 Warning (Amarelo)
- Alertas urgentes, vencimentos e trabalho em andamento
- Heavy: Vencimentos críticos
- Medium: Trabalho ativo em progresso

### 🔴 Danger (Vermelho)
- Rejeições, penalidades e bloqueios
- Heavy: Decisões finais negativas e bloqueios críticos
- Medium: Penalidades aplicadas
- Light: Vencimentos informativos e prioridades

### 🟠 Orange (Laranja)
- Atenção moderada, devoluções e registros
- Sempre medium ou light

### ⚫ Neutral (Cinza)
- Estados desabilitados, cancelados e inativos
- Sempre light ou medium

---

## Regras de Ouro

1. **Cada status tem UMA COR única** - Não repita cores para status diferentes
2. **Aprovado/Rejeitado sempre Heavy** - Decisões finais têm destaque máximo
3. **Ativo/Inativo sempre Light** - Estados simples não competem visualmente
4. **Prioridades sempre Light** - Para não sobrecarregar visualmente
5. **Processos em andamento têm cores diferentes:**
   - Em Análise = info/azul (análise técnica)
   - Em Cotação = purple/roxo (cotação com fornecedores)
   - Em Andamento = warning/amarelo (trabalho ativo)
6. **Penalidades usam cores únicas:**
   - Aplicada = danger (vermelho)
   - Em Contestação = info (azul)
   - Quitada = success (verde)
   - Registrada = orange (laranja)
7. **Sem ícones nas badges** - Texto limpo para identificação rápida

---

## Exemplos de Uso

### Tabela de Processos
```tsx
<BadgeNew intent="success" weight="heavy">Aprovado</BadgeNew>
<BadgeNew intent="danger" weight="heavy">Rejeitado</BadgeNew>
<BadgeNew intent="info" weight="medium">Em Análise</BadgeNew>
<BadgeNew intent="purple" weight="medium">Em Cotação</BadgeNew>
<BadgeNew intent="warning" weight="medium">Em Andamento</BadgeNew>
<BadgeNew intent="orange" weight="medium">Devolvido ao Requisitante</BadgeNew>
```

### Tabela de Fornecedores
```tsx
<BadgeNew intent="success" weight="light">Ativo</BadgeNew>
<BadgeNew intent="neutral" weight="light">Inativo</BadgeNew>
```

### Tabela de Penalidades
```tsx
<BadgeNew intent="danger" weight="medium">Aplicada</BadgeNew>
<BadgeNew intent="info" weight="medium">Em Contestação</BadgeNew>
<BadgeNew intent="success" weight="medium">Quitada</BadgeNew>
<BadgeNew intent="orange" weight="medium">Registrada</BadgeNew>
```

### Prioridades de Chamados
```tsx
<BadgeNew intent="danger" weight="light">Alta</BadgeNew>
<BadgeNew intent="orange" weight="light">Média</BadgeNew>
<BadgeNew intent="neutral" weight="light">Baixa</BadgeNew>
```

---

## Implementação Técnica

Todas as badges devem usar o componente `BadgeNew` importado de `/components/ui/badge-new.tsx`.

Para consistência, utilize as funções helper do arquivo `/lib/badge-mappings.ts`:

```tsx
import { getBadgeMappingForStatus, getBadgeMappingForPrioridade } from '../../lib/badge-mappings';

// Para status
<BadgeNew {...getBadgeMappingForStatus('Aprovado')}>
  Aprovado
</BadgeNew>

// Para prioridades
<BadgeNew {...getBadgeMappingForPrioridade('Alta')}>
  Alta
</BadgeNew>
```

---

**Última atualização:** 06/11/2025