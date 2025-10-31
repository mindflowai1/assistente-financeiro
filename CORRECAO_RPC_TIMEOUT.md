# 🔧 Correção do Timeout no RPC

## ✅ O que foi feito:

1. **Desabilitado `persistSession` e `detectSessionInUrl`** no cliente Supabase
   - Essas opções podem causar conflitos com React
   - No arquivo HTML isolado funcionou porque não tinha essas opções

2. **Adicionados logs de debug** para rastrear o problema

3. **Timeout aumentado para 10 segundos**

---

## 🧪 TESTE AGORA:

### 1. **Recarregue a aplicação:**
```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

### 2. **Acesse:**
```
http://localhost:3000/#/reset-password
```

### 3. **Abra o Console (F12)** e observe os novos logs:

Você deve ver:
```
📡 [ResetPassword] Verificando cliente Supabase...
📡 [ResetPassword] Cliente existe: true
📡 [ResetPassword] Método rpc existe: function
📡 [ResetPassword] Promise criada: true
📡 [ResetPassword] É Promise? true
```

### 4. **Tente trocar a senha**

---

## 📊 POSSÍVEIS RESULTADOS:

### ✅ **SUCESSO (esperado):**
```
📥 [ResetPassword] RESPOSTA RECEBIDA!
📥 [ResetPassword] Tempo de resposta: XXX ms
✅✅✅ [ResetPassword] SENHA ATUALIZADA COM SUCESSO!
```

### ❌ **AINDA DÁ TIMEOUT:**
Se ainda der timeout, os logs vão mostrar:
- Se o cliente existe
- Se o método rpc existe
- Se a Promise é criada corretamente

**Nesse caso, há um problema mais profundo de configuração.**

---

## 🔄 **SE AINDA NÃO FUNCIONAR:**

Teste com a versão ABSOLUTAMENTE SIMPLES do Supabase:

1. **Edite `services/supabase.ts`:**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Sem nenhuma configuração adicional!
```

2. **Teste novamente**

3. **Se funcionar:** Adicione as opções uma por uma para identificar qual causa o problema

---

## 💡 **POR QUE FUNCIONOU NO HTML E NÃO NO REACT?**

- **HTML**: Cliente Supabase simples, sem configurações complexas
- **React**: Tem `persistSession`, `detectSessionInUrl`, e integração com `AuthContext`
- **Conflito**: Essas opções podem estar causando o bloqueio do RPC

---

## 🎯 **PRÓXIMO PASSO:**

1. Teste agora e me envie os logs
2. Se ainda der timeout, modificamos para a versão simples do cliente
3. Identificamos exatamente qual opção causa o problema

