# 📅 Sistema de Lembretes SIMPLES com WhatsApp

## 🎯 Visão Geral

Sistema **ultra simples** para criar lembretes que são enviados automaticamente no WhatsApp via N8N.

### ✅ Como Funciona:

1. **Usuário cria lembrete** → Salvo no Supabase
2. **N8N monitora Supabase** → Verifica lembretes pendentes periodicamente
3. **Quando chegar a hora** → N8N envia WhatsApp para o usuário
4. **Status atualizado** → Lembrete marcado como 'enviado'

---

## 🚀 Configuração Rápida

### 1. Criar Tabela no Supabase

Execute o SQL do arquivo `CRIAR_TABELA_LEMBRETES.sql` no Supabase SQL Editor.

### 2. Configurar N8N

Siga o guia completo em: **`GUIA_N8N_WHATSAPP.md`**

**Resumo:**
1. Crie workflow no N8N
2. Configure Schedule Trigger (executa a cada 15 minutos)
3. Conecte com Supabase para listar lembretes pendentes
4. Envie WhatsApp quando chegar a hora
5. Atualize status para 'enviado'

### 3. Usar a Aplicação

1. Faça login na aplicação
2. Vá em **Lembretes** no menu
3. Preencha o formulário:
   - **Título:** Nome do lembrete
   - **Data e Hora:** Quando você quer ser lembrado
   - **Descrição:** Detalhes adicionais (opcional)
   - **Tipo:** Conta a Pagar, Lembrete ou Outro
   - **Valor:** (se for Conta a Pagar)
4. Clique em **Criar Lembrete**
5. ✅ O N8N irá enviar WhatsApp quando chegar a hora!

---

## 📋 Estrutura da Tabela

```sql
reminders
├── id (UUID) - ID único
├── user_id (UUID) - ID do usuário
├── titulo (TEXT) - Título do lembrete
├── descricao (TEXT) - Descrição opcional
├── data_lembrete (TIMESTAMPTZ) - Data/hora do lembrete
├── status (TEXT) - pendente | enviado | cancelado
├── tipo (TEXT) - conta_pagar | lembrete | outro
├── valor (DECIMAL) - Valor (se for conta a pagar)
├── created_at (TIMESTAMPTZ) - Data de criação
└── updated_at (TIMESTAMPTZ) - Data de atualização
```

---

## 🔄 Fluxo Completo

```
1. Usuário cria lembrete no frontend
   ↓
2. Lembrete salvo no Supabase (status: 'pendente')
   ↓
3. N8N monitora Supabase periodicamente (a cada 15 min)
   ↓
4. N8N encontra lembretes pendentes com data_lembrete <= now()
   ↓
5. N8N busca telefone do usuário
   ↓
6. N8N envia WhatsApp para o usuário
   ↓
7. N8N atualiza status para 'enviado'
   ↓
8. Usuário recebe notificação no WhatsApp ✅
```

---

## 🎨 Funcionalidades

### ✅ Criar Lembretes
- Interface simples para criar lembretes
- Título obrigatório
- Data/hora obrigatória
- Descrição opcional
- Tipo: Conta a Pagar, Lembrete ou Outro
- Valor (se for Conta a Pagar)

### ✅ Visualizar Lembretes
- Organizados por status:
  - **Pendentes** (amarelo) - Aguardando envio
  - **Enviados** (verde) - Já enviados no WhatsApp
  - **Cancelados** (cinza) - Cancelados

### ✅ Excluir Lembretes
- Botão de exclusão em cada lembrete
- Confirmação antes de excluir

---

## 📝 Arquivos Criados

1. **`CRIAR_TABELA_LEMBRETES.sql`** - SQL para criar tabela no Supabase
2. **`pages/RemindersPage.tsx`** - Página React para gerenciar lembretes
3. **`GUIA_N8N_WHATSAPP.md`** - Guia completo de configuração do N8N
4. **`README_LEMBRETES_SIMPLES.md`** - Este arquivo

---

## 🎯 Vantagens desta Solução

✅ **Muito simples** - Usa infraestrutura que você já tem  
✅ **Sem complexidade** - Sem Google OAuth, sem tokens  
✅ **Automático** - N8N faz tudo automaticamente  
✅ **Notificações no WhatsApp** - Onde o usuário já está  
✅ **Integrado** - Usa mesmo sistema de WhatsApp que já funciona  

---

## ❓ Dúvidas Frequentes

### O lembrete não foi enviado no WhatsApp
→ Verifique se o N8N está configurado corretamente
→ Verifique se o workflow está ativo
→ Verifique logs do N8N
→ Verifique se o telefone do usuário está correto

### Como alterar o intervalo de verificação?
→ No N8N, ajuste o Schedule Trigger (pode ser a cada 5 min, 1 hora, etc.)

### Posso enviar lembretes antecipados?
→ Sim! Configure workflows separados para diferentes antecipações (1 dia antes, 1 hora antes, etc.)

### Como personalizar as mensagens?
→ No N8N, ajuste o formato da mensagem no nó WhatsApp/HTTP Request

---

## 🎉 Pronto!

Agora você tem um sistema completo de lembretes integrado com WhatsApp!

**Desenvolvido para:** Assistente Financeiro  
**Data:** 2024

