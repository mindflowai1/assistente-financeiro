# 🔍 Diagnóstico Completo do Supabase

## O que foi implementado

Adicionei um **sistema de diagnóstico automático** que roda quando você acessa a página de Reset de Senha.

---

## Como testar

1. **Abra o navegador** e vá para: `http://localhost:3000/#/reset-password`
2. **Abra o Console** (F12)
3. **Observe os logs** que aparecerão automaticamente

---

## Interpretação dos resultados

### ✅ CENÁRIO IDEAL (tudo funcionando)
```
═══════════════════════════════════════
🔍 DIAGNÓSTICO COMPLETO DO SUPABASE
═══════════════════════════════════════
1️⃣ Testando sessão do usuário...
   Sessão: ✅ ATIVA
   User ID: xxxxx-xxxxx-xxxxx
   Email: seu@email.com
   Token presente: true

2️⃣ Testando auth.uid()...
   Usuário: ✅ ENCONTRADO

3️⃣ Testando chamada RPC genérica...
   ⚠️ RPC retornou erro (normal): function ping() does not exist

4️⃣ Testando função change_user_password...
   ✅ Função respondeu em XXX ms
   Resposta: {success: false, message: "Senha atual incorreta."}
═══════════════════════════════════════
```

### ❌ CENÁRIO PROBLEMÁTICO #1: Timeout em RPC
```
3️⃣ Testando chamada RPC genérica...
   ❌❌❌ TIMEOUT! Supabase não está respondendo RPCs
   ⚠️ ESTE É O PROBLEMA PRINCIPAL!
```
**CAUSA:** Problema nas credenciais ou projeto do Supabase

### ❌ CENÁRIO PROBLEMÁTICO #2: Função não existe
```
4️⃣ Testando função change_user_password...
   ⚠️ Erro: function public.change_user_password does not exist
```
**CAUSA:** Você não executou o SQL do arquivo `CRIAR_FUNCAO_SUPABASE.sql`

### ❌ CENÁRIO PROBLEMÁTICO #3: Sessão inativa
```
1️⃣ Testando sessão do usuário...
   Sessão: ❌ INATIVA
```
**CAUSA:** Você não está logado

---

## O que fazer se encontrar erros

### 1. Se RPC está dando TIMEOUT

**Verifique as credenciais do Supabase:**

1. Vá para o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUz...` (chave longa)

5. Cole em `services/supabase.ts`:
```typescript
const supabaseUrl = 'SUA_URL_AQUI';
const supabaseAnonKey = 'SUA_CHAVE_AQUI';
```

### 2. Se a função não existe

Execute o SQL em: https://supabase.com/dashboard/project/SEU_PROJETO/sql

```sql
-- Cole TODO o conteúdo do arquivo CRIAR_FUNCAO_SUPABASE.sql
```

### 3. Se não está logado

Faça login primeiro em: `http://localhost:3000/#/auth`

---

## Verificação adicional

### Testar conexão direta

Abra o Console do navegador e execute:

```javascript
// Testar se o Supabase está configurado
console.log('URL:', supabase.auth.getSession());

// Testar se você está logado
supabase.auth.getUser().then(r => console.log('User:', r));

// Testar uma chamada RPC simples
supabase.rpc('change_user_password', {
  current_password: 'teste',
  new_password: 'teste123'
}).then(r => console.log('RPC:', r));
```

---

## Próximos passos

Depois de executar o diagnóstico, **copie TODOS os logs do console** e me envie para que eu possa identificar exatamente qual é o problema.

