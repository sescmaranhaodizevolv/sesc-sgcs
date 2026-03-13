# Guia de Uso - Sistema de Toasts ACompra

## Importação

```typescript
import { toast } from '../../lib/toast-helpers';
// ou
import { toast } from '../lib/toast-helpers';
```

## Tipos de Toast

### 1. **Success** (Verde #00a63e)
Use para confirmação de ações bem-sucedidas.

```typescript
toast.success('Processo excluído com sucesso!');
toast.success('Dados salvos com sucesso!');
toast.success('Upload concluído!');
```

### 2. **Error** (Vermelho #d4183d)
Use para erros e falhas em operações.

```typescript
toast.error('Erro ao salvar os dados');
toast.error('Falha no upload do arquivo');
toast.error('Não foi possível conectar ao servidor');
```

### 3. **Info** (Azul #1964e5)
Use para informações gerais e avisos neutros.

```typescript
toast.info('Seu processo está em análise');
toast.info('Nova atualização disponível');
toast.info('Documento foi enviado para aprovação');
```

### 4. **Warning** (Laranja #f97316)
Use para alertas importantes e ações que requerem atenção.

```typescript
toast.warning('Este contrato está próximo do vencimento');
toast.warning('Verifique os dados antes de continuar');
toast.warning('Alguns campos obrigatórios não foram preenchidos');
```

## Exemplos Práticos

### Exclusão de Item
```typescript
const handleDelete = () => {
  // Lógica de exclusão
  toast.success('Item excluído com sucesso!');
};
```

### Salvamento de Formulário
```typescript
const handleSave = async () => {
  try {
    await saveData();
    toast.success('Dados salvos com sucesso!');
  } catch (error) {
    toast.error('Erro ao salvar os dados');
  }
};
```

### Validação de Formulário
```typescript
const handleSubmit = () => {
  if (!isValid) {
    toast.warning('Preencha todos os campos obrigatórios');
    return;
  }
  // Continuar com o submit
};
```

### Informação de Status
```typescript
const checkStatus = () => {
  if (status === 'pending') {
    toast.info('Seu processo está em análise');
  }
};
```

## Boas Práticas

1. **Mensagens claras e objetivas**: Use frases curtas e diretas
2. **Feedback imediato**: Mostre o toast logo após a ação do usuário
3. **Tipo apropriado**: Escolha o tipo de toast adequado para cada situação
4. **Evite spam**: Não mostre múltiplos toasts simultaneamente para a mesma ação
5. **Contexto**: Inclua informações relevantes na mensagem (ex: nome do item excluído)

## Cores do Sistema

- 🟢 **Success**: #00a63e (Verde Sesc)
- 🔴 **Error**: #d4183d (Vermelho)
- 🔵 **Info**: #1964e5 (Azul)
- 🟠 **Warning**: #f97316 (Laranja)

Todas as cores seguem o padrão WCAG AA para acessibilidade quando combinadas com texto branco.
