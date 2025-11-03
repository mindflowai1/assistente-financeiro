# 📅 Sistema de Lembretes com WhatsApp

## 🎯 Visão Geral

Sistema simples para criar lembretes que são enviados automaticamente no WhatsApp via N8N quando chegar a hora.

### ✅ Como Funciona:

1. **Usuário cria lembrete** → Salvo no Supabase (status: 'pendente')
2. **N8N monitora Supabase** → Verifica lembretes pendentes periodicamente (a cada 15 min)
3. **Quando chegar a hora** → N8N envia WhatsApp para o usuário
4. **Status atualizado** → Lembrete marcado como 'enviado'

---

## 🚀 Configuração Rápida

### 1. Criar Tabela no Supabase

Execute o SQL: **`CRIAR_TABELA_LEMBRETES_ULTRA_SEGURO.sql`**

### 2. Verificar Tabela

Execute o SQL: **`VERIFICAR_TABELA_LEMBRETES.sql`** para confirmar que tudo está OK.

### 3. Configurar N8N

Siga o guia completo: **`GUIA_COMPLETO_N8N_WHATSAPP.md`**

---

## 📋 Arquivos Essenciais

### SQL
- **`CRIAR_TABELA_LEMBRETES_ULTRA_SEGURO.sql`** - Criar tabela (versão final)
- **`VERIFICAR_TABELA_LEMBRETES.sql`** - Verificar se tudo está OK
- **`BACKUP_RAPIDO.sql`** - Verificação rápida do estado

### Documentação
- **`GUIA_COMPLETO_N8N_WHATSAPP.md`** - Guia completo passo-a-passo do N8N
- **`GUIA_BACKUP_SUPABASE.md`** - Como fazer backup
- **`README_LEMBRETES.md`** - Este arquivo

### Código
- **`pages/RemindersPage.tsx`** - Página React para gerenciar lembretes

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

## 🔄 Fluxo Completo

```
1. Usuário cria lembrete no frontend
   ↓
2. Lembrete salvo no Supabase (status: 'pendente')
   ↓
3. N8N executa a cada 15 minutos
   ↓
4. N8N busca lembretes pendentes com telefone
   ↓
5. N8N envia WhatsApp para cada usuário
   ↓
6. N8N atualiza status para 'enviado'
   ↓
7. ✅ Usuário recebe notificação no WhatsApp!
```

---

## ✅ Checklist

- [ ] Tabela `reminders` criada no Supabase
- [ ] Tabela verificada (todos os campos OK)
- [ ] Workflow N8N criado e configurado
- [ ] Integração WhatsApp configurada
- [ ] Teste realizado com sucesso
- [ ] WhatsApp enviado corretamente
- [ ] Status atualizado para 'enviado'

---

## 🎯 Vantagens

✅ **Muito simples** - Usa infraestrutura que você já tem  
✅ **Sem complexidade** - Sem Google OAuth, sem tokens  
✅ **Automático** - N8N faz tudo automaticamente  
✅ **Notificações no WhatsApp** - Onde o usuário já está  
✅ **Integrado** - Usa mesmo sistema de WhatsApp que já funciona  

---

## 📚 Documentação

- **Guia Completo N8N:** `GUIA_COMPLETO_N8N_WHATSAPP.md`
- **Guia de Backup:** `GUIA_BACKUP_SUPABASE.md`

---

**Desenvolvido para:** Assistente Financeiro  
**Data:** 2024

