# 📋 Fluxo Hierárquico - Comprador e Administrador

## ✅ Implementação Concluída

### **Novo Status Adicionado:**
- **"Devolvido ao Administrador"** - Status intermediário quando o Comprador encontra problemas

---

## 🎯 **Hierarquia de Poderes Implementada**

### **👤 COMPRADOR (Nível Operacional)**

#### **✅ Pode fazer:**
1. **Devolver ao Administrador** (com justificativa obrigatória)
2. **Iniciar Processo** (configurar requisições atribuídas)
3. **Consolidar Processo**
4. **Atualizar status** para:
   - Aguardando Documentação
   - Em Análise
   - Aprovado
   - Finalizado
   - Cancelado

#### **❌ NÃO pode fazer:**
- **Rejeitar definitivamente** (decisão final é do Admin)
- **Devolver direto ao Requisitante** (passa pelo Admin primeiro)

---

### **👨‍💼 ADMINISTRADOR (Nível Estratégico)**

#### **✅ Pode fazer:**
1. **Rejeitar** (decisão final definitiva)
2. **Devolver ao Requisitante** (decisão final)
3. **Atribuir a Comprador**
4. **Reatribuir a outro Comprador**
5. **Receber devoluções do Comprador** e decidir:
   - Reatribuir para outro comprador
   - Devolver ao requisitante
   - Rejeitar definitivamente
   - Corrigir e devolver ao mesmo comprador

---

## 🔄 **Fluxo Correto de Processos**

```
┌─────────────────────────────────────────────────────┐
│  INTEGRAÇÃO MXM → Requisições Pendentes (Admin)    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  ADMIN atribui manualmente para COMPRADOR           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  COMPRADOR recebe na aba "Requisições Atribuídas"   │
│  e clica em "Iniciar Processo"                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  COMPRADOR preenche dados de governança e risco:    │
│  - Tipo (Modalidade)                                 │
│  - Classificação do Pedido                          │
│  - Bloqueio de Envio Automático                     │
│  - Datas de RC e Início                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Processo ativo em "Processos em Andamento"         │
└─────────────────────────────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
┌──────────────────────┐  ┌──────────────────────┐
│  COMPRADOR encontra   │  │  COMPRADOR finaliza  │
│  problema             │  │  com sucesso         │
└──────────────────────┘  └──────────────────────┘
            ↓                       ↓
┌──────────────────────┐  ┌──────────────────────┐
│  Devolver ao Admin    │  │  Aprovar/Consolidar  │
│  (com justificativa)  │  │                      │
└──────────────────────┘  └──────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│  ADMIN recebe devolução e decide:                   │
│  - Rejeitar definitivamente                         │
│  - Devolver ao Requisitante                         │
│  - Reatribuir para outro comprador                  │
└─────────────────────────────────────────────────────┘
```

---

## 📊 **Matriz de Status Atualizada**

| Status | Quem Define | Tipo | Reversível? |
|--------|-------------|------|-------------|
| **Em Análise** | Comprador | Operacional | ✅ Sim |
| **Devolvido ao Admin** | Comprador | Intermediário | ✅ Sim |
| **Devolvido ao Requisitante** | Admin | Decisão Final | ❌ Não* |
| **Aprovado** | Comprador/Admin | Decisão Final | ⚠️ Depende |
| **Rejeitado** | **Apenas Admin** | Decisão Final | ❌ Não |

*Requer nova requisição para reabrir

---

## 🎨 **Badges e Cores (Kanban)**

| Status | Cor | Peso | Justificativa |
|--------|-----|------|---------------|
| **Em Análise** | Azul (`blue-50/700`) | Medium | Análise técnica em andamento |
| **Devolvido ao Requisitante** | Laranja (`orange-50/700`) | Medium | Atenção moderada |
| **Devolvido ao Admin** | Amarelo (`yellow-50/700`) | Medium | Requer decisão gerencial |
| **Aprovado** | Verde (`green-50/700`) | Heavy | Decisão positiva final |
| **Rejeitado** | Vermelho (`red-50/700`) | Heavy | Decisão negativa final |

---

## 💡 **Justificativa de Governança**

### **Por que Comprador NÃO pode Rejeitar?**

1. **Segregação de Funções**: Quem executa ≠ Quem decide encerrar
2. **Accountability**: Admin responde institucionalmente pelas rejeições
3. **Auditoria**: Rejeições precisam de aprovação gerencial
4. **Segunda Opinião**: Admin pode discordar e reatribuir
5. **Transparência**: Requisitante recebe resposta oficial do Admin

---

## 🔧 **Arquivos Atualizados**

### 1. `/lib/badge-mappings.ts`
- ✅ Adicionado mapeamento para "Devolvido ao Administrador"
- Cor: `warning` (amarelo)
- Peso: `medium`

### 2. `/components/screens/Processos.tsx` (Admin)
- ✅ Status adicionado ao array `statusKanban`
- ✅ Configuração de coluna Kanban (amarelo)
- ✅ Filtros de status atualizados
- ✅ Array de status em `generateMockProcessos`

### 3. `/components/screens/MeusProcessosUpdated.tsx` (Comprador)
- ✅ Status adicionado ao array de processos
- ✅ Filtros de status atualizados

### 4. `/components/screens/DetalhesProcessoComprador.tsx`
- ✅ **Botão "Devolver ao Admin"** adicionado no header
- ✅ **Modal de justificativa** com validação obrigatória
- ✅ Alerta informativo explicando a ação
- ✅ Botão desabilitado se justificativa vazia
- ✅ Cores consistentes (laranja para atenção)

---

## 📝 **UX do Modal de Devolução**

```
┌───────────────────────────────────────────────┐
│  Devolver ao Administrador                    │
├───────────────────────────────────────────────┤
│                                                │
│  Você encontrou um problema que impede o      │
│  andamento? Devolva este processo ao          │
│  Administrador com uma justificativa          │
│  detalhada.                                   │
│                                                │
│  ⚠️ ATENÇÃO: O processo será retornado ao     │
│     Administrador para análise e decisão      │
│     sobre os próximos passos.                 │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ Justificativa da Devolução *            │  │
│  │                                         │  │
│  │ [Textarea com 5 linhas]                │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Esta justificativa será enviada ao           │
│  Administrador para análise.                  │
│                                                │
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Cancelar │  │ Confirmar Devolução ⚠️  │  │
│  └──────────┘  └──────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## ✅ **Checklist de Implementação**

- [x] Novo status "Devolvido ao Administrador" no badge-mappings
- [x] Status adicionado em arrays de processos (Admin e Comprador)
- [x] Status adicionado nos filtros de busca
- [x] Status adicionado no Kanban (com cor amarela)
- [x] Botão "Devolver ao Admin" no DetalhesProcessoComprador
- [x] Modal de justificativa obrigatória
- [x] Validação de campo obrigatório
- [x] Toast de confirmação
- [x] Removido poder de rejeição do Comprador
- [x] Documentação do fluxo hierárquico

---

## 🎓 **Próximos Passos (Sugestões)**

### Para Admin:
1. **Aba de Devoluções**: Criar aba específica "Devolvidos pelos Compradores"
2. **Ações em lote**: Permitir reatribuir múltiplas devoluções
3. **Histórico**: Mostrar quantas vezes processo foi devolvido

### Para Comprador:
4. **Dashboard**: Adicionar card "Aguardando Análise do Admin"
5. **Notificações**: Alertar quando Admin retornar processo

### Melhorias UX:
6. **Filtro de devoluções** no Admin para priorizar análise
7. **Indicador visual** de processos com múltiplas devoluções
8. **Template de justificativas** comuns para agilizar

---

## 🔐 **Compliance e Auditoria**

### **Rastreabilidade**
- ✅ Toda devolução exige justificativa escrita
- ✅ Status intermediário permite auditoria de fluxo
- ✅ Decisões finais (Rejeitar) apenas por nível gerencial

### **Governança**
- ✅ Separação clara de responsabilidades
- ✅ Aprovações em camadas hierárquicas
- ✅ Documentação de decisões administrativas

---

**Data de Implementação:** 17/12/2024  
**Status:** ✅ Completo e funcional
